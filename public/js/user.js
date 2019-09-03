/**
 * User template
 * @extends {Template}
 */
class UserTemplate extends Template {  

    /**
     * Constructor
     * @return {UserTemplate}
     */
    constructor(){
        super({
            elements: {
                avatar: '[data-name="avatar"]',
                name: '[data-name="name"]',
                email: '[data-name="email"]',
                logout: '[name="logout"]'
            }
        });

        return this;
    }

    /**
     * Attach handlers to the template.
     * @return {UserTemplate}
     */
    attachHandlers(){
        let self = this;
        Template.on(this.elements.logout, "click", function(){
            self.emit('logout');
        });
        return this;
    }
}
customElements.define('template-user', UserTemplate);

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

/**
 * User Module.
 * Manages the user element and user object.
 * @extends {EventSystem}
 */
class UserModule extends EventSystem {

    /**
     * Constructor
     * @return {UserModule}
     */
    constructor(){
        super();
        let self = this;
        this.user = new User();
        this.userElement = Template.select('#user');
        this.userElement.on('logout', function(){
            self.emit('logout');
        });
        return this;
    }

    /**
     * Set the user data
     * @param {object} data
     * @return {UserModule}
     */
    setUserData(data){
        this.user.set(data);
        return this;
    }

    /**
     * Render the user element
     * @param {object} data
     * @return {UserModule}
     */
    render(data){
        this.userElement.render(data);
        return this;
    }
}