const NodeServer = require('@voliware/node-server')
const Path = require('path');
const UserApp = require('./lib/userApp');
const UserAppRestInterface = require('./lib/userAppRestInterface');

const http_server = new NodeServer.HttpServer({
    name: "UserServer",
    port: 80,
    public_path: Path.join(__dirname, "public")
});
const app = new UserApp();
const api = new UserAppRestInterface(app, http_server);
app.initialize();
http_server.start();