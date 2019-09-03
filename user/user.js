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