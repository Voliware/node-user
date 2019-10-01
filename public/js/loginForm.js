/**
 * Login form
 * @extends {FormTemplate}
 */
class LoginForm extends FormTemplate {  

    /**
     * Constructor
     * @return {LoginForm}
     */
    constructor(){
        super({submitRequest: Routes.login});
        return this;
    }
}
customElements.define('template-form-login', LoginForm);