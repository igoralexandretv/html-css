let serverConfig = require('../config/serverConfig');

const mappings = {
	sqlite: './ioSqlite',
	rethink: './ioRethink'
};

module.exports = require(mappings[serverConfig.db]);
