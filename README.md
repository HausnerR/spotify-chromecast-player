# Spotify Chromecast player

This app allows to play/pause Spotify on Chromecast automatically.

- play music from where you left on another device
```
http://localhost:3000/play
```
- play music from hardcoded list
```
http://localhost:3000/play/fav
```
- play music from specific Spotify URI
```
http://localhost:3000/play/{uri}
```

- pause music
```
http://localhost:3000/pause
```
- pause music in future
```
http://localhost:3000/pause/{minutes}
```
- cancel future music pause
```
http://localhost:3000/pause/cancel
```


## Prerequisites

- node.js 6.x
- libavahi

```
sudo apt-get install libavahi-compat-libdnssd-dev
```


## How to start

Install dependencies:

```
npm install
```

Export env variables:

```
expott PORT=... #port number for service (default 3000)
export DEVICE_NAME=... #name of your chromecast device
export SPOTIFY_USERNAME=...
export SPOTIFY_PASSWORD=...
```

Start the app:

```
npm start
```


## Credits

This project is evolution of:
 - https://github.com/aartek/spotify-chromecast-player
 - https://github.com/kopiro/spotify-castv2-client
 - https://developers.caffeina.com/reverse-engineering-spotify-and-chromecast-protocols-to-let-my-vocal-assistant-play-music-ada4767efa2