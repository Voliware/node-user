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
        super({submitRequest: Routes.reset});
        return this;
    }
}
customElements.define('template-form-reset', ResetForm);