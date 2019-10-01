const crypto = require('crypto');
const Logger = require('@voliware/logger');

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
        return new Promise(function(resolve, reject){
            crypto.randomBytes(32, function(err, buffer){
                if(err){
                    reject(err);
                    UserSession.logger.error('Failed to generate session id');
                    return;
                }

                let sessionId = buffer.toString('hex');
                UserSession.logger.debug(`Generated session id ${sessionId}`);
                resolve(sessionId);
            });
        });
    }
}
UserSession.logger = new Logger("UserSession", {level: "debug"});

module.exports = UserSession;