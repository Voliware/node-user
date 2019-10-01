/**
 * Register form
 * @extends {FormTemplate}
 */
class RegisterForm extends FormTemplate {  

    /**
     * Constructor
     * @return {RegisterForm}
     */
    constructor(){
        super({submitRequest: Routes.register});
        return this;
    }
}
customElements.define('template-form-register', RegisterForm);