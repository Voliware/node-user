const NodeServer = require('@voliware/node-server')
const Path = require('path');
const UserApp = require('./lib/userApp');
const UserAppRestInterface = require('./lib/userAppRestInterface');

const httpServer = new NodeServer.HttpServer({
    name: "UserServer",
    port: 80,
    public_path: Path.join(__dirname, "public")
});
const app = new UserApp();
const api = new UserAppRestInterface(app, httpServer);
api.initialize();