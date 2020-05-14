/**
 * Reset form
 * @extends {FormTemplate}
 */
class ResetForm extends FormTemplate {  

    /**
     * Constructor
     * @returns {ResetForm}
     */
    constructor(){
        super({submitRequest: Routes.resetPassword});
        return this;
    }
}
customElements.define('template-user-reset', ResetForm);