const bcrypt = require('bcrypt');
const Mongo = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
const Logger = require('@voliware/logger');
const User = require('./user');
const UserSession = require('./userSession');

/**
 * User management application.
 */
class UserApp {
    
    /**
     * Constructor
     * @param {object} [options]
     * @param {object} [options.mongo]
     * @param {string} [options.mongo.host="localhost"] - mongodb host
     * @param {number} [options.mongo.port=27017] - mongodb port
     * @param {string} {options.mongo.username} - mongodb username
     * @param {string} [options.mongo.password] - mongodb password
     * @return {UserApp}
     */
    constructor(options = {}){
        this.options = {
            mongo: {
                host: "localhost",
                port: 27017,
                username: "",
                password: ""
            }
        };
        Object.extend(this.options, options);
        
        this.logger = new Logger("UserApp", {
            level: "debug",
            context: this
        });
        
        this.options.mongo.url = this.createMongoUrl(this.options.mongo);
        this.mongoClient = new MongoClient(this.options.mongo.url, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        this.userCollection = null;
        this.connectToMongo();
        return this;
    }

    //////////////////////////////////////////////
    // Mongo DB setup
    //////////////////////////////////////////////

    /**
     * Create a mongodb url string with the following pattern:
     * mongodb://[username:password@]host1[:port1][,host2[:port2],...[,hostN[:portN]]][/[database][?options]]
     * @param {object} mongoOptions 
     * @return this;
     */
    createMongoUrl({username, password, host, port}){
        let url = "mongodb://";

        // optional username/password, both must be set
        if(typeof username === "string" && username.length){
            if(typeof password === "string" && password.length) {
                url = `${username}:${password}@`;
            }
        }
       
        url += `${host}:${port}/voliware_node_user`;
        return url;
    }

    /**
     * Connect to mongo
     * @return {Promise}
     */
    connectToMongo(){
        let self = this;
        this.logger.debug(`connecting to ${this.options.mongo.url}`)
        return this.mongoClient.connect()
            .then(function(client) {
                let db = client.db('user');
                self.userCollection = db.collection('users');
                self.logger.info(`connected to ${self.options.mongo.url}`)
            })
            .catch(function(err){
                self.logger.error(`failed to connect to ${self.options.mongo.url}`);
                self.logger.error(err);
                return Promise.reject(err);
            });
    }
    /**
     * Process a filter object used for queries.
     * If the filter has an _id property, replace
     * it with a new Mongo.ObjectID.
     * @param {object} filter 
     * @return {object}
     */
    processFilter(filter){
        if(typeof filter._id !== "undefined"){
            filter._id = new Mongo.ObjectID(filter._id);
        }
        return filter;
    }

    //////////////////////////////////////////////
    // User collection management
    //////////////////////////////////////////////
    
    /**
     * Delete a user from the collection.
     * @param {object} filter 
     * @return {Promise}
     */
    deleteUser(filter){
        this.logger.debug('Deleting user with filter');
        this.logger.debug(filter);

        filter = this.processFilter(filter);
        let self = this;
        return this.userCollection.deleteOne(filter)
            .then(function(result){
                if(result.n){
                    self.logger.info('Deleted user');
                }
                else {
                    self.logger.debug('Did not delete any users');
                }
            })
            .catch(function(err){
                self.logger.error('Failed to delete user');
                self.logger.error(err);
                return Promise.reject(err);
            });
    }

    /**
     * Find a user from the collection
     * @param {object} filter - query filter
     * @return {Promise}
     */
    async getUser(filter){
        this.logger.debug('Getting user with filter');
        this.logger.debug(filter);

        filter = this.processFilter(filter);
        let self = this;
        let user = await this.userCollection.findOne(filter)
            .catch(function(err){
                self.logger.error('Failed to get user');
                self.logger.error(err);
                return Promise.reject(err);
            });

        if(user){
            this.logger.debug('Got user');
            this.logger.verbose(user);
        }
        else {
            this.logger.debug('Did not find user');
        }
        return user;
    }

    /**
     * Insert a user into the collection
     * @param {object} user
     * @param {string} user.username
     * @param {string} user.email
     * @param {string} user.passwordHash
     * @param {string[]} [user.friends]
     * @param {number} [user.level]
     * @param {number} [user.lastLoginDate]
     * @param {number} [user.registerDate]
     * @return {Promise}
     */
    async insertUser(user){
        this.logger.debug('Inserting user with data');
        this.logger.debug(user);

        let self = this;
        let result = await this.userCollection.insertOne(user)
            .catch(function(err){
                self.logger.error('Failed to insert user into db');
                self.logger.error(err);
                return Promise.reject(err)
            });

        // check result
        if(result.insertedCount){
            this.logger.info('Inserted user into db');
            return result;
        }
        else {
            return Promise.reject('Inserted count was 0');
        }
    }

    /**
     * Add a session for a user
     * with an id, IP, and browser name.
     * @param {string} userId 
     * @param {string} sessionId 
     * @param {string} ip 
     * @param {string} browser 
     * @return {Promise}
     */
    addSession(userId, sessionId, ip, browser){
        let filter = {_id: userId};
        let data = {
            $addToSet: {
                sessions: {sessionId, ip, browser}
            }
        }
        
        let self = this;
        return this.updateUser(filter, data)
            .catch(function(error){
                self.logger.error(`Failed to add session`);
                self.logger.error(error);
                return Promise.reject(error)
            });
    }

    /**
     * Remove all sessions from a user that
     * match an IP and browser name.
     * @param {string} userId 
     * @param {string} ip 
     * @param {string} browser 
     * @return {Promise}
     */
    deleteSessions(userId, ip, browser){
        // remove any old sessions bound to the user
        // search by user id
        let filter = {_id: userId};

        // remove entries that match ip/browser (pull out of array)
        let params = {
            $pull: {
                sessions: {ip, browser}
            }
        };

        let self = this;
        return this.updateUser(filter, params)
            .catch(function(err){
                // it's fine if it did not remove a session
                self.logger.debug("Removed 0 sessions")
            });
    }

    /**
     * Update a user in the collection
     * @param {object} filter
     * @param {object} user
     * @param {string} [user.username]
     * @param {string} [user.email]
     * @param {string} [user.passwordHash]
     * @param {string[]} [user.friends]
     * @param {number} [user.level]
     * @param {number} [user.lastLoginDate]
     * @param {number} [user.registerDate]
     * @return {Promise}
     */
    async updateUser(filter, user){
        this.logger.debug('Inserting user with data');
        this.logger.debug(user);

        let self = this;
        filter = this.processFilter(filter);
        let res = await this.userCollection.updateOne(filter, user)
            .catch(function(err){
                self.logger.error('Failed to update user in db');
                self.logger.error(err);
                return Promise.reject(err)
            });

        
        if(res.modifiedCount){
            self.logger.info('Updated user in db');
            return res;
        }
        else {
            return Promise.reject('Modified count was 0');
        }
    }

    /**
     * Drop the collection
     * @return {Promise}
     */
    drop(){
        let self = this;
        return this.userCollection.drop()
            .then(function(){
                self.logger.info('Dropped collection');
                return
            })
            .catch(function(err){
                self.logger.error('Failed to drop collection');
                self.logger.error(err);
                return Promise.reject(err);
            });
    }

    /**
     * Wipe the collection
     * @return {Promise}
     */
    wipe(){
        let self = this;
        return this.userCollection.deleteMany({})
            .then(function(){
                self.logger.info('Wiped collection');
                return
            })
            .catch(function(err){
                self.logger.error('Failed to wipe collection');
                self.logger.error(err);
                return Promise.reject(err);
            });
    }

    //////////////////////////////////////////////
    // UserApp API
    //////////////////////////////////////////////

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
     * @return {Promise}
     */
    async loginUser(username, password, ip, browser){
        this.logger.debug("Logging in user with data");
        this.logger.debug(`username:${username}, password:***, ip:${ip}, browser:${browser}`);

        // get user
        let user = await this.getUser({username});
        if(!user){
            this.logger.debug("Cannot find user");
            return Promise.reject(UserApp.error.loginFail);
        }

        // check password
        let isValid = await this.comparePassword(password, user.password);
        if(!isValid){
            this.logger.debug("Password is invalid");
            return Promise.reject(UserApp.error.loginFail);
        }
        
        // delete all old ones matching same ip/browser
        await this.deleteSessions(user._id, ip, browser);
        
        // add new session
        user.sessionId = await UserSession.generateSessionId();
        await this.addSession(user._id, user.sessionId, ip, browser);
        
        // hashed, but.. no
        delete user.password;

        return user;
    }

    /**
     * Get a user with session data.
     * The sessionId, ip, and browser must match at
     * least one object the sessions array of a user document.
     * @param {string} sessionId 
     * @param {string} ip 
     * @param {string} browser 
     * @return {Promise}
     */
    async loginUserWithSessionId(sessionId, ip, browser){
        let self = this;
        let filter = {
            sessions: {
                $elemMatch: {sessionId, ip, browser}
            }
        }

        // get user from session data
        let user = await this.getUser(filter)
            .catch(function(err){
                self.logger.error(err);
                return Promise.reject(err)
            });

        // remove password
        // add session id
        if(user){
            delete user.password;
            user.sessionId = sessionId;
        }

        return user;
    }

    /**
     * Logout a user based on their session id.
     * Remove the session from the collection.
     * @param {string} sessionId
     * @return {Promise}
     */
    logoutUser(sessionId){
        let self = this;
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
        return this.updateUser(filter, params)
            .then(function(){
                self.logger.info('Logged out user');
            })
            .catch(function(err){
                self.logger.error('Failed to logout user');
                return Promise.reject(err);
            })
    }

    /**
     * Validate a username by checking 
     * for its uniqueness.
     * @param {string} username 
     * @return {Promise}
     */
    async validateUsername(username){
        // try to get user with this username
        let element = await this.getUser({username})
            .catch(function(error){
                self.logger.error('Failed to run user query');
                self.logger.error(error);
                return Promise.reject(error)
            });

        // if it exists, reject
        if(element){
            this.logger.debug(`User ${username} already exists`);
            return Promise.reject(UserApp.error.userExists);
        }

        return Promise.resolve();
    }

    /**
     * Compare a password with a hash.
     * Return a promise with a true result
     * if the passwords match.
     * @param {string} password 
     * @param {string} hash 
     * @return {Promise}
     */
    async comparePassword(password, hash){
        let self = this;
        let valid = await bcrypt.compare(password, hash)
            .catch(function(err){
                self.logger.error("Failed comparing hash password");
                return Promise.reject(err);
            });

        return valid;
    }

    /**
     * Hash a password
     * @param {string} password 
     * @return {Promise}
     */
    hashPassword(password){
        let self = this;
        return bcrypt.hash(password, 10)
            .catch(function(error){
                self.logger.error('Failed to hash password');
                self.logger.error(error);
                return Promise.reject(error)
            });
    }

    /**
     * Register a user.
     * Performs a check for username uniqueness.
     * Hashes the incoming password.
     * Inserts the user into the collection.
     * @param {string} username
     * @param {string} password
     * @param {string} email
     * @return {Promise}
     */
    async registerUser(username, password, email){
        try{
            await this.validateUsername(username);
            let hash = await this.hashPassword(password);
            let user = new User({
                username: username,
                password: hash,
                email: email,
                registerDate: Date.now(),
                level: User.level.user
            });
            user = user.toObject();
            await this.insertUser(user);
            this.logger.info(`Registered user ${username}`);
            return user;
        }
        catch(error){
            this.logger.error(`Failed to register user ${username}`);
            this.logger.error(error);
            return Promise.reject(error)
        }
    }

    /**
     * Reset a password.
     * Find the user based on the email.
     * Generate a password code.
     * Insert the password code into the collection.
     * Send the password reset email.
     * @param {string} email 
     * @return {Promise}
     */
    resetPassword(email){
        let self = this;
        let user = null;
        return this.getUser({email})
            .then(function(_user){
                if(!_user){
                    return Promise.reject(UserApp.error.userNotFound);
                }

                user = _user;
                let code = self.generateRandomHex();
                if(!code){
                    return Promise.reject(UserApp.error.resetPasswordFail);
                }

                return self.insertResetPasswordCode(user, code);
            })
            .then(function(data){
                return self.sendResetPasswordEmail(user, data.code);
            })
            .catch(function(err){
                self.logger.error(`Failed to reset password for user ${email}`);
                return Promise.reject(err)
            });
    }

    /**
     * Send an email to a user with the reset password link.
     * @param {User} user 
     * @param {string} code 
     * @return {Promise}
     */
    sendResetPasswordEmail(user, code){
        let mail = {
            from: "Todo",
            to: user.email,
            subject: "Password Reset Request",
            text: "You've requested to reset your password. " +
                  "Please click this link to reset it. " +
                  "http://http://localhost:3000/reset?code= " + code,
            //html: ""
        }
        
        return mailer.sendMail(mail);
    }
}
UserApp.error = {
    userExists: "A user with this name already exists",
    userNotFound: "The user was not found",
    loginFail: "The username, email, or password is incorrect",
    resetPasswordFail: "Failed to reset password"
};

module.exports = UserApp;