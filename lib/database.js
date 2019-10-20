const EventEmitter = require('events');
const Mongo = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
const Logger = require('@voliware/logger');

/**
 * Controls a mongo client, db, and collections.
 * @extends {EventEmitter}
 */
class Database extends EventEmitter {

    /**
     * Constructor
     * @param {string|object} options
     * @param {string} options.name
     * @param {string} options.host
     * @param {string} options.port
     * @param {string} [options.username]
     * @param {string} [options.password]
     * @param {string} [options.namespace]
     * @returns {Database}
     */
    constructor(options){
        super();
        this.options = {
            name: "admin",
            host: "localhost",
            port: 27017,
            username: "",
            password: "",
            namespace: "",
            useNewUrlParser: true,
            useUnifiedTopology: true
        };
        Object.extend(this.options, options);

        this.logger = new Logger(this.constructor.name, {level: "debug"});

        this.name = this.options.name;
        this.url = (typeof url === "string") ? url : this.createUrl(this.options);
        this.client = new MongoClient(this.url, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        this.db = null;
        this.collections = {};
        return this;
    }

    /**
     * Create a mongodb url string with the following pattern:
     * mongodb://[username:password@]host1[:port1][,host2[:port2],...[,hostN[:portN]]][/[database][?options]]
     * @param {object} params
     * @param {string} params.username 
     * @param {string} params.password
     * @param {string} params.host
     * @param {string} params.port
     * @param {string} params.namespace
     * @returns this;
     */
    createUrl({username, password, host, port, namespace}){
        let url = "mongodb://";

        // optional username/password, both must be set
        if(typeof username === "string" && username.length){
            if(typeof password === "string" && password.length) {
                url += `${username}:${password}@`;
            }
        }
       
        url += `${host}:${port}`;

        if(typeof namespace === "string" && namespace.length){
            url += `/${namespace}`;
        }

        this.logger.verbose("Generated url " + url);

        return url;
    }

    /**
     * Connect to mongo.
     * Throws an error if it fails.
     * @async
     * @returns {Promise<boolean>} true if it connects
     */
    async connect(){
        this.logger.debug(`Connecting to ${this.url}`)
        await this.client.connect();            
        if(this.client.isConnected()){
            this.logger.info(`Connected to ${this.url}`);
            return true;
        }
        else {
            throw new Error(`Failed to connect to ${this.url}`);
        }
    }

    /**
     * Get a collection
     * @param {string} name 
     */
    getDatabase(name){
        return this.client.db(name);
    }

    /**
     * Get a collection stored in the 
     * cached collections list.
     * @param {string} name 
     * @returns {object}
     */
    getCollection(name){
        return this.collections[name];
    }

    /**
     * Get all collections
     * @async
     * @returns {Promise<object>} - collections
     */
    async getCollections(){
        let self = this;
        let collections = {};
        this.logger.debug('Getting database collections');
        return new Promise(function(resolve, reject) {
            self.db.listCollections().toArray(function(err, items) {
                if(err){
                    self.logger.error('Failed to get database collections');
                    reject(err);
                    return;
                }
    
                if(!items.length){
                    self.logger.info('No collections found');
                    resolve(collections)
                    return;
                }
    
                for(let k in items){
                    let name = items[k].name;
                    collections[name] = self.db.collection(name);
                    self.logger.debug(`Found collection ${name}`)
                }
                resolve(collections)
                return;
            });
        });
    }

    /**
     * Process a filter object used for queries.
     * If the filter has an _id property, replace
     * it with a new Mongo.ObjectID.
     * @param {object} filter 
     * @returns {object}
     */
    processFilter(filter={}){
        if(typeof filter._id !== "undefined"){
            filter._id = new Mongo.ObjectID(filter._id);
        }
        return filter;
    }

    /**
     * Connect to mongo using the client.
     * Get the database.
     * Get all collections.
     * @async
     * @returns {Promise<boolean>} true if it connects
     */
    async initialize(){
        await this.connect();
        this.db = this.getDatabase(this.name);        
        this.collections = await this.getCollections();
        return true;
    }
}

module.exports = Database;