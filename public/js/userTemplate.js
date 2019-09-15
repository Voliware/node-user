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