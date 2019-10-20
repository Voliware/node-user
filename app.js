const NodeServer = require('@voliware/node-server')
const Path = require('path');
const UserApp = require('./lib/userApp');
const UserAppRestInterface = require('./lib/userAppRestInterface');

const app = new UserApp();
const api = new UserAppRestInterface(app);
app.initialize();
const httpServer = new NodeServer.HttpServer({
    name: "UserServer",
    port: 80,
    publicPath: Path.join(__dirname, "public")
});

httpServer.addRoute("GET", "/user/:id", function(request, response, data){
    api.getUser(request, response, data);
});
httpServer.addRoute("DELETE", "/user/:id", function(request, response, data){
    api.deleteUser(request, response, data);
});
httpServer.addRoute("GET", "/users", function(request, response, data){
    api.getUsers(request, response, data);
});
httpServer.addRoute("POST", "/user/add", function(request, response, data){
    api.addUser(request, response, data);
});
httpServer.addRoute("PUT", "/user/update", function(request, response, data){
    api.updateUser(request, response, data);
});
httpServer.addRoute("POST", "/user/register", function(request, response, data){
    api.registerUser(request, response, data);
});
httpServer.addRoute("POST", "/user/reset", function(request, response, data){
    api.resetPassword(request, response, data);
});
httpServer.addRoute("POST", "/user/verify", function(request, response, data){
    api.verifyUser(request, response, data);
});
httpServer.addRoute("POST", "/user/login", async function(request, response, data){
    api.loginUser(request, response, data);
});
httpServer.addRoute("POST", "/user/logout", function(request, response, data){
    api.logoutUser(request, response, data);
});
httpServer.start();