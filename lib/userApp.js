const Crypto = require('crypto');
const Bcrypt = require('bcrypt');
const Nodemailer = require('nodemailer');
const Logger = require('@voliware/logger');
const User = require('./user');
const UserDatabase = require('./userDatabase');

/**
 * User management application.
 */
class UserApp {
    
    /**
     * Constructor
     * @param {object} [options={}]
     * @param {object} [options.database]
     * @param {string} [options.database.host="localhost"] - mongodb host
     * @param {number} [options.database.port=27017] - mongodb port
     * @param {string} {options.database.username=""} - mongodb username
     * @param {string} [options.database.password=""] - mongodb password
     * @param {string} [options.database.namespace=""] - mongodb namespace, requires username/password
     * @returns {UserApp}
     */
    constructor(options = {}){  
        this.options = {
            database: {
                name: "user"
            }
        };   
        Object.extend(this.options, options);
        this.logger = new Logger(this.constructor.name, {level: "debug"});        
        this.db = new UserDatabase(this.options.database);
        return this;
    }

    /**
     * Generate a random buffer of data using crypto.
     * Convert to a string.
     * @param {number} size - size in bytes
     * @async
     * @returns {Promise<string>} string
     */
    async generateRandomString(size){
        let self = this;
        return new Promise(function(resolve, reject){
            Crypto.randomBytes(size, function(err, buffer){
                if(err){
                    self.logger.error(err);
                    reject(null);
                }
                else {
                    resolve(buffer.toString('hex'));
                }
            });
        });
    }

    /**
     * Add a user.
     * Must be performed by a user with admin rights.
     * @param {object} client - the client requesting the action
     * @param {object} user
     * @param {object} [options] 
     * @async
     * @returns {Promise<boolean>} true on success
     */
    async addUser(client, user, options){
        if(client.level === User.level.admin){
            this.logger.warning("Failed to add user: not authorized");
            return false;
        }
        return this.db.insertUser(user, options);
    }

    /**
     * Delete a user.
     * Must be performed by a user with admin rights
     * or if the client and user are the same.
     * @param {object} client - the client requesting the action
     * @param {object} [filter] 
     * @param {object} [options] 
     * @async
     * @returns {Promise<boolean>} true on success
     */
    async deleteUser(client, filter, options){
        if(client.level === User.level.admin || client._id === user._id){
            this.logger.warning("Failed to delete user: not authorized");
            return false;
        }
        return this.db.deleteUser(filter, options);
    }

    /**
     * Get a users
     * Must be performed by a user with admin rights
     * or if the client and user are the same.
     * @param {object} client - the client requesting the action
     * @param {object} [filter] 
     * @param {object} [options] 
     * @async
     * @returns {Promise<object>} user
     */
    async getUser(client, filter, options){
        let user = await this.db.getUser(filter, options);
        if(!user){
            return null;
        }

        if(client.level === User.level.admin || client._id === user._id){
            return user;
        }
        else {
            this.logger.warning("Failed to get user: not authorized");
            return null;
        }
    }

    /**
     * Get all users
     * Must be performed by a user with admin rights.
     * @param {object} client - the client requesting the action
     * @param {object} [filter] 
     * @param {object} [options] 
     * @async
     * @returns {Promise<array>} users
     */
    async getUsers(client, filter, options){
        if(client.level !== User.level.admin){
            this.logger.warning("Failed to get users: not authorized");
            return [];
        }
        
        let cursor = await this.db.getUsers(filter, options);
        return new Promise((resolve, reject) => {
            cursor.toArray(function(error, result){
                if(error){
                    reject(error)
                }
                else {
                    for(let i = 0; i < result.length; i++){
                        delete result[i].password;
                    }
                    resolve(result);
                }
            });
        });
    }

    /**
     * Login a user.
     * Find the user based on username.
     * Validate the supplied password.
     * Log them in if the password is valid.
     * Add a new session to their session list.
     * @param {string} username 
     * @param {string} password - plaintext password
     * @param {string} ip
     * @param {string} browser 
     * @async
     * @returns {Promise<object>} user
     */
    async loginUser(username, password, ip, browser){
        this.logger.debug(`Logging in user ${username}`);
        this.logger.verbose(`username:${username}, ip:${ip}, browser:${browser}`);

        // get user
        let user = await this.db.getUser({username});
        if(!user){
            return null;
        }

        // check password
        let isValid = await Bcrypt.compare(password, user.password);
        if(!isValid){
            this.logger.debug("Failed to login user: password");
            return null;
        }
        
        // delete all old sessions matching same ip/browser
        await this.db.deleteSessions(user._id, ip, browser);
        
        // add new session
        user.sessionId = await this.generateRandomString(32);
        if(!user.sessionId){
            return null;
        }

        let result = await this.db.addSession(user._id, user.sessionId, ip, browser);
        if(!result){
            return null;
        }
        
        // hashed, but.. no
        delete user.password;
        this.logger.info(`Logged in user ${username}`);
        return user;
    }

