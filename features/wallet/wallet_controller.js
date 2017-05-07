var Wallet 			= require('./wallet_model');
var PushService		= require('../push/push_service');

module.exports = {
	newPass         : newPass,
	createThePass   : createThePass
};

// --------

/**
 * New Passbook Document
 */
function newPass(req, res) {

	PushService.pushChanges();

	Wallet.newPassbookDocument(req.params.id, req.body)
		.then(function(passbook){
			res.status(200).json(passbook);
		})
		.fail(function(){
			res.status(400);
		});
}

/**
 * Download the Passbook
 */
function createThePass(req, res) {

	Wallet.getThePassbookFile(req.params.id)
		.then(function(pass){

			res.setHeader('Content-disposition', 'attachment; filename=' + req.params.id + '.pkpass');
			res.setHeader('Content-type', "application/vnd.apple.pkpass");
			pass.pipe(res);
		})
		.fail(function(err){
			res.status(400).send(err);
		});
}
