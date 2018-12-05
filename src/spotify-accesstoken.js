var rp = require('request-promise-native');
var tough = require('tough-cookie');

var UAMobile = "Mozilla/5.0 (Linux; Android 8.1.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.64 Mobile Safari/537.36";
var UADesktop = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.67 Safari/537.36";

function getCSRF(cookiejar) {
	return rp('https://accounts.spotify.com/login', {
		resolveWithFullResponse: true,
		headers: {
			'user-agent': UAMobile
		},
		jar: cookiejar
	}).then(function (resp) {
		return resp.headers['set-cookie']
			.find(e => e.indexOf('csrf_token') === 0)
			.split(';')[0]
			.replace('csrf_token=', '');
	})
}

function login(cookiejar, username, password, csrf_token) {
	return rp({
		url: 'https://accounts.spotify.com/api/login',
		method: 'POST',
		form: {
			remember: false,
			username: username,
			password: password,
			csrf_token: csrf_token,
		},
		headers: {
			'user-agent': UAMobile
		},
		jar: cookiejar
	});
}

function getAccessToken(cookiejar) {
	return rp({
		url: 'https://open.spotify.com/browse',
		resolveWithFullResponse: true,
		headers: {
			'user-agent': UADesktop
		},
		jar: cookiejar
	}).then(function (resp) {
		return resp.headers['set-cookie']
			.find(e => e.indexOf('wp_access_token') === 0)
			.split(';')[0]
			.replace('wp_access_token=', '')
	});
}

exports.getAccessToken = function (username, password) {
	var cookiejar = rp.jar();

	cookiejar.setCookie(new tough.Cookie({
		key: '__bon',
		value: 'MHwwfC0xOTI4Mzc5OTg1fC04MDk5MTk1OTM3MHwxfDF8MXwx',
		domain: 'accounts.spotify.com',
	}), 'https://accounts.spotify.com');

	return getCSRF(cookiejar)
		.then(function (csrf) {
			return login(cookiejar, username, password, csrf);
		})
		.then(function () {
			return getAccessToken(cookiejar);
		})
		.then(function (token) {
			return token;
		});
};