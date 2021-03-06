/**
 * User template
 * @extends {Template}
 */
class UserTemplate extends Template {  

    /**
     * Constructor
     * @returns {UserTemplate}
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
     * @returns {UserTemplate}
     */
    attachHandlers(){
        Template.on(this.elements.logout, "click", () => {
            this.emit('logout');
        });
        return this;
    }
}
customElements.define('template-user', UserTemplate);