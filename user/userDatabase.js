const Logger = require('@voliware/node-logger');
const sqlite3 = require('sqlite3').verbose();
const UserTable = require('./userTable');

class UserDatabase {
    constructor(){
        this.logger = new Logger("UserDb", this);
        this.db = new sqlite3.Database('User.db', function(err){
            if(err == null){
                this.logger
            }
        });
        this.userTable = new UserTable();
        return this;
    }

    createTables(){
        db.run(tbis.userTable.getCreateTableQuery());
        return this;
    }
}

module.exports = UserDatabase;