var moment = require('moment');

module.exports = {
	generatePass : generatePass
};

function _formatDatesArray(dates) {
	if(dates.length == 1) {
		return moment(dates[0]).format('dddd, MMMM Do YYYY');
	}

	var formatedDate = "";

	dates.forEach(function(date){
		formatedDate += moment(date).format('dddd, MMMM Do YYYY') + "\n";
	});

	return formatedDate;
}

function _createHostsText(hosts) {
	if(hosts.length == 1) {
		return hosts[0].name + "\n" + hosts[0].email + "\n";
	}

	var hostsText = "";

	hosts.forEach(function(host){
		hostsText += host.name + "\n" + host.email + "\n";
	});

	return hostsText;

}

function _getStatusMessage(status) {
	switch (status) {
		case "new":
			return "Confirmed"
		case "edited":
			return "Changes"
		case "deleted":
			return "Canceled";
		default:
			return "Confirmed";
	}
}

function generatePass(visit, id) {

	var visitor = visit.visitor;

	var siteAddress = visit.site.address + ", " + visit.site.city + " - " + visit.site.state + ", " + visit.site.area_code;

	var location = visit.site.locations;

	location[0].relevantText = "Welcome to "+visit.site.name;

	return {
		formatVersion: 1,
		passTypeIdentifier: "pass.com.ibm.cio.visitors",
		serialNumber: id,
		createdAt : moment().toISOString(),
		updatedAt : moment().toISOString(),
		teamIdentifier: "PETKK2G752",
		void : 0,
		expirationDate : moment(visit.dates[visit.dates.lenght-1]).add(1,'days').toISOString(),
		barcode: {
			message: visit._id +"|"+ visitor._id,
			format: "PKBarcodeFormatQR",
			messageEncoding: "iso-8859-1"
		},
		organizationName: "IBM Visitors",
		description: "IBM Visitors Wallet Card",
		logoText: "IBM Visitors",
		foregroundColor: "rgb(255, 255, 255)",
		backgroundColor: "rgb(0, 126, 189)",
		icon: "BusinessCard.pass/icon.png",
		logo: "BusinessCard.pass/logo.png",
		icon2x: "BusinessCard.pass/icon@2x.png",
		logo2x: "BusinessCard.pass/logo@2x.png",
		webServiceURL : "https://visitors-wallet.mybluemix.net/passes",
		authenticationToken : "4d00f98f59269da1844c55f1c0369a94",
		locations: visit.site.locations,
		maxDistance: visit.site.maxDistance,
		eventTicket: {
		    primaryFields: [
		    	{
		        	key: "event",
		        	label: "SITE",
		        	value: "IBM "+visit.site.name
		    	}
		    ],
		    headerFields: [
				{
					key: "loc",
					label: moment(visit.dates[0]).format('dddd'),
					value: ( moment(visit.dates[0]).format('MMM Do')+((visit.dates.length > 1)? (" ("+(visit.dates.length - 1)+"+)") : ""))
				}
		    ],
			secondaryFields: [
				{
					key: "loc",
					label: "CREATED BY",
					value: visit.created_by.name + " - " + visit.created_by.email
				}
			],
			auxiliaryFields: [
				{
					key: "name",
					label: "INFORMATION",
					value: "Your host will be notified as soon as you present your "+visit.visitor.document+" and this QR Code in the reception."
				}
			],
			backFields: [
				{
					key: "name",
					label: "Dates",
					value: _formatDatesArray(visit.dates)
				},
				{
					key: "name",
					label: "Hosts",
					value: _createHostsText(visit.hosts)
				},
				{
					key: "name",
					label: "Which document should I bring?",
					value: "Your "+visit.visitor.document
				},
				{
					key: "name",
					label: "Site",
					value: visit.site.name
				},
				{
					key: "name",
					label: "City - State",
					value: visit.site.city + " - " + visit.site.state
				},
				{
					key: "address",
					label: "Address",
					value: visit.site.address
				},
				{
					key: "name",
					label: "Area Code",
					value: visit.site.area_code
				},
				{
					key: "web",
					label: "Comment",
					value: visit.comment
				}
			]
		}
	};
};