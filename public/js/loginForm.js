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
        super({
            submitRequest: function(data){
                return Routes.login(data.email, data.password)
                    .then(function(res){  
                        console.log(res);
                    });
            }
        });
        return this;
    }
}
customElements.define('template-form-login', LoginForm);