var express  = require('express');
var router   = express.Router();

var serverController = require('./passbook_controller');


// Get the Passbook from the Server
router
	.route('/passes/v1/passes/:pass/:serial')
	.all(serverController.getThePassbook);

// Register the Device with the Pass
router
	.route('/passes/v1/devices/:device/registrations/:pass/:serial')
	.post(serverController.registerDevice);

// Unregister the Device with the Pass
router
	.route('/passes/v1/devices/:device/registrations/:pass')
	.delete(serverController.unregisterDevice);

// Get Updated Serials
router
	.route('/passes/v1/devices/:device/registrations/:pass')
	.get(serverController.getUpdatedSerials);

//passes/v1/devices/24310ace74455237eff6ddb9edef76e3/registrations/pass.com.cassiorossi.businesscard
//
// router.route('/passes/v1/devices/:device_library_identifier/registrations/:pass_type_identifier').all(function(req, res){
//
// });
//

module.exports = router;