const Cookies = require('cookies');
const UserAgent = require('useragent');
const User = require('./user');

/**
 * REST interface for UserApp.
 * Requires a valid ClientRequest, ServerResponse, 
 * and object of parsed request data for every API call.
 */
class UserAppRestInterface {

    /**
     * Constructor
     * @param {UserApp} app 
     * @returns {UserAppRestInterface}
     */
    constructor(app){
        this.app = app;
        return this;
    }

    /**
     * Stringify an object as the 
     * data response, set the content type to
     * application/json, and set the status code to 200.
     * If the JSON cannot be stringified, the 
     * status code will be set to 500.
     * This ends the response.
     * @param {ServerResponse} response 
     * @param {object} data - any object that can be stringified to JSON
     * @param {number} [code=200]
     * @returns {ServerResponse}
     */
    sendJson(response, data, code = 200){
        try {
            let json = JSON.stringify(data);
            response.statusCode = code;
            response.setHeader('Content-Type', 'application/json');
            response.write(json);
        }
        catch (e){
            console.error(e);
            response.statusCode = 500;
        }
        response.end();
        return response;
    };

    /**
     * Send a simple status code based response.
     * This ends the response.
     * @param {ServerResponse} response 
     * @param {number} code
     * @returns {ServerResponse}
     */
    sendCode(response, code){
        response.statusCode = code;
        response.end();
        return response;
    }

    /**
     * Send an error response.
     * This ends the response.
     * @param {ServerResponse} response 
     * @param {string} error - string error
     * @param {number} [code=400]
     * @returns {ServerResponse}
     */
    sendError(response, error, code = 400){
        return this.sendJson(response, {error}, code);
    };

    /**
     * Send an error response indicating that
     * passed body data is invalid.
     * This ends the response.
     * @param {ServerResponse} response 
     * @returns {ServerResponse}
     */
    sendErrorInvalidBody(response){
        return this.sendError(response, "Invalid body");
    }

    /**
     * Send an error response indicating that
     * the user must be logged in.
     * This ends the response.
     * @param {ServerResponse} response 
     * @param {number} [code=200]
     * @returns {ServerResponse}
     */
    sendErrorNotLoggedIn(response){
        return this.sendError(response, "Not logged in", 403);
    }
    
    /**
     * Get the client's IP from a request.
     * https://stackoverflow.com/questions/8107856/how-to-determine-a-users-ip-address-in-node
     * @param {ClientRequest} request
     * @returns {string}
     */
    getClientIp(request){
        return (request.headers['x-forwarded-for'] || '').split(',').pop() || 
            request.connection.remoteAddress || 
            request.socket.remoteAddress || 
            request.connection.socket.remoteAddress;
    }

    /**
     * Get the client's browser from a request.
     * @param {ClientRequest} request 
     * @returns {string}
     */
    getClientBrowser(request){
        return UserAgent.lookup(request.headers['user-agent']).family;
    }

    /**
     * Generate a mongo query filter from
     * the data in a request body.
     * This will use an "or" operator
     * so that a query may match any value.
     * @param {object} data
     * @param {string} [data.username]
     * @param {string} [data.email]
     * @param {string} [data._id]
     * @returns {object} mongo filter
     */
    generateUserFilter(data){
        let options = [
            {email: data.email}, 
            {username: data.username},
            {_id: data._id}
        ];
        return {$or: options};
    }

    /**
     * Get information about a client making the request.
     * @param {ClientRequest} request 
     * @param {ServerResponse} response 
     * @returns {{ip: string, browser: string, sessionId: string}} object with ip, browser, sessionId
     */
    getClient(request, response){
        let ip = this.getClientIp(request);
        let browser = this.getClientBrowser(request);
        let cookies = new Cookies(request, response);
        let sessionId = cookies.get('sessionId');
        return {ip, browser, sessionId, cookies};
    }

    /**
     * Get the user matching the client making the request.
     * @param {ClientRequest} request 
     * @param {ServerResponse} response 
     * @returns {Promise<object>} user object or null if not found
     */
    async getClientUser(request, response){
        let client = this.getClient(request, response);
        return this.app.loginUserWithSessionId(client.sessionId, client.ip, client.browser);
    }

    /**
     * Add a user.
     * @param {ClientRequest} request 
     * @param {ServerResponse} response 
     * @param {object} data 
     * @param {object} data.body
     * @param {object} data.body.user
     * @param {string} data.body.user.username
     * @param {string} data.body.userpassword
     * @param {string} [data.body.user.email]
     * @returns {ServerResponse}
     */
    async addUser(request, response, data){
        if(!data.body || !data.body.user){
            return this.sendErrorInvalidBody(response);
        }

        let clientUser = await this.getClientUser(request, response);
        if(!clientUser){
            return this.sendErrorNotLoggedIn(response);
        }

        let result = await this.app.addUser(clientUser, data.body.user);
        if(result){
            return this.sendCode(response, 200);
        }
        else{
            return this.sendError(response, "Failed to delete user");
        }
    }

    /**
     * Delete a user.
     * @param {ClientRequest} request 
     * @param {ServerResponse} response 
     * @param {object} data 
     * @param {object} data.query - at least one query param must be set
     * @param {string} [data.query.username]
     * @param {string} [data.query.email]
     * @param {string} [data.query._id]
     * @returns {ServerResponse}
     */
    async deleteUser(request, response, data){
        if(!data.query){
            return this.sendErrorInvalidBody(response);
        }

        let clientUser = await this.getClientUser(request, response);
        if(!clientUser){
            return this.sendErrorNotLoggedIn(response);
        }

        let filter = this.generateUserFilter(data.query);
        let result = await this.app.deleteUser(clientUser, filter);
        if(result){
            return this.sendCode(response, 200);
        }
        else{
            return this.sendError(response, "Failed to delete user");
        }
    }

