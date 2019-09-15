/**
 * Represent a user.
 */
class User {

    /**
     * Constructor
     * @return {User}
     */
    constructor(){
        this.name = "";
        this.id = 0;
        this.email = "";
        this.isLoggedIn = false;
        return this;
    }

    /**
     * Set all user properties 
     * from an object of data.
     * @param {object} data 
     * @return {User}
     */
    set(data){
        for(let k in data){
            if(this.hasOwnProperty(k)){
                this[k] = data[k];
            }
        }
        return this;
    }
}