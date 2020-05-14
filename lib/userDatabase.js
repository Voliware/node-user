const Database = require('./database');

/**
 * User database
 * @extends {Database}
 */
class UserDatabase extends Database {

    /**
     * Constructor
     * @param {object} [options={}]
     * @returns {UserDatabase}
     */
    constructor(options = {}){
        options.name = "nodeuser"; 
        options.collections = ["users"];
        super(options);
        return this;
    } 

    /**
     * Delete a user from the collection.
     * @param {object} filter - query filter
     * @param {object} [options] - query options
     * @async
     * @returns {Promise<boolean>} true if deleted
     */
    async deleteUser(filter, options){
        this.logger.debug('Deleting user');
        this.logger.verbose(filter);
        this.logger.verbose(options);
        filter = this.processFilter(filter);
        let result = await this.collections.users.deleteOne(filter);
        if(result.n){
            this.logger.info('Deleted user');
            return true;
        }
        else {
            this.logger.error('Failed to delete user');
            return false;
        }
    }

    /**
     * Find a user from the collection
     * @param {object} filter - query filter
     * @param {object} [options] - query options
     * @async
     * @returns {Promise<object>} user document
     */
    async getUser(filter, options){
        this.logger.debug('Getting user');
        this.logger.verbose(filter);
        this.logger.verbose(options);
        filter = this.processFilter(filter);
        let user = await this.collections.users.findOne(filter, options)
        if(user){
            this.logger.debug('Got user');
            this.logger.verbose(user);
        }
        else {
            this.logger.debug('Failed to find user');
        }
        return user;
    }

    /**
     * Get users
     * @param {object} [filter] 
     * @param {object} [options] 
     * @param {number} [options.limit=25] 
     * @async
     * @returns {Promise<Cursor>} mongodb cursor
     */
    async getUsers(filter={}, options={limit:25}){
        this.logger.debug('Getting users');
        this.logger.verbose(filter);
        this.logger.verbose(options);
        filter = this.processFilter(filter);
        return this.collections.users.find(filter, options);
    }

    /**
     * Insert a user into the collection
     * @param {object} user
     * @param {string} user.username
     * @param {string} user.email
     * @param {string} user.passwordHash
     * @param {string[]} [user.friends]
     * @param {number} [user.level]
     * @param {number} [user.lastLoginDate]
     * @param {number} [user.registerDate]
     * @param {object} [options] 
     * @async
     * @returns {Promise<boolean>} true if inserted
     */
    async insertUser(user, options){
        this.logger.debug('Inserting user');
        this.logger.verbose(user);
        this.logger.verbose(options);
        let result = await this.collections.users.insertOne(user, options)
        if(result.insertedCount){
            this.logger.info('Inserted user');
            return true;
        }
        else {
            this.logger.error('Failed to insert user');
            return false;
        }
    }

    /**
     * Add a session for a user
     * with an id, IP, and browser name.
     * @param {string} userId 
     * @param {string} sessionId 
     * @param {string} ip 
     * @param {string} browser 
     * @async
     * @returns {Promise<boolean>} true if updated
     */
    async addSession(userId, sessionId, ip, browser){
        this.logger.debug('Adding session to user');
        this.logger.verbose(userId, sessionId, ip, browser);
        let filter = {_id: userId};
        let data = {
            $addToSet: {
                sessions: {sessionId, ip, browser}
            }
        }
        let result = await this.updateUser(filter, data)
        if(result){
            this.logger.info('Added session');
            return true;
        }
        else {
            this.logger.error('Failed to add session');
            return false;
        }
    }

    /**
     * Remove all sessions from a user that
     * match an IP and browser name.
     * @param {string} userId 
     * @param {string} ip 
     * @param {string} browser 
     * @async
     * @returns {Promise<boolean>} true if updated
     */
    async deleteSessions(userId, ip, browser){
        this.logger.debug('Deleting user sessions');
        this.logger.verbose(userId, ip, browser);
        let filter = {_id: userId};
        let params = {
            $pull: {
                sessions: {ip, browser}
            }
        };
        let result = await this.updateUser(filter, params)
        this.logger.info(`Deleted sessions`);
        return true
    }

    /**
     * Update a user in the collection
     * @param {object} filter
     * @param {object} user
     * @param {string} [user.username]
     * @param {string} [user.email]
     * @param {string} [user.passwordHash]
     * @param {string[]} [user.friends]
     * @param {number} [user.level]
     * @param {number} [user.lastLoginDate]
     * @param {number} [user.registerDate]
     * @param {object} [options]
     * @async
     * @returns {Promise<boolean>} true if updated
     */
    async updateUser(filter, user, options){
        this.logger.debug('Updating user');
        this.logger.verbose(filter);
        this.logger.verbose(user);
        this.logger.verbose(options);
        filter = this.processFilter(filter);
        let result = await this.collections.users.updateOne(filter, user, options)
        if(result.modifiedCount){
            this.logger.info('Updated user');
            return true;
        }
        else {
            this.logger.warning('Failed to update user');
            return false;
        }
    }

    /**
     * Drop the user collection
     * @returns {Promise}
     */
    dropUsers(){
        this.logger.debug('Dropping users collection');
        return this.collections.users.drop()
            .then(() => {
                this.logger.info('Dropped user collection');
            })
            .catch((err) => {
                this.logger.error('Failed to drop user collection');
                this.logger.error(err);
            });
    }

    /**
     * Wipe the user collection
     * @returns {Promise}
     */
    wipeUsers(){
        this.logger.debug('Wiping users collection');
        return this.collections.users.deleteMany({})
            .then(() => {
                this.logger.info('Wiped user collection');
            })
            .catch((err) => {
                this.logger.error('Failed to wipe user collection');
                this.logger.error(err);
            });
    }
}

module.exports = UserDatabase;