/**
 * User login, registration, and password reset UI.
 * Manages a user object and related cookies.
 * @extends {Template}
 */
class UserApp extends Template {

    /**
     * Constructor
     * @returns {UserApp}
     */
    constructor(){
        super();

        // elements 
        this.wrapper = Template.selectFirst('template-user-app');
        this.feedback = Template.selectFirst('template-feedback');
        this.loginForm = Template.selectFirst('template-user-login');
        this.registerForm = Template.selectFirst('template-user-register');
        this.resetForm = Template.selectFirst('template-user-reset');
        this.loginLink = Template.selectFirst('.user-login-link');
        this.registerLink = Template.selectFirst('.user-register-link');
        this.resetPasswordLink = Template.selectFirst('.user-reset-link');
        
        this.user = new User();
        this.userElement = Template.selectFirst('template-user');
        this.userElement.on('logout', () => {
            this.logout();
        });

        // attach form handlers
        this.attachLoginFormHandlers();
        this.attachRegisterFormHandlers();
        this.attachResetFormHandlers();

        // attach link handlers
        Template.on(this.loginLink, 'click', () => {
            this.displayComponent('login');
            this.displayLinks('login');
        });
        Template.on(this.resetPasswordLink, 'click', () => {
            this.displayComponent('reset');
            this.displayLinks('reset');
        });
        Template.on(this.registerLink, 'click', () => {
            this.displayComponent('register');
            this.displayLinks('register');
        });
        return this;
    }

    /**
     * Attach handlers to the login form.
     * @returns {UserApp}
     */
    attachLoginFormHandlers(){
        this.loginForm.on('success', () => {
            this.displayComponent('logout');
            this.feedback.renderSuccess('Logged in successfully');
            this.feedback.show();
        }); 
        this.loginForm.on('fail', () => {
            this.feedback.renderError('Failed to login');
            this.feedback.show();
        }); 
        return this;
    }

    /**
     * Attach handlers to the register form.
     * @returns {UserApp}
     */
    attachRegisterFormHandlers(){
        this.registerForm.on('success', () => {
            this.displayComponent('logout');
            this.feedback.renderSuccess('Registered successfully');
            this.feedback.show();
        });
        this.registerForm.on('fail', () => {
            this.feedback.renderError('Failed to register');
            this.feedback.show();
        }); 
        return this;
    }

    /**
     * Attach handlers to the reset password form.
     * @returns {UserApp}
     */
    attachResetFormHandlers(){
        this.resetForm.on('success', () => {
            this.feedback.renderSuccess('Reset password successfully');
            this.feedback.show();
        });
        this.resetForm.on('fail', () => {
            this.feedback.renderError('Failed to reset password');
            this.feedback.show();
        }); 
        return this;
    }

    /**
     * Set the user data
     * @param {object} data
     * @returns {UserApp}
     */
    setUserData(data){
        this.user.set(data);
        return this;
    }

    /**
     * Render the user element
     * @param {object} data
     * @returns {UserApp}
     */
    render(data){
        this.userElement.render(data);
        return this;
    }

    /**
     * Toggle the display of the module
     * @param {boolean} state
     * @returns {UserApp}
     */
    display(state){
        Template.display(this.wrapper, state);
        return this;
    }

    /**
     * Toggle the display of the components
     * @param {string} component - the component to show, hide the rest
     * @returns {UserApp}
     */
    displayComponent(component){
        switch(component){
            case 'reset':
                this.displayForm('reset');
                this.displayLinks('reset');
                break;
            case 'register':
                this.displayForm('register');
                this.displayLinks('register');
                break;
            case 'logout':
                this.displayForm('logout');
                this.displayLinks('logout');
                break;
            case 'login':
            default:
                this.displayForm('login');
                this.displayLinks('login');
                break;
        }

        return this;
    }

    /**
     * Toggle the display of the forms
     * @param {string} form - the form to show, hide the rest
     * @returns {UserApp}
     */
    displayForm(form){
        switch(form){
            case 'reset':
                this.loginForm.hide();
                this.registerForm.hide();
                this.userElement.hide();
                this.resetForm.show();
                break;
            case 'register':
                this.resetForm.hide();
                this.loginForm.hide();
                this.userElement.hide();
                this.registerForm.show();
                break;
            case 'logout':
                this.loginForm.hide();
                this.registerForm.hide();
                this.resetForm.hide();
                this.userElement.show();
                break;
            case 'login':
            default:
                this.resetForm.hide();
                this.registerForm.hide();
                this.userElement.hide();
                this.loginForm.show();
                break;
        }

        return this;
    }

    /**
     * Toggle the display of the links
     * @param {string} links - the link to show, hide the rest
     * @returns {UserApp}
     */
    displayLinks(links){
        switch(links){
            case 'register':
                Template.hide(this.registerLink);
                Template.show(this.resetPasswordLink);
                Template.show(this.loginLink);
                break;
            case 'reset':
                Template.hide(this.resetPasswordLink);
                Template.show(this.loginLink);
                Template.show(this.registerLink);
                break;
            case 'logout':
                Template.hide(this.registerLink);
                Template.hide(this.resetPasswordLink);
                Template.hide(this.loginLink);
                break;
            case 'login':
            default:
                Template.hide(this.loginLink);
                Template.show(this.registerLink);
                Template.show(this.resetPasswordLink);
                break;
        }
        
        return this;
    }

    /**
     * Login with no parameters,
     * which will use a sessionId cookie on the backend.
     * @returns {Promise}
     */
    async loginWithSessionId(){
        let response = await Routes.loginWithCookie();
        if(response.status === 200){
            this.displayComponent('logout');
        }
        else {
            this.displayComponent('login');
        }
    }

    /**
     * Logout.
     * @returns {Promise}
     */
    async logout(){
        let response = await Routes.logout();
        if(response.status === 200){
            this.displayComponent('login');
        }
    }

    /**
     * Initialize by trying to login with a cookie.
     * If successful, emits login.success and hides 
     * the login, register, and reset forms.
     * If cookie does not exist, emits login.required
     * and displays the login form.
     * @returns {Promise}
     */
    initialize(){
        return this.loginWithSessionId();
    }
}
customElements.define('template-user-app', UserApp);