    /**
     * Get a user from the database.
     * @param {ClientRequest} request 
     * @param {ServerResponse} response 
     * @param {object} data.query - at least one query param must be set
     * @param {string} [data.query.username]
     * @param {string} [data.query.email]
     * @param {string} [data.query._id]
     * @returns {ServerResponse}
     */
    async getUser(request, response, data){
        if(!data.query){
            return this.sendErrorInvalidBody(response);
        }

        let clientUser = await this.getClientUser(request, response);
        if(!clientUser){
            return this.sendErrorNotLoggedIn(response);
        }

        let filter = this.generateUserFilter(data.query);
        let user = await this.app.getUser(clientUser, filter);
        if(user){
            return this.sendJson(response, user);
        }
        else{
            return this.sendError(response, "Failed to get user");
        }
    }

    /**
     * Get a list of users.
     * @param {ClientRequest} request 
     * @param {ServerResponse} response 
     * @param {object} data 
     * @returns {ServerResponse}
     */
    async getUsers(request, response, data){
        let clientUser = await this.getClientUser(request, response);
        if(!clientUser){
            return this.sendErrorNotLoggedIn(response);
        }
        
        // todo: deal with filter and options
        let filter = {};
        let options = {};
        let users = await this.app.getUsers(clientUser, filter, options);
        if(users){
            return this.sendJson(response, users);
        }
        else{
            return this.sendError(response, "Failed to get users");
        }
    }

    /**
     * Login a user.
     * @param {ClientRequest} request 
     * @param {ServerResponse} response 
     * @param {object} data 
     * @param {object} data.body
     * @param {string} data.body.username
     * @param {string} data.body.password
     * @returns {ServerResponse}
     */
    async loginUser(request, response, data){
        let clientUser = await this.getClientUser(request, response);
        if(clientUser){
            return this.sendJson(response, clientUser);
        }

        if(!data.body){
            // 401 here because it is an auth attempt
            return this.sendCode(response, 401);
        }

        let client = this.getClient(request, response);
        let user = await this.app.loginUser(data.body.username, data.body.password, client.ip, client.browser);
        if(user){
            client.cookies.set('sessionId', user.sessionId, {
                expires: 0
            });
            return this.sendJson(response, user);
        }
        else {
            return this.sendCode(response, 401);
        }
    }

    /**
     * Logout a user.
     * User must be logged in.
     * @param {ClientRequest} request 
     * @param {ServerResponse} response 
     * @returns {ServerResponse}
     */
    async logoutUser(request, response){
        let clientUser = await this.getClientUser(request, response);
        if(!clientUser){
            return this.sendErrorNotLoggedIn(response);
        }

        let client = this.getClient(request, response);
        let sessionId = client.cookies.get('sessionId');
        let result = await this.app.logoutUser(sessionId)
        if(result){
            // expire cookie
            client.cookies.set('sessionId');
            return this.sendCode(response, 200);
        }
        else {
            return this.sendError("Failed to logout");
        }
    }

    /**
     * Update a user.
     * @param {ClientRequest} request 
     * @param {ServerResponse} response 
     * @param {object} data 
     * @param {object} data.body - at least one body param must be set
     * @param {string} [data.body.username]
     * @param {string} [data.body.email]
     * @param {string} [data.body._id]
     * @returns {ServerResponse}
     */
    async updateUser(request, response, data){
        if(!data.body){
            return this.sendErrorInvalidBody(response);
        }

        let clientUser = await this.getClientUser(request, response);
        if(!clientUser){
            return this.sendErrorNotLoggedIn(response);
        }

        let filter = this.generateUserFilter(request);
        let result = await this.app.updateUser(filter, data);
        if(result){
            return this.sendCode(response, 200);
        }
        else{
            return this.sendError(response, "Failed to update user");
        }
    }

    /**
     * Register a user.
     * @param {ClientRequest} request 
     * @param {ServerResponse} response 
     * @param {object} data 
     * @param {object} data.body
     * @param {string} data.body.username
     * @param {string} data.body.password
     * @param {string} [data.body.email]
     * @returns {ServerResponse}
     */
    async registerUser(request, response, data){
        if(!data.body){
            return this.sendErrorInvalidBody(response);
        }

        let user = await this.app.registerUser(data.body.username, data.body.password, data.body.email);
        if(!user){
            return this.sendError(response, "Failed to register user");
        }

        return this.loginUser(request, response, data);
    }

    /**
     * Reset a password.
     * @param {ClientRequest} request 
     * @param {ServerResponse} response 
     * @param {object} data 
     * @param {object} data.body
     * @param {string} data.body.email
     * @returns {ServerResponse}
     */
    async resetPassword(request, response, data){
        if(!data.body){
            return this.sendErrorInvalidBody(response);
        }

        let result = await this.app.resetPassword(data.body.email);
        if(result){
            return this.sendCode(response, 200);
        }
        else{
            return this.sendError(response, "Failed to reset password");
        }
    }
    
    /**
     * Verify a user registration.
     * @param {ClientRequest} request 
     * @param {ServerResponse} response 
     * @param {object} data 
     * @param {object} data.body
     * @param {string} data.body.email
     * @param {string} data.body.code
     * @returns {ServerResponse}
     */
    async verifyUser(request, response, data){
        if(!data.body){
            return this.sendErrorInvalidBody(response);
        }

        let result = await this.app.verifyUser(data.body.email, data.body.code);
        if(result){
            return this.sendCode(response, 200);
        }
        else{
            return this.sendError(response, "Failed to verify user");
        }
    }
}

module.exports = UserAppRestInterface;