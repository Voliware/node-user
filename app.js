const UserApp = require('./user/userApp');
const NodeServer = require('@voliware/node-server')
const Path = require('path');

const userApp = new UserApp();
const httpServer = new NodeServer.HttpServer({
    name: "UserServer",
    port: 80,
    publicPath: Path.join(__dirname, "public")
});
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
        let result = userApp.registerUser(data.body.email, data.body.password);
        if(result){
            response.json({msg: "ok"});
        }
        else {
            response.json({err: "Fail"})
        }
    });
    httpServer.addRoute("POST", "/user/reset", function(request, response, data){

    });
    httpServer.addRoute("POST", "/user/verify", function(request, response, data){

    });
    httpServer.addRoute("POST", "/user/reverify", function(request, response, data){

    });
    httpServer.addRoute("POST", "/user/login", function(request, response, data){
        
    });
    httpServer.addRoute("POST", "/user/logout", function(request, response, data){
        
    });
}
addRoutes(httpServer);
httpServer.start();