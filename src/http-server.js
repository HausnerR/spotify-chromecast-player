var express = require("express");
var app = express();
var http = require('http')
var schedule = require("node-schedule");
var spotifyChromecast = require('./spotify-chromecast')


function play (res, uri) {
    var counter = 0;
    var x = function () {
        spotifyChromecast.play(uri)
            .then(function () {
                if (res) res.status(200).send("Success");
            })
            .catch(function () {
                if (counter++ < 3) {
                    x();
                } else {
                    if (res) res.status(500).send("Error");
                }
            });
    }
    x();
}

function pause(res) {
    var counter = 0;
    var x = function () {
        spotifyChromecast.pause()
            .then(function () {
                if (res) res.status(200).send("Success");
            })
            .catch(function () {
                if (counter++ < 3) {
                    x();
                } else {
                    if (res) res.status(500).send("Error");
                }
            });
    }
    x();
}


app.get("/play", function (req, res) {
    play(res);
});

app.get("/play/fav", function (req, res) {
    var playlists = ['spotify:user:spotify:playlist:37i9dQZF1DWTAMSh8IEIUc', 'spotify:user:spotify:playlist:37i9dQZF1DX50QitC6Oqtn', 'spotify:user:spotify:playlist:37i9dQZF1DX3tuWZaHjp5y', 'spotify:user:spotify:playlist:37i9dQZF1DWSv6cu78Irsc', 'spotify:user:spotify:playlist:37i9dQZF1DWSXBu5naYCM9']
    play(res, playlists[Math.floor(Math.random() * playlists.length)]);
});

app.get("/play/:uri", function (req, res) {
    play(res, req.params.uri);
});

app.get("/pause", function (req, res) {
    pause(res);
});


var scheduleOff = null;

app.get("/pause/cancel", function (req, res) {
    if (scheduleOff) {
        scheduleOff.cancel();
        scheduleOff = null;
    }

    res.status(200).send('Music auto stop canceled');
});

app.get("/pause/:minutes", function (req, res) {
    var date = new Date();
    date.setMinutes(date.getMinutes() + parseInt(req.params.minutes, 10));

    if (scheduleOff) scheduleOff.cancel();

    scheduleOff = schedule.scheduleJob(date, () => {
        scheduleOff = null;
        pause();
    });

    res.status(200).send('Music will be stopped on ' + date.toString());
});


var port = process.env.PORT || 3000;

var server = http.createServer(app);
server.listen(port, () => console.log("Spotify Chromecast play server listening on port " + port + "..."));
