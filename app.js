const Logger = require('@voliware/node-logger');
const UserSession = require('./user/userSession');
const UserDatabase = require('./user/userDatabase');

/**
 * App for all user related things.
 */
class App {
    
    /**
     * Constructor
     * @return {App}
     */
    constructor(){
        this.userDatabase = new UserDatabase();
        this.logger = new Logger("App", this);
        return this;
    }

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
        return this.userTable.getUser({email})
            .then(function(element){
                if(element){
                    _userElement = element;
                    return User.validatePassword(password, element.password);
                }
                else {
                    return Promise.reject(App.error.loginFail);
                }
            })
            .then(function(isValid){
                if(isValid){
                    return UserSession.generateSessionId();
                }
                else {
                    return Promise.reject(App.error.loginFail);
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
                return self.userTable.updateUser(filter, params)
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
                return self.userTable.updateUser(filter, sessionData);
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
        return this.userTable.getUser(filter)
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
        return this.userTable.updateUser(filter, params)
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
        return this.userTable.getUser({email})
            .then(function(element){
                if(!element){
                    return User.hashPassword(password);
                }
                else {
                    self.logger.debug(`User ${email} already exists`);
                    return Promise.reject(App.error.userExists);
                }
            })        
            .then(function(hash){
                return self.userTable.insertUser({
                    email: email,
                    password: hash,
                    registerDate: Date.now(),
                    level: User.level.user
                });
            })
            .then(function(result){
                // result.ops[0]
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
                    return Promise.reject(App.error.userNotFound);
                }

                user = _user;
                let code = self.generateRandomHex();
                if(!code){
                    return Promise.reject(App.error.resetPasswordFail);
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
App.error = {
    userExists: "A user with this email already exists",
    userNotFound: "The user was not found",
    loginFail: "The email or password is incorrect",
    resetPasswordFail: "Failed to reset password"
};

let app = new App();