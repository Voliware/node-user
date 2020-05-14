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
    // front end components
    public: {
        js: Path.join(__dirname, "/public/js/user-app.min.js"),
        css: Path.join(__dirname, "/public/css/user-style.min.js"),
        html: Path.join(__dirname, "/public/html/user-app.html")
    }
};