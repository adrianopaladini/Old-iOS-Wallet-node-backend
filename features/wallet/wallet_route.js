var express  = require('express');
var router   = express.Router();

var walletController = require('./wallet_controller');


// Get the Passbook File
router
	.route('/wallet/:id')
	.get(walletController.createThePass);

// Sync the New Pass with the Device
router
	.route('/sync/:id')
	.post(walletController.newPass);

module.exports = router;