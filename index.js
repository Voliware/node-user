const Path = require('path');
const User = require("./lib/user");
const UserApp = require("./lib/userApp");
const UserAppRestInterface = require("./lib/userAppRestInterface");
const UserDatabase = require("./lib/userDatabase");
const UserSession = require("./lib/userSession");

module.exports = {
    User,
    UserApp,
    UserAppRestInterface,
    UserDatabase,
    UserSession,
    public: {
        js: Path.join(__dirname, "/public/js/app.min.js"),
        css: Path.join(__dirname, "/public/css/style.min.js")
    }
};