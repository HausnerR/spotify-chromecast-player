var mdns = require('mdns');
var Client = require('castv2-client').Client;
var Spotify = require('./cast-sender/Spotify');
var SpotifyWebApi = require('spotify-web-api-node');
var SpotifyAccessToken = require('./spotify-accesstoken');


var DEVICE_HOST = process.env.DEVICE_HOST;
var DEVICE_NAME = process.env.DEVICE_NAME;
var SPOTIFY_USERNAME = process.env.SPOTIFY_USERNAME;
var SPOTIFY_PASSWORD = process.env.SPOTIFY_PASSWORD;


function fadeInVolume(client, fadeDuration, fadeStep) {
    fadeDuration = fadeDuration || 5000;
    fadeStep = fadeStep || 0.02;

    var volume = 0;
    var interval = setInterval(function () {
        if (volume >= 1) clearInterval(interval);
        client.setVolume({ level: volume }, function (err, newvol) {});
        volume += fadeStep;
    }, fadeStep * fadeDuration);
}

function fadeOutVolume(client, fadeDuration, fadeStep) {
    fadeDuration = fadeDuration || 5000;
    fadeStep = fadeStep || 0.02;

    var volume = 1;
    var interval = setInterval(function () {
        if (volume <= 0) clearInterval(interval);
        client.setVolume({ level: volume }, function (err, newvol) {});
        volume -= fadeStep;
    }, fadeStep * fadeDuration);
}


exports.play = function (uri) {
    return new Promise(function (resolve, reject) {

        if (DEVICE_HOST) {
            ondeviceup(DEVICE_HOST, DEVICE_NAME);
        } else {
            //fix for raspberry: https://stackoverflow.com/a/36605224/1937797
            var sequence = [
                mdns.rst.DNSServiceResolve(),
                'DNSServiceGetAddrInfo' in mdns.dns_sd ? mdns.rst.DNSServiceGetAddrInfo() : mdns.rst.getaddrinfo({families: [4]}),
                mdns.rst.makeAddressesUnique()
            ];

            var browser = mdns.createBrowser(mdns.tcp('googlecast'), {resolverSequence: sequence});

            var browserTimeout = setTimeout(function () {
                console.log('Chromecast search timeout. Couldn\'t find device ' + DEVICE_NAME);
                browser.stop();
                reject();
            }, 10000);

            browser.on('serviceUp', function (service) {
                console.log('Found Chromecast "' + service.txtRecord.fn + '"');

                if (service.txtRecord.fn === DEVICE_NAME) {
                    ondeviceup(service.addresses[0], service.txtRecord.fn);
                    browser.stop();
                    clearTimeout(browserTimeout);
                }
            });

            browser.start();
        }

        function ondeviceup(host, device_name) {
            var client = new Client();

            /*client.on('status', function(status) {
                console.log('client status: ', status);
            });*/

            console.log('Connecting to "' + device_name + '"...');
            client.connect(host, function () {
                console.log('Launching Spotify app on "' + device_name + '"...');
                client.launch(Spotify, function (err, controller) {
                    var spotifyApi;

                    /*controller.on('close', function(status) {
                        console.log('controller close: ', status);
                    });*/

                    console.log('Logging to Spotify...');
                    SpotifyAccessToken.getAccessToken(SPOTIFY_USERNAME, SPOTIFY_PASSWORD)
                        .then(function (access_token) {
                            console.log('Got access_token. Authenticating Chromecast client...');
                            spotifyApi = new SpotifyWebApi({accessToken: access_token});
                            return controller.authenticate(access_token)
                        })
                        .then(function () {
                            console.log('Spotify Chromecast client authentication successful. Getting devices to play...');
                            return spotifyApi.getMyDevices();
                        })
                        .then(function (devicesResponse) {
                            console.log('Got devices list');
                            var devices = devicesResponse.body.devices;
                            var device = devices.find(e => e.name === DEVICE_NAME);

                            if (uri) {
                                console.log('Playing provided URI "' + uri + '"...');

                                var opt = {
                                    deviceId: device.id,
                                    context_uri: uri
                                };
                                return spotifyApi.play(opt);
                            } else {
                                console.log('Resume playing from another device...');

                                var opt = {
                                    deviceIds: [device.id],
                                    play: true
                                };
                                return spotifyApi.transferMyPlayback(opt);
                            }
                        })
                        .then(function () {
                            console.log('Spotify play request successful. Done!');
                            fadeInVolume(client, 10000);
                            resolve();
                        })
                        .catch(function (err) {
                            console.error('Spotify player error ocured: ' + err.message);
                            reject();
                        });
                });
            });

            client.on('error', function (err) {
                console.log('Chromecast client error: ' + err.message);
                client.close();
                reject();
            });
        }
    })
};

exports.pause = function () {
    return new Promise(function (resolve, reject) {
        var spotifyApi;

        console.log('Logging to Spotify...');
        SpotifyAccessToken.getAccessToken(SPOTIFY_USERNAME, SPOTIFY_PASSWORD)
            .then(function (access_token) {
                console.log('Got access_token. Getting devices to pause...');
                spotifyApi = new SpotifyWebApi({accessToken: access_token});

                return spotifyApi.getMyDevices();
            })
            .then(function (devicesResponse) {
                console.log('Got devices list');
                var devices = devicesResponse.body.devices;
                var device = devices.find(e => e.name === DEVICE_NAME);

                console.log('Sending Spotify pause request...');
                var opt = {
                    deviceId: device.id
                };
        
                return spotifyApi.pause(opt);                
            })
            .then(function () {
                console.log('Spotify pause request successful. Done!');
                resolve();
            })
            .catch(function (err) {
                console.error('Spotify player error ocured: ' + err.message);
                reject();
            });
    });
};
