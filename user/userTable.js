/**
 * User Table
 */
class UserTable {

    /**
     * Constructor
     * @return {UserTable}
     */
    constructor(){
        this.name = "User";
        return this;
    }

    getCreateTableQuery(){
        return `CREATE TABLE ${this.name} 
            (Name TEXT,
            Email TEXT,
            Password TEXT,
            Joined INT,
            LastLogin INT)`;
    }

    /**
     * Delete a user from the collection.
     * @param {object} filter 
     * @return {Promise}
     */
    deleteUser(filter){
        this.logger.debug('Deleting user with filter');
        this.logger.debug(filter);

        filter = this.processFilter(filter);
        let self = this;
        return this.collection.deleteOne(filter)
            .then(function(result){
                if(result.n){
                    self.logger.info('Deleted user');
                }
                else {
                    self.logger.debug('Did not delete any users');
                }
            })
            .catch(function(err){
                self.logger.error('Failed to delete user');
                self.logger.error(err);
                return Promise.reject(err);
            });
    }

    /**
     * Delete all users from the collection
     * @return {Promise}
     */
    deleteAllUsers(){
        this.logger.debug('Deleting all users');

        let self = this;
        return this.collection.drop()
            .then(function(){
                self.logger.info('Deleted all users');
            })
            .catch(function(err){
                self.logger.error('Failed to delete all users (no table)');
                self.logger.error(err);
                return Promise.resolve();
            });
    }

    /**
     * Find a user from the collection
     * @param {object} filter - query filter
     * @return {Promise}
     */
    getUser(filter){
        this.logger.debug('Getting user with filter');
        this.logger.debug(filter);

        filter = this.processFilter(filter);
        let self = this;
        return this.collection.findOne(filter)
            .then(function(element) {
                if(element){
                    self.logger.debug('Got user');
                    self.logger.debug(element);
                }
                else {
                    self.logger.debug('Did not find user');
                }
                return element;
            })
            .catch(function(err){
                self.logger.error('Failed to query user');
                self.logger.error(err);
                return Promise.reject(err);
            });
    }

    /**
     * Insert a user into the collection
     * @param {object} user
     * @param {string} user.email
     * @param {string} user.passwordHash
     * @param {string[]} [user.friends]
     * @param {number} [user.level]
     * @param {number} [user.lastLoginDate]
     * @param {number} [user.registerDate]
     * @return {Promise}
     */
    insertUser(user){
        this.logger.debug('Inserting user with data');
        this.logger.debug(user);

        let self = this;
        return this.collection.insertOne(user)
            .then(function(res) {
                if(res.insertedCount){
                    self.logger.info('Inserted user into db');
                    return res;
                }
                else {
                    return Promise.reject('Inserted count was 0');
                }
            })
            .catch(function(err){
                self.logger.error('Failed to insert user into db');
                self.logger.error(err);
                return Promise.reject(err)
            });
    }

    /**
     * Update a user in the collection
     * @param {object} filter
     * @param {object} user
     * @param {string} [user.email]
     * @param {string} [user.passwordHash]
     * @param {string[]} [user.friends]
     * @param {number} [user.level]
     * @param {number} [user.lastLoginDate]
     * @param {number} [user.registerDate]
     * @return {Promise}
     */
    updateUser(filter, user){
        this.logger.debug('Inserting user with data');
        this.logger.debug(user);

        let self = this;
        filter = this.processFilter(filter);
        return this.collection.updateOne(filter, user)
            .then(function(res) {
                if(res.modifiedCount){
                    self.logger.info('Updated user in db');
                    return res;
                }
                else {
                    return Promise.reject('Modified count was 0');
                }
            })
            .catch(function(err){
                self.logger.error('Failed to update user in db');
                self.logger.error(err);
                return Promise.reject(err)
            });
    }
}

module.exports = UserTable;