/**
 * Register form
 * @extends {FormTemplate}
 */
class RegisterForm extends FormTemplate {  

    /**
     * Constructor
     * @returns {RegisterForm}
     */
    constructor(){
        super({submitRequest: Routes.register});
        return this;
    }
}
customElements.define('template-user-register', RegisterForm);