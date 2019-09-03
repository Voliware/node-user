/**
 * UserApp module
 * @extends {EventSystem}
 */
class UserApp extends EventSystem {

    /**
     * Constructor
     * @return {UserApp}
     */
    constructor(){
        super();
        let self = this;
        // elements 
        this.wrapper = Template.select('#userApp');
        this.loginForm = Template.select('#loginForm');
        this.registerForm = Template.select('#registerForm');
        this.resetForm = Template.select('#resetForm');
        this.loginLink = Template.select('#loginLink');
        this.registerLink = Template.select('#registerLink');
        this.resetPasswordLink = Template.select('#resetLink');
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
                return this;
            case 'register':
                this.resetForm.hide();
                this.loginForm.hide();
                this.registerForm.show();
                return this;
            default:
            case 'login':
                this.resetForm.hide();
                this.registerForm.hide();
                this.loginForm.show();
                return this;
        }
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
        return Router.user.loginWithTokenCookie()
            .then(function(data){
                self.emit('login.success', data.body);
            })
            .catch(function(err){
                console.log(err);
                self.emit('login.required')
            });
    }

    /**
     * Initialize by trying to login with a cookie.
     * If successful, emits login.success.
     * If cookie does not exist, emits login.required.
     * @return {Promise}
     */
    initialize(){
        if(Cookies.get('sessionId')){
            return this.loginWithTokenCookie();
        }
        else {
            this.emit('login.required')
            return Promise.resolve();
        }
    }
}