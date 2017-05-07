
var Passbook = require('./passbook_model');
var PushService = require('../push/push_service');

module.exports = {
	getThePassbook      : getThePassbook,
	registerDevice      : registerDevice,
	unregisterDevice    : unregisterDevice,
	getUpdatedSerials	: getUpdatedSerials
};

/**
 * Get the Passbook from the Server
 */
function getThePassbook(req, res) {

	Passbook.getPassbook(req.params.pass, req.params.serial)
		.then(function(passbook){

			res.setHeader('Content-disposition', 'attachment; filename=' + 'passbook' + '.pkpass');
			res.setHeader('Content-type', "application/vnd.apple.pkpass");

			passbook.pipe(res);
		})
		.fail(function(){
			res.status(400);
		});
}

/**
 * Register the Device with the Passbook Serial and Pass Type
 */
function registerDevice(req, res) {

	PushService.createDevice(req.params.device,req.body.pushToken);

	Passbook.registerPassbook(req.params.device,req.params.pass,req.params.serial,req.body.pushToken)
		.then(function(){
			res.status(201).send('Created');
		}).fail(function(){
		res.status(400);
	});
}

/**
 * Unregister the Device with the Passbook Serial and Pass Type
 */
function unregisterDevice(req, res) {

	Passbook.unregisterPassbook(req.params.device,req.params.pass)
		.then(function(){
			res.status(200).send('OK');
		}).fail(function(){
			res.status(200).send('OK');
		});
}

/**
 * Get Update Serial Numbers for Update
 */
function getUpdatedSerials(req, res) {

	Passbook.getUpdatedSerials(req.params.device,req.params.pass)
		.then(function(serials){
			res.status(200).json(serials);
		}).fail(function(){
			res.status(204).send('No Content');
		});
}