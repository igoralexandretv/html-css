//Imports
const http = require('http');

const socketIo = require('socket.io');

const express = require('express');
const compression = require('compression');
const minify = require('express-minify');
const lessMiddleware = require('less-middleware');

const rest = require('../security/rest');

const {
	port = 4000,
	startupMessage = 'Server: Ready',
	nodeEnv
} = require('../config/serverConfig');

const compileLessOnce = nodeEnv === 'production';

const onConnection = require('./onConnection');
const { appRoot, appFile } = require('./requestHandlers');

//Methods
const init = async () => {
	return new Promise(resolve => {
		const app = express();
		const server = http.createServer(app);
		const socketServer = socketIo(server, {
			transports: ['websocket']
		});

		global.cons.sockets = socketServer.sockets;

		app.use(compression());
		app.use(minify());

		app.use((req, res, next) => {
			if (
				!rest.willHandle(req.url) &&
				req.url.indexOf('/server') !== 0 &&
				req.url.indexOf('/mods') !== 0
			)
				req.url = '/client/' + req.url;

			next();
		});

		app.use(lessMiddleware('../', {
			once: compileLessOnce,
			force: !compileLessOnce
		}));

		rest.init(app);

		app.get('/', appRoot);
		app.get(/^(.*)$/, appFile);

		socketServer.on('connection', onConnection);

		server.listen(port, () => {
			_.log(startupMessage);

			resolve();
		});
	});
};

//Exports
module.exports = {
	init
};
