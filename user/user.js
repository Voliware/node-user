const bcrypt = require('bcrypt');
const Logger = require('../util/logger');

/**
 * User
 */
class User {

    /**
     * Constructor
     * @return {User}
     */
    constructor(){
        this.email = "";
        this.browser = "";
        this.friends = [];
        this.ip = "";      
        this.level = User.level.user;  
        this.lastLoginDate = 0;
        this.registerDate = 0;
        this.sessions = [];
        return this;
    }

    /**
     * Create a hash of a password
     * @param {string} password
     * @return {Promise}
     */
    static hashPassword(password){
        return bcrypt.hash(password, 10)
            .then(function(hash) {
                return hash;
            })
            .catch(function(err){
                Logger.log("User", "error", "Failed to hash password");
                return Promise.reject(err)
            });
    }
    
    /**
     * Validate a password against a hash
     * @param {string} password
     * @param {string} hash
     * @return {Promise}
     */
    static validatePassword(password, hash){
        return bcrypt.compare(password, hash)
            .then(function(isValid){
                if(isValid){
                    Logger.log("User", "debug", "Password is valid");
                }
                else {
                    Logger.log("User", "debug", "Password is invalid");
                }
                return isValid;
            })
            .catch(function(err){
                Logger.log("User", "error", "Failed comparing hash password");
                return Promise.reject(err);
            });
    }
}
User.level = {
    admin: 0,
    user: 1,
    string: [
        "Admin",
        "User"
    ]
};

module.exports = User;