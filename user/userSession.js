const crypto = require('crypto');

/**
 * User session
 */
class UserSession {

    /**
     * Constructor
     * @return {UserDocument}
     */
    constructor(){
        this.browser = "";
        this.id = "";
        this.ip = "";
        return this;
    }
    
    /**
     * Generate a random session id.
     * @return {Promise}
     */
    static async generateSessionId(){
        Logger.log("UserSession", "debug", 'Generating session id');
        return new Promise(function(resolve, reject){
            crypto.randomBytes(32, function(err, buffer){
                let sessionId = buffer.toString('hex');
                Logger.log("UserSession", "debug", `Generated session id ${sessionId}`);
                resolve(sessionId);
            });
        });
    }
}

module.exports = UserSession;