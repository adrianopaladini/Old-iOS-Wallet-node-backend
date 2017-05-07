var moment      = require('moment');
var uuid        = require('node-uuid');
var passbook    = require('passbook.js');
var Q           = require('q');
var _ 			= require('lodash');
var db          = require('../../config/db').spawn();

module.exports = {
	getPassbook         : getPassbook,
	registerPassbook    : registerPassbook,
	unregisterPassbook  : unregisterPassbook,
	getUpdatedSerials	: getUpdatedSerials
}

/**
 * Create the Passbook Stream
 * @param pass
 * @param serial
 * @returns {promise}
 */
function getPassbook(pass, serial) {

	var deferred = Q.defer();

	db.view('passes', "registration", {
			include_docs: true,
			key: [pass, serial]
		}, function(err, result) {
			if(err || result.rows.length == 0) {
				deferred.reject();
				return;
			}

			var passbook_json = result.rows.map(function(row) {
				delete row.doc._rev;
				delete row.doc._id;

				return row.doc;
			});

			passbook.streamPassbook('generic', passbook_json[0], 'keys', 'liorM1lgrom', 'liorM1lgrom',function(pass) {
				deferred.resolve(pass);
			});
		});

	return deferred.promise;
}

/**
 * Associate Device with the Pass
 * @param device
 * @param pass
 * @param serial
 * @returns {*|promise}
 */
function registerPassbook(device, pass, serial, pushToken) {
	var deferred = Q.defer();

	db.view('passes', "registration", {
		include_docs: true,
		key: [pass, serial]
	}, function(err, result) {

		if(err || result.rows.length == 0) {
			deferred.reject();
			return;
		}

		var pass = result.rows.map(function(row){
			return row.doc;
		});

		pass = pass[0];

		var doc = {
			deviceLibraryIdentifier : device,
			pushToken               : pushToken,
			passId                  : pass._id
		};


		db.insert(doc, uuid.v4(), function(err, pass) {
			if(err) {
				deferred.reject();
				return;
			}
			deferred.resolve();
		});		
	});
	return deferred.promise;
}


/**
 * Desassociate Device with the Pass
 * @param device
 * @param pass
 * @returns {*|promise}
 */
function unregisterPassbook(device, pass) {
	var deferred = Q.defer();

	db.view('passes', "registration", {
		include_docs: true,
		key: [pass, serial]
	}, function(err, result) {

		if(err || result.rows.length == 0) {
			deferred.reject();
			return;
		}

		var pass = result.rows.map(function(row){
			return row.doc;
		});

		pass = pass[0];

		db.destroy(pass._id, pass._rev, function(err, body) {
			if(err) {
				deferred.reject();
				return;
			}
			deferred.resolve();
		});
	});
	return deferred.promise;
}

/**
 * Get all updated serials for the Device
 * @param device
 * @param pass
 * @returns {*|promise}
 */
function getUpdatedSerials(device, pass, updateSince) {
	var deferred = Q.defer();

	if(!updateSince) updateSince = '{}';

	db.view('passes', "devices", {
		include_docs: true,
		key: device
	}, function(err, result) {

		if(err) {
			deferred.reject();
			return;
		}

		var passes = result.rows.map(function(row){
			var pass_promise = Q.defer();

			db.get(row.doc.passId, function(err, body){

				if(err) {
					pass_promise.resolve(err);
					return;
				}

				pass_promise.resolve({
					lastUpdated		: body.updateAt,
					serialNumber	: body.serialNumber
				});
			});

			return pass_promise.promise;
		});



		var serialsUpdated = {
			lastUpdated 	: '2500-05-20T15:32:38.813Z',
			serialNumbers	: []
		}

		Q.all(passes).then(function(results){
			results.forEach(function(el){
				if(el.serialNumber) {
					if(moment(serialsUpdated.lastUpdated).valueOf() > moment(el.lastUpdated).valueOf() ) {
						serialsUpdated.lastUpdated = el.lastUpdated;
					}
					serialsUpdated.serialNumbers.push(el.serialNumber);
				}
			});

			if(serialsUpdated.serialNumbers.length == 0) {
				serialsUpdated = {
					lastUpdated 	: moment().toISOString(),
					serialNumbers	: []
				}
			}

			deferred.resolve(serialsUpdated);
		});
	});
	return deferred.promise;
}

