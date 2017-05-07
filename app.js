var express    = require('express');
var bodyParser = require('body-parser');
var passbook   = require('passbook.js');
var moment 	   = require('moment');
var db         = require('./config/db');
var app        = express();

app.use(require('cors')());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.enable('trust proxy');

if(process.env.VCAP_APP_PORT ) {
	app.use (function (req, res, next) {
		if (req.secure) {
			next();
		} else {
			res.redirect('https://' + req.headers.host + req.url);
		}
	});
}

app.use(require('./features/wallet/wallet_route'));

app.use(require('./features/passbook/passbook_route'));

// Start Server
var server = require('http').createServer(app);

db.create_database().then(function() {
	return db.syncViews.sync();
}).then(function(){
	server.listen(process.env.PORT || 3001, process.env.IP || '0.0.0.0', function() {
		console.log('Express passbook listening on %d, in %s mode', process.env.PORT || 3001, app.get('env'));
	});
}).fail(function(err){
	console.log(err);
});

// Exporting the App for using it in later modules
exports.app = app;
