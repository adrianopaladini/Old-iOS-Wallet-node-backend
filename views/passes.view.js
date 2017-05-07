// This page is used to create custom views from the normal ones inside the views file
module.exports = {
	devices: {
		map: function (doc) {
			if(doc.deviceLibraryIdentifier) {
				emit(doc.deviceLibraryIdentifier, doc);  
			}
		}
	},
	registration: {
		map: function (doc) {
			if(doc.passTypeIdentifier && doc.serialNumber) {
				emit([doc.passTypeIdentifier , doc.serialNumber], doc);  
			}
		}
	},
	serials: {
		map: function (doc) {
			if(doc.deviceLibraryIdentifier) {
				emit(doc.passId, doc);  
			}
		}
	}
};
