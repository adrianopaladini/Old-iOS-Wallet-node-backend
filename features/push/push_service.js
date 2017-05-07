var cfenv 	= require('cfenv');
var Q		= require('q');
var request	= require('request');

var ApplicationEnviroment = cfenv.getAppEnv();
var PushNotificationEnviroment = ApplicationEnviroment.getServiceCreds('IBM Push Notifications-x6');
var MobileClientAccessEnviroment = ApplicationEnviroment.getServiceCreds('Mobile Client Access-88');

module.exports = {
	createDevice 	: createDevice,
	pushChanges		: pushChanges
}

/**
 * Create the Device at the IBM Push Notifications
 * @param deviceID
 * @param token
 * @returns {promise}
 */
function createDevice(deviceId,token) {
	var deferred = Q.defer();

	var device_document = {
		deviceId	: deviceId,
		platform	: "A",
		token		: token
	}

	request.post({
			headers: {
				'content-type': 'application/json',
				'Accept': 'application/json',
				'Accept-Language': 'en-US',
				'Application-Mode': 'PRODUCTION'
			},
			url: PushNotificationEnviroment.url + '/' + MobileClientAccessEnviroment.clientId + '/devices?mfpPushEnableBroadcast=true',
			body: JSON.stringify(device_document)
		},
		function (error, response, body) {
			deferred.resolve({
				status: response.statusCode,
				body: body,
				deviceId: deviceId
			});
		});
	
	return deferred.promise;
}

/**
 * Push Changes of the Passbook to the Devices
 * @returns {promise}
 */
function pushChanges() {

	var deferred = Q.defer();

	var pushMessage = {
		message: {
			alert: "Notification alert message"
		}
	};

	request.post({
			headers: {
				'content-type': 'application/json',
				'Accept': 'application/json',
				'Accept-Language': 'en-US',
				'Application-Mode': 'PRODUCTION',
				'appSecret': PushNotificationEnviroment.appSecret
			},
			url: PushNotificationEnviroment.url + '/' + MobileClientAccessEnviroment.clientId + '/messages',
			body: JSON.stringify(pushMessage)
		},
		function (error, response, body) {
			deferred.resolve({
				status: response.statusCode,
				body: body,
			});
		});

	return deferred.promise;
}