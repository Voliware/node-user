/**
 * User login, registration, and password reset UI.
 * Manages a user object and related cookies.
 * @extends {EventSystem}
 */
class UserApp extends EventSystem {

    /**
     * Constructor
     * @param {object} [options={}]
     * @param {boolean} [options.cookieLogin=true]
     * @return {UserApp}
     */
    constructor(options = {}){
        super();
        let self = this;

        // settings
        this.cookieLogin = options.cookieLogin ? options.cookieLogin : true;

        // elements 
        this.wrapper = Template.selectFirst('#user-app');
        this.loginForm = Template.selectFirst('#user-login-form');
        this.registerForm = Template.selectFirst('#user-register-form');
        this.resetForm = Template.selectFirst('#user-reset-form');
        this.loginLink = Template.selectFirst('#user-login-link');
        this.registerLink = Template.selectFirst('#user-register-link');
        this.resetPasswordLink = Template.selectFirst('#user-reset-link');
        
        this.user = new User();
        this.userElement = Template.selectFirst('#user');
        this.userElement.on('logout', function(){
            self.logout();
        });

        // handlers
        this.loginForm.on('success', function(){
            self.displayComponent('logout');
        }); 
        this.registerForm.on('success', function(){
            self.displayComponent('logout');
        });

        Template.on(this.loginLink, 'click', function(){
            self.displayComponent('login');
            self.displayLinks('login');
        });
        Template.on(this.resetPasswordLink, 'click', function(){
            self.displayComponent('reset');
            self.displayLinks('reset');
        });
        Template.on(this.registerLink, 'click', function(){
            self.displayComponent('register');
            self.displayLinks('register');
        });
        return this;
    }

    /**
     * Set the user data
     * @param {object} data
     * @return {UserApp}
     */
    setUserData(data){
        this.user.set(data);
        return this;
    }

    /**
     * Render the user element
     * @param {object} data
     * @return {UserApp}
     */
    render(data){
        this.userElement.render(data);
        return this;
    }

    /**
     * Toggle the display of the module
     * @param {boolean} state
     * @return {UserApp}
     */
    display(state){
        Template.display(this.wrapper, state);
        return this;
    }

    /**
     * Toggle the display of the components
     * @param {string} component - the component to show, hide the rest
     * @return {UserApp}
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
     * @return {UserApp}
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
     * @return {UserApp}
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
     * @return {Promise}
     */
    async loginWithSessionId(){
        let response = await Routes.login();
        if(response.status === 200){
            this.displayComponent('logout');
        }
        else {
            this.displayComponent('login');
        }
    }

    /**
     * Logout.
     * @return {Promise}
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
     * @return {Promise}
     */
    initialize(){
        return this.loginWithSessionId();
    }
}