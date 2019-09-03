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
        super({
            submitRequest: function(data){
                return Router.user.register(data.email, data.password)
                    .then(function(res){  
                        console.log(res);
                    });
            }
        });
        return this;
    }
}
customElements.define('template-form-register', RegisterForm);