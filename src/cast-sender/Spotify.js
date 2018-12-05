const util = require('util');
const castv2Cli = require('castv2-client');
const Application = castv2Cli.Application;
const SpotifyController = require('./SpotifyController');

function Spotify(client, session) {
    Application.apply(this, arguments);

	this.spotifyController = this.createController(SpotifyController);
}

Spotify.APP_ID = 'CC32E753';

util.inherits(Spotify, Application);

Spotify.prototype.authenticate = function (access_token) {
	var t = this;

	return new Promise(function (resolve, reject) {
		// Once Chromecast replies, resolve promise
		t.spotifyController.on('message', function (message) {
			if (message.type === 'setCredentialsResponse') {
				resolve();
			}
		});

		// Send setCredentials request to Chromecast
		t.spotifyController.send({
			type: 'setCredentials',
			credentials: access_token,
			expiresIn: 3600
		});
	});
};

module.exports = Spotify;
