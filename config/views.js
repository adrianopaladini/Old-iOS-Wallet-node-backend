var Cloudant        = require('cloudant');
var fs              = require('fs');
var path            = require('path');
var equal           = require('deep-equal');
var cfenv 			= require('cfenv');
var Q				= require('q');

var ApplicationEnviroment 	= cfenv.getAppEnv();
var CloudantEnviroment 		= ApplicationEnviroment.getServiceCreds('Cloudant NoSQL DB-ba');

module.exports = {
	sync : sync
};

function sync () {
	var sync_deferred = Q.defer();

	fs.readdirSync(path.join(__dirname, '../views')).forEach(function(file) {
		var design_name = file.slice(0,file.length-8);
		var views       = require('../views/'+file);

		console.log("Creating Views for : "+design_name);

		Object.keys(views).map(function() {
			_checkTheDesignDocument('_design/'+design_name, views);
		});
	});

	sync_deferred.resolve();
	return sync_deferred.promise;
}

/**
 * Check if the Design Document already exists in the Database
 * @param design_name Document Design Name
 * @param views Views functions of the design document
 * @param "visitors_wallet" Database name
 */
function _checkTheDesignDocument(design_name, views) {

	Cloudant(CloudantEnviroment.url).use("ios_wallet").get(design_name, function(err, design_document) {

		if(err && err.statusCode === 404) {
			return _insertDesignDocument(null, design_name, views);
		} else if(err) {
			return err;
		} else if(equal(design_document.views, views)) {
			return true;
		} else {
			return _insertDesignDocument(design_document, design_name, views);
		}
	});
}

/**
 * Create / Update the Design Document Name
 * @param design_name Document Design Name
 * @param views Views functions of the design document
 * @param "visitors_wallet" Database name
 * @private
 */
function _insertDesignDocument(design_document, design_name, views) {

	if(!design_document) {
		design_document = {
			language: 'javascript',
			views: {}
		};
	}
	design_document.views = views;
	return Cloudant(CloudantEnviroment.url).use("ios_wallet").insert(design_document, design_name, function(err) {
		if(err && err.statusCode === 409) {
			Cloudant(CloudantEnviroment.url).db.destroy(design_name, function(err) {
				if(err) {
					return err;
				}
				return _checkTheDesignDocument(design_name, views, cb);
			});
		} else {
			return false;
		}
	});
}