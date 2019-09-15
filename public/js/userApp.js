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
        this.cookieLogin = options.cookieLogin ? options.cookieLogin : false;

        // elements 
        this.wrapper = Template.select('#user-app');
        this.loginForm = Template.select('#user-login-form');
        this.registerForm = Template.select('#user-register-form');
        this.resetForm = Template.select('#user-reset-form');
        this.loginLink = Template.select('#user-login-link');
        this.registerLink = Template.select('#user-register-link');
        this.resetPasswordLink = Template.select('#user-reset-link');
        
        this.user = new User();
        this.userElement = Template.select('#user');
        this.userElement.on('logout', function(){
            self.emit('logout');
        });

        // handlers
        this.loginForm.on('success', function(data){
            self.emit('login.success');
        });
        Template.on(this.loginLink, 'click', function(){
            self.displayForm('login');
            self.displayLinks('login');
        });
        Template.on(this.resetPasswordLink, 'click', function(){
            self.displayForm('reset');
            self.displayLinks('reset');
        });
        Template.on(this.registerLink, 'click', function(){
            self.displayForm('register');
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
     * Toggle the display of the forms
     * @param {string} form - the form to show, hide the rest
     * @return {UserApp}
     */
    displayForm(form){
        switch(form){
            case 'reset':
                this.loginForm.hide();
                this.registerForm.hide();
                this.resetForm.show();
                break;
            case 'register':
                this.resetForm.hide();
                this.loginForm.hide();
                this.registerForm.show();
                break;
            case 'login':
                this.resetForm.hide();
                this.registerForm.hide();
                this.loginForm.show();
                break;
            case 'none':
            default:
                this.loginForm.hide();
                this.registerForm.hide();
                this.resetForm.hide();
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
                Template.show(this.loginLink);
                Template.show(this.resetPasswordLink);
                return this;
            case 'reset':
                Template.hide(this.resetPasswordLink);
                Template.show(this.loginLink);
                Template.show(this.registerLink);
                return this;
            default:
            case 'login':
                Template.hide(this.loginLink);
                Template.show(this.registerLink);
                Template.show(this.resetPasswordLink);
                return this;
        }
    }

    /**
     * Login with no parameters,
     * which will use a sessionId cookie on the backend.
     * @return {Promise}
     */
    loginWithTokenCookie(){
        let self = this;
        return Routes.loginWithTokenCookie()
            .then(function(data){
                self.emit('login.success', data.body);
                self.displayForm('none');
            })
            .catch(function(err){
                console.log(err);
                self.emit('login.required')
            });
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
        if(this.cookieLogin){
            if(Cookies.get('sessionId')){
                return this.loginWithTokenCookie();
            }
        }
        else {
            this.displayForm('login');
            this.emit('login.required')
            return Promise.resolve();
        }
    }
}