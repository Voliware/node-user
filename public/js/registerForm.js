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
                console.log(data);
                return Routes.register(data.email, data.password, data.username)
                    .then(function(res){  
                        console.log(res);
                    });
            }
        });
        return this;
    }
}
customElements.define('template-form-register', RegisterForm);