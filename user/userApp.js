const bcrypt = require('bcrypt');
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
        
        this.logger = new Logger("UserApp", this);
        
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
     * it with a new mongo.ObjectID.
     * @param {object} filter 
     * @return {object}
     */
    processFilter(filter){
        if(typeof filter._id !== "undefined"){
            filter._id = new mongo.ObjectID(filter._id);
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
    getUser(filter){
        this.logger.debug('Getting user with filter');
        this.logger.debug(filter);

        filter = this.processFilter(filter);
        let self = this;
        return this.userCollection.findOne(filter)
            .then(function(element) {
                if(element){
                    self.logger.debug('Got user');
                    self.logger.debug(element);
                }
                else {
                    self.logger.debug('Did not find user');
                }
                return element;
            })
            .catch(function(err){
                self.logger.error('Failed to query user');
                self.logger.error(err);
                return Promise.reject(err);
            });
    }

    /**
     * Insert a user into the collection
     * @param {object} user
     * @param {string} user.email
     * @param {string} user.passwordHash
     * @param {string[]} [user.friends]
     * @param {number} [user.level]
     * @param {number} [user.lastLoginDate]
     * @param {number} [user.registerDate]
     * @return {Promise}
     */
    insertUser(user){
        this.logger.debug('Inserting user with data');
        this.logger.debug(user);

        let self = this;
        return this.userCollection.insertOne(user)
            .then(function(res) {
                if(res.insertedCount){
                    self.logger.info('Inserted user into db');
                    return res;
                }
                else {
                    return Promise.reject('Inserted count was 0');
                }
            })
            .catch(function(err){
                self.logger.error('Failed to insert user into db');
                self.logger.error(err);
                return Promise.reject(err)
            });
    }

    /**
     * Update a user in the collection
     * @param {object} filter
     * @param {object} user
     * @param {string} [user.email]
     * @param {string} [user.passwordHash]
     * @param {string[]} [user.friends]
     * @param {number} [user.level]
     * @param {number} [user.lastLoginDate]
     * @param {number} [user.registerDate]
     * @return {Promise}
     */
    updateUser(filter, user){
        this.logger.debug('Inserting user with data');
        this.logger.debug(user);

        let self = this;
        filter = this.processFilter(filter);
        return this.userCollection.updateOne(filter, user)
            .then(function(res) {
                if(res.modifiedCount){
                    self.logger.info('Updated user in db');
                    return res;
                }
                else {
                    return Promise.reject('Modified count was 0');
                }
            })
            .catch(function(err){
                self.logger.error('Failed to update user in db');
                self.logger.error(err);
                return Promise.reject(err)
            });
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
     * Find the user based on email.
     * Validate the supplied password.
     * Log them in if the password is valid.
     * Add a new session to their session list.
     * @param {string} email 
     * @param {string} password - plaintext password
     * @param {string} ip
     * @param {string} browser 
     * @return {Promise}
     */
    loginUser(email, password, ip, browser){
        this.logger.debug("Logging in user with data");
        this.logger.debug(`email:${email}, password:***, ip:${ip}, browser:${browser}`);

        let self = this;
        let _userElement = null;
        let _sessionId = null;
        return this.getUser({email})
            .then(function(element){
                if(element){
                    _userElement = element;
                    return bcrypt.compare(password, hash)
                        .then(function(isValid){
                            if(isValid){
                                this.logger.debug("Password is valid");
                            }
                            else {
                                this.logger.debug("Password is invalid");
                            }
                            return isValid;
                        })
                        .catch(function(err){
                            this.logger.error("Failed comparing hash password");
                            return Promise.reject(err);
                        });
                }
                else {
                    return Promise.reject(UserApp.error.loginFail);
                }
            })
            .then(function(isValid){
                if(isValid){
                    return UserSession.generateSessionId();
                }
                else {
                    return Promise.reject(UserApp.error.loginFail);
                }
            })
            .then(function(sessionId){
                _sessionId = sessionId;
                // remove any old sessions
                let filter = {_id: _userElement._id};
                let params = {
                    $pull: {
                        sessions: {ip, browser}
                    }
                };
                return self.updateUser(filter, params)
                    .catch(function(err){
                        // it's fine if it did not remove a session
                        return Promise.resolve();
                    })
            })
            .then(function(){
                // add session data
                let filter = {_id: _userElement._id};
                let sessionData = {
                    $addToSet: {
                        sessions: {sessionId: _sessionId, ip, browser}
                    }
                }
                return self.updateUser(filter, sessionData);
            })
            .then(function(){
                // hashed, but.. no
                delete _userElement.password;
                return {user: _userElement, sessionId: _sessionId};
            })
            .catch(function(err){
                self.logger.error(`Failed to login user ${email}`);
                self.logger.error(err);
                return Promise.reject(err)
            });
    }

    /**
     * Get a user with session data.
     * The sessionId, ip, and browser must match at
     * least one object the sessions array of a user document.
     * @param {object} sessionId 
     * @param {string} ip 
     * @param {string} browser 
     * @return {Promise}
     */
    getUserWithSessionData(sessionId, ip, browser){
        let self = this;
        let filter = {
            sessions: {
                $elemMatch: {sessionId, ip, browser}
            }
        }
        return this.getUser(filter)
            .then(function(element){
                if(element){
                    // hashed, but.. no
                    delete element.password;
                    return element;
                }
                else {
                    return Promise.reject("User not found with supplied session data");
                }
            })
            .catch(function(err){
                self.logger.error('Failed to get user with session data');
                return Promise.reject("Please login with credentials")
            });
    }

    /**
     * Logout a user based on their session id.
     * Remove the session from the collection.
     * @param {string} sessionId
     * @return {Promise}
     */
    logoutUser(sessionId){
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
     * Register a user.
     * Performs a check for email uniqueness.
     * Hashes the incoming password.
     * Inserts the user into the collection.
     * @param {string} email
     * @param {string} password
     * @return {Promise}
     */
    registerUser(email, password){
        let self = this;
        return this.getUser({email})
            .then(function(element){
                if(!element){
                    return bcrypt.hash(password, 10)
                        .catch(function(err){
                            self.logger.error("Failed to hash password");
                            self.logger.error(err);
                            return Promise.reject(err);
                        });
                }
                else {
                    self.logger.debug(`User ${email} already exists`);
                    return Promise.reject(UserApp.error.userExists);
                }
            })        
            .then(function(hash){
                return self.insertUser({
                    email: email,
                    password: hash,
                    registerDate: Date.now(),
                    level: User.level.user
                });
            })
            .then(function(result){
                self.logger.info(`Registered user ${email}`);
            })
            .catch(function(err){
                self.logger.error(`Failed to register user ${email}`);
                self.logger.error(err);
                return Promise.reject(err)
            });
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
    userExists: "A user with this email already exists",
    userNotFound: "The user was not found",
    loginFail: "The email or password is incorrect",
    resetPasswordFail: "Failed to reset password"
};

module.exports = UserApp;