    /**
     * Get a user with session data.
     * The sessionId, ip, and browser must match at
     * least one object the sessions array of a user document.
     * @param {string} sessionId 
     * @param {string} ip 
     * @param {string} browser 
     * @async
     * @returns {Promise<object>} user
     */
    async loginUserWithSessionId(sessionId, ip, browser){
        this.logger.debug("Logging in user with session information");
        this.logger.verbose(`sessionId:${sessionId}, ip:${ip}, browser:${browser}`);

        let filter = {
            sessions: {
                $elemMatch: {sessionId, ip, browser}
            }
        }

        // get user from session data
        let user = await this.db.getUser(filter)
        if(!user){
            return null;
        }

        // remove password
        // add session id
        delete user.password;
        user.sessionId = sessionId;
        this.logger.info(`Logged in user ${user.username}`);
        return user;
    }

    /**
     * Logout a user based on their session id.
     * Remove the session from the collection.
     * @param {string} sessionId
     * @async
     * @returns {Promise<boolean>} true on success
     */
    async logoutUser(sessionId){
        this.logger.debug(`Logging out user with session ${sessionId}`);

        let filter = {
            sessions: {
                $elemMatch: {sessionId}
            }
        };
        let params = {
            $pull: {
                sessions: {sessionId}
            }
        };
        let result = await this.db.updateUser(filter, params)
        if(result){
            this.logger.info('Logged out user');
            return true;
        }
        else {
            return false;
        }
    }

    /**
     * Register a user.
     * Performs a check for username uniqueness.
     * Hashes the incoming password.
     * Inserts the user into the collection.
     * @param {string} username
     * @param {string} password
     * @param {string} email
     * @async
     * @returns {Promise<object>} user object
     */
    async registerUser(username, password, email){
        this.logger.debug(`Registering user ${username}`);
        
        let element = await this.db.getUser({username})
        if(element){
            this.logger.debug(`Failed to register user: username ${username} already exists`);
            return null;
        }

        let hash = await Bcrypt.hash(password, 10);
        if(!hash){
            this.logger.error('Failed to register user: password hash failed');
            return null;
        }

        let user = {
            username: username,
            password: hash,
            email: email,
            registerDate: Date.now(),
            level: User.level.user
        };
        let result = await this.db.insertUser(user);
        if(result){
            this.logger.info(`Registered user ${username}`);
            return user;
        }
        else {
            this.logger.error('Failed to register user: db error');
            return null;
        }
    }

    /**
     * Reset a password.
     * Find the user based on the email.
     * Generate a password code.
     * Insert the password code into the collection.
     * Send the password reset email.
     * @param {string} email 
     * @async
     * @returns {Promise<boolean>} true on success
     */
    async resetPassword(email){
        let user = await this.db.getUser({email})
        if(!user){
            return null;
        }
        
        let code = await this.generateRandomString(32);
        if(!code){
            this.logger.error("Failed to reset password: did not generate session");
            return null;
        }

        let result = await this.insertResetPasswordCode(user._id, code);
        if(result){
            return this.sendResetPasswordEmail(email, code);
        }
        else {
            return false;
        }
    }

    /**
     * Update a user.
     * Must be performed by a user with admin rights
     * or if the client and user are the same.
     * @param {object} client - the client requesting the action
     * @param {object} [filter] 
     * @param {object} [options] 
     * @async
     * @returns {Promise<boolean>} true on success
     */
    async deleteUser(client, user, options){
        if(client.level === User.level.admin || client._id === user._id){
            this.logger.warning("Failed to delete user: not authorized");
            return false;
        }
        return this.db.updateUser(filter, options);
    }

    /**
     * Insert a password reset code into
     * a user's document in the user collection.
     * @param {string} userId
     * @param {string} code
     * @returns {Promise<boolean>} true on success
     */
    insertResetPasswordCode(userId, code){
        this.logger.debug(`Adding reset code ${code} to user ${userId}`);
        let params = {
            $set: {reset:code}
        };
        return this.db.updateUser({_id: userId}, params);
    }

    /**
     * Send an email to a user with the reset password link.
     * @param {string} email 
     * @param {string} code 
     * @async
     * @returns {Promise<boolean>} true on success
     */
    async sendResetPasswordEmail(email, code){
        this.logger.debug(`Sending reset password email to ${email}`);
        
        let testAccount = await Nodemailer.createTestAccount();
        let transporter = Nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: testAccount.user, // generated ethereal user
                pass: testAccount.pass // generated ethereal password
            }
        });

        let info = await transporter.sendMail({
            from: "Todo",
            to: email,
            subject: "Password Reset Request",
            text: "You've requested to reset your password. " +
                  "Please click this link to reset it. " +
                  "http://http://localhost:3000/reset?code= " + code,
            html: '<b>Hello world?</b>' // html body
        });
        return true;
    }

    /**
     * Initialize the app.
     * Initialize the db.
     * @returns {Promise}
     */
    initialize(){
        return this.db.initialize()
            .catch((error) => {
                this.logger.error(error.toString());
            });
    }
}

module.exports = UserApp;