/**
 * Static backend routes.
 */
class Routes {

    /**
     * Get all users.
     * Must be logged in with appropriate priviledges.
     * @returns {Promise}
     */
    static getUsers(){
        return fetch("/users")
            .catch((err) => {
                console.error(err);
            });
    }

    /**
     * Get a user.
     * Must be logged in with appropriate priviledges.
     * @param {string} userId 
     * @returns {Promise}
     */
    static getUser(userId){
        return fetch(`/user/${userId}`)
            .catch((err) => {
                console.error(err);
            });
    }
    
    /**
     * Add a user.
     * @param {object} params
     * @param {string} params.username
     * @param {string} params.email
     * @param {string} params.password
     * @returns {Promise}
     */
    static addUser({username, email, password}){
        let body = JSON.stringify({username, email, password});
        return fetch("/user", {
            method: "post",
            body: body
        }).catch((err) => {
            console.error(err);
        });
    }

    /**
     * Delete a user.
     * Must be logged in with appropriate priviledges.
     * @param {string} userId 
     * @returns {Promise}
     */
    static deleteUser(userId){
        return fetch(`/user/${userId}`, {
            method: "delete"
        }).catch((err) => {
            console.error(err);
        });
    }
    
    /**
     * Update a user.
     * Note: password params is "older" and "newer"
     * because "new" cannot be used.
     * @param {object} params
     * @param {string} params.username
     * @param {string} params.email
     * @param {object} params.password
     * @param {string} params.password.older
     * @param {string} params.password.newer
     * @returns {Promise}
     */
    static updateUser({username, email, password: {older, newer}}){
        let body = JSON.stringify({username, email, password: {older, newer}});
        return fetch("/user", {
            method: "put",
            body: body
        }).catch((err) => {
            console.error(err);
        });
    }
    
    /**
     * Login a user
     * @param {object} params
     * @param {string} params.username
     * @param {string} params.password
     * @returns {Promise}
     */
    static login({username, password}){
        let body = JSON.stringify({username, password});
        return fetch("/user/login", {
            method: "post",
            body: body
        }).catch((err) => {
            console.error(err);
        });
    }

    /**
     * Login a user with no parameters.
     * Relies on a browser cookie being read.
     * @returns {Promise}
     */
    static loginWithCookie(){
        return fetch("/user/login", {
            method: "post",
        }).catch((err) => {
            console.error(err);
        });
    }

    /**
     * Logout a user.
     * Only works if the user is logged in.
     * @returns {Promise}
     */
    static logout(){
        return fetch("/user/logout", {
            method: "post"
        }).catch((err) => {
            console.error(err);
        });
    }

    /**
     * Register a user
     * @param {object} params
     * @param {string} params.username
     * @param {string} params.email
     * @param {string} params.password
     * @returns {Promise}
     */
    static register({username, email, password}){
        let body = JSON.stringify({username, email, password});
        return fetch("/user/register", {
            method: "post",
            body: body
        }).catch((err) => {
            console.error(err);
        });
    }

    /**
     * Reset a user's password
     * @param {object} params
     * @param {string} params.email
     * @returns {Promise}
     */
    static resetPassword({email}){
        let body = JSON.stringify({email});
        return fetch("/user/reset", {
            method: "post",
            body: body
        }).catch((err) => {
            console.error(err);
        });
    }
}