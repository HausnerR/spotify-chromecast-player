var spotifyChromecast = require('./spotify-chromecast')

var counter = 0;

var x = function () {
    spotifyChromecast.play()
        .then(function () {
            process.exit();
        })
        .catch(function () {
            if (counter++ < 3) {
                x();
            } else {
                process.exit(1);
            }
        });
}

x();