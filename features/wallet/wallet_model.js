var express     = require('express');
var passbook    = require('passbook.js');
var Q           = require('q');
var db          = require('../../config/db').spawn();
var Pass        = require('./wallet_generator');

module.exports = {
	newPassbookDocument     : newPassbookDocument,
	getThePassbookFile      : getThePassbookFile
}

/**
 * Create the Passbook Stream
 * @param pass
 * @param serial
 * @returns {promise}
 */
function newPassbookDocument(id , document) {
	var deferred = Q.defer();

	var doc = Pass.generatePass(document,id);
	db.get(id ,function(err, body) {
		if(err && err.statusCode != 404) {
			deferred.reject(err);
			return;
		}else if(err && err.statusCode == 404) {
			// Create new Pass
			db.insert(doc, id ,function(err, body) {
				if(err) { deferred.reject(err); return; }

				deferred.resolve({
					passbook_id : body.id
				});
			});
		} else {
			// Update Old Pass with new Info
			doc._id = id;
			doc._rev = body._rev;

			db.insert(doc,function(err, body) {
				if(err) { deferred.reject(err); return; }

				deferred.resolve({
					passbook_id : body.id
				});
			});
		}
	});
	return deferred.promise;
}

/**
 * Create the Passbook Stream
 * @param {string} id Passbook ID
 * @returns {promise}
 */
function getThePassbookFile(id) {
	var deferred = Q.defer();

	db.get(id ,function(err, body) {
		if(err) {
			deferred.reject(err);
			return;
		}
		
		passbook.streamPassbook('generic', body, 'keys', 'liorM1lgrom', 'liorM1lgrom',function(pass) {
			deferred.resolve(pass);
		});
	});

	return deferred.promise;
}
