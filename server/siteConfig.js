var fs = require('fs');
var settings = {
	'sessionSecret': 'TODO:addYourOwn',
	'port': 3000,
	'uri': 'http://localhost:3000', // Without trailing /

	// You can add multiple recipiants for notifo notifications
	 /*'notifoAuth': null [
		{
			'username': ''
			, 'secret': ''
		}
	]*/

	// Enter API keys to enable auth services, remove entire object if they aren't used.
	'external': {
		'facebook': {
			appId: '123343242343',
			appSecret: 'fab2332423432434'
		} /*
		, 'twitter': {
			consumerKey: 'eA54JQ6rtdZE7nqaRa6Oa',
			consumerSecret: '6u2makgFdf4F6EauP7osa54L34SouU6eLgaadTD435Rw'
		}
		, 'github': {
			appId: '1444g6a7d26a3f716b47',
			appSecret: 'e84f13367f328da4b8c96a4f74gfe7e421b6a206'
		}
    */
	},
	'debug': (process.env.NODE_ENV !== 'production')
};

if (process.env.NODE_ENV == 'production') {
  settings.dbName = 'app-prod';
} else if (process.env.NODE_ENV == 'development') {
  settings.dbName = 'app-dev';
} else if (process.env.NODE_ENV == 'test') {
  settings.dbName = 'app-test';
}

// Hack to figure out if we're on local machine or server
// can't use path.exists b/c has to be synchronous
try {
  stats = fs.lstatSync('./confirmIsLocal');
  settings.isLocal = true;
} catch(e) {
  settings.isLocal = false;
}
module.exports = settings;
