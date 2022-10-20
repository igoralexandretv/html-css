/* eslint-disable no-process-env */

module.exports = {
	version: '0.11.0',
	port: 4000,
	startupMessage: 'Server: ready',

	nodeEnv: process.env.NODE_ENV,

	//Options:
	// sqlite
	// rethink
	db: process.env.IWD_DB || 'sqlite',
	dbHost: process.env.IWD_DB_HOST || 'localhost',
	dbPort: process.env.IWD_DB_PORT || 28015,
	dbName: process.env.IWD_DB_NAME || 'live',
	dbUser: process.env.IWD_DB_USER || 'admin',
	dbPass: process.env.IWD_DB_PASS || ''
};
