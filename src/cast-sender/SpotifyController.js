var util = require('util');
var castv2Cli = require('castv2-client');
var RequestResponseController = castv2Cli.RequestResponseController;

function SpotifyController(client, sourceId, destinationId) {
	RequestResponseController.call(this, client, sourceId, destinationId, 'urn:x-cast:com.spotify.chromecast.secure.v1');
}

util.inherits(SpotifyController, RequestResponseController);

module.exports = SpotifyController;