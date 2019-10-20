/**
 * User session
 */
class UserSession {

    /**
     * Constructor
     * @returns {UserDocument}
     */
    constructor(){
        this.browser = "";
        this.id = "";
        this.ip = "";
        return this;
    }
}
module.exports = UserSession;