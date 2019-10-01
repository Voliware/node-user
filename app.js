const UserApp = require('./user/userApp');
const NodeServer = require('@voliware/node-server')
const Path = require('path');
const Cookies = require('cookies');

const userApp = new UserApp();
const httpServer = new NodeServer.HttpServer({
    name: "UserServer",
    port: 80,
    publicPath: Path.join(__dirname, "public")
});

// todo: move to user app as auto API hookup
function addRoutes(httpServer){
    httpServer.addRoute("GET", "/user/:id", function(request, response, data){
        
    });
    httpServer.addRoute("DELETE", "/user/:id", function(request, response, data){

    });
    httpServer.addRoute("GET", "/users", function(request, response, data){
        
    });
    httpServer.addRoute("POST", "/user/add", function(request, response, data){

    });
    httpServer.addRoute("PUT", "/user/update", function(request, response, data){

    });
    httpServer.addRoute("POST", "/user/register", function(request, response, data){
        let ip = httpServer.getClientIp(request);
        let browser = httpServer.getClientBrowser(request).family;
        let cookies = new Cookies(request, response);
        
        userApp.registerUser(data.body.username, data.body.password, data.body.email)
            .then(function(user){
                return userApp.loginUser(data.body.username, data.body.password, ip, browser)
            })
            .then(function(user){
                cookies.set('sessionId', user.sessionId, {
                    expires: 0
                });
                httpServer.sendJson(response, {user});
            })
            .catch(function(error){
                httpServer.sendJson(response, {err: error.toString()});
                console.log(error);
            });
    });
    httpServer.addRoute("POST", "/user/reset", function(request, response, data){

    });
    httpServer.addRoute("POST", "/user/verify", function(request, response, data){

    });
    httpServer.addRoute("POST", "/user/reverify", function(request, response, data){

    });
    httpServer.addRoute("POST", "/user/login", async function(request, response, data){
        let ip = httpServer.getClientIp(request);
        let browser = httpServer.getClientBrowser(request).family;
        let cookies = new Cookies(request, response);
        let sessionId = cookies.get('sessionId');
        let user = null;
        if(sessionId){
            user = await userApp.loginUserWithSessionId(sessionId, ip, browser)
                .catch(function(error){
                    httpServer.sendJson(response, {err: error.toString()});
                    console.log(error);
                });
        }
        else if(data.body.username) {
            user = await userApp.loginUser(data.body.username, data.body.password, ip, browser)
                .catch(function(error){
                    httpServer.sendJson(response, {err: error.toString()});
                    console.log(error);
                });
        }
        else {
            httpServer.sendJson(response, {error: "Failed to login"});
            return;
        }

        if(user){
            cookies.set('sessionId', user.sessionId, {
                expires: 0
            });
            httpServer.sendJson(response, {user});
        }
        else {
            httpServer.sendJson(response, {error: "Failed to login"});
            return;
        }
    });
    httpServer.addRoute("POST", "/user/logout", function(request, response, data){
        let cookies = new Cookies(request, response);
        let sessionId = cookies.get('sessionId');
        userApp.logoutUser(sessionId)
            .then(function(){
                // expire the cookie
                cookies.set('sessionId');
                response.send(200);
            })
            .catch(function(error){
                httpServer.sendJson(response, {err: error.toString()});
            });
    });
}
addRoutes(httpServer);
httpServer.start();