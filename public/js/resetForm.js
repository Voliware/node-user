/**
 * Reset form
 * @extends {FormTemplate}
 */
class ResetForm extends FormTemplate {  

    /**
     * Constructor
     * @return {ResetForm}
     */
    constructor(){
        super({
            submitRequest: function(data){
                return Routes.reset(data.email)
                    .then(function(res){  
                        console.log(res);
                    });
            }
        });
        return this;
    }
}
customElements.define('template-form-reset', ResetForm);