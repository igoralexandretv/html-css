const { version } = require('../../config/serverConfig');

module.exports = (req, res, next) => {
	res.jsonp({
		v: version,
		p: cons.playing
	});
};
