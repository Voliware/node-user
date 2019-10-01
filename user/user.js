/**
 * User
 */
class User {

    /**
     * Constructor
     * @return {User}
     */
    constructor(options){
        this.username = "";
        this.password = "";
        this.email = "";
        this.level = User.level.user;  
        this.lastLoginDate = 0;
        this.registerDate = 0;
        this.sessions = [];

        this.set(options);

        return this;
    }

    /**
     * Set object properties
     * @param {object} options
     * @return {User} 
     */
    set(options){
        for(let k in options){
            if(this.hasOwnProperty(k)){
                this[k] = options[k];
            }
        }
        return this;
    }

    /**
     * Convert to a regular object.
     * @return {object}
     */
    toObject(){
        return {
            username: this.username,
            password: this.password,
            email: this.email,
            registerDate: this.registerDate,
            level: this.level,
            lastLoginDate: this.lastLoginDate
        }
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