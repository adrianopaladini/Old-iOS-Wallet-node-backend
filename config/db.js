var Cloudant    = require('cloudant');
var Config      = require('./index');
var Q           = require('q');
var views       = require('./views');
var cfenv 		= require('cfenv');

module.exports = {
	spawn 			: spawn,
	create_database : create_database,
	syncViews       : views
};

/**
 * Spawn the connection to the Cloudant
 */
function spawn() {
	return Cloudant(Config.cloudant).use(Config.database);
}

var ApplicationEnviroment 	= cfenv.getAppEnv();
var CloudantEnviroment 		= ApplicationEnviroment.getServiceCreds('Cloudant NoSQL DB-ba');

/**
 * Create the Database
 */
function create_database() {
	var deferred = Q.defer();
	Cloudant(CloudantEnviroment.url).db.get("ios_wallet", function(err,database){
		if(database) {
			console.log("Database is already created : ios_wallet");
			deferred.resolve();
		} else if (err && err.statusCode == '404'){
			Cloudant(CloudantEnviroment.url).db.create("ios_wallet", function(err) {
				if (err) {
					console.log('Error creating database');
					deferred.reject(err);
				} else {
					console.log('DB ios_wallet created!');
					deferred.resolve();
				}
			});
		} else if(err){
			console.log('Error creating database');
			deferred.reject(err);
		}
	});
	return deferred.promise;
}