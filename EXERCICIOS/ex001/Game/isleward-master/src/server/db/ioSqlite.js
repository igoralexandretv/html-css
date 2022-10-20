let util = require('util');
const tableNames = require('./tableNames');

module.exports = {
	db: null,
	file: '../../data/storage.db',

	buffer: [],
	processing: [],

	tables: {},

	init: async function (cbReady) {
		let sqlite = require('sqlite3').verbose();
		this.db = new sqlite.Database(this.file, this.onDbCreated.bind(this, cbReady));
	},
	onDbCreated: function (cbReady) {
		let db = this.db;
		let scope = this;

		db.serialize(function () {
			for (let t of tableNames) {
				db.run(`
					CREATE TABLE ${t} (key VARCHAR(50), value TEXT)
				`, scope.onTableCreated.bind(scope, t));
			}

			cbReady();
		}, this);
	},

	createTable: async function (tableName) {
		return new Promise(res => {
			this.db.run(`
				CREATE TABLE ${tableName} (key VARCHAR(50), value TEXT)
			`, res);
		});
	},
	
	onTableCreated: async function (table) {
		
	},

	//ent, field
	get: function (options) {
		let key = options.ent;
		let table = options.field;

		options.query = `SELECT * FROM ${table} WHERE key = '${key}' LIMIT 1`;

		this.db.get(options.query, this.done.bind(this, options));
	},

	getAsync: async function (options) {
		return await this.queue({
			type: 'get',
			options: options
		});
	},

	getAllAsync: async function (options) {
		return await this.queue({
			type: 'getAll',
			options: options
		});
	},

	delete: function (options) {
		let key = options.ent;
		let table = options.field;

		options.query = `DELETE FROM ${table} WHERE key = '${key}'`;

		this.db.run(options.query, this.done.bind(this, options));
	},

	deleteAsync: async function (options) {
		await this.queue({
			type: 'delete',
			options: options
		});
	},

	//ent, field, value
	set: function (options) {
		let key = options.ent;
		let table = options.field;

		this.db.get(`SELECT 1 FROM ${table} where key = '${key}'`, this.doesExist.bind(this, options));
	},
	doesExist: function (options, err, result) {
		let key = options.ent;
		let table = options.field;

		let query = `INSERT INTO ${table} (key, value) VALUES('${key}', '${options.value}')`;

		if (result)
			query = `UPDATE ${table} SET value = '${options.value}' WHERE key = '${key}'`;

		this.db.run(query, this.done.bind(this, options));
	},

	setAsync: async function (options) {
		await this.queue({
			type: 'set',
			options: options
		});
	},

	queue: async function (config) {
		let resolve = null;
		let promise = new Promise(function (res) {
			resolve = res;
		});

		this.buffer.push({
			resolve: resolve,
			config: config
		});

		this.process();

		return promise;
	},

	process: async function () {
		let next = this.buffer.splice(0, 1);
		if (!next.length)
			return;
		next = next[0];

		let config = next.config;
		let options = config.options;

		let res = null;

		try {
			if (config.type === 'get')
				res = await this.processGet(options);
			else if (config.type === 'getAll')
				res = await this.processGetAll(options);
			else if (config.type === 'set')
				await this.processSet(options);
			else if (config.type === 'delete')
				await this.processDelete(options);
		} catch (e) {
			_.log(e);

			this.buffer.splice(0, 0, next);

			setTimeout(this.process.bind(this), 10);
			return;
		}

		next.resolve(res);

		setTimeout(this.process.bind(this), 10);
	},

	processGet: async function (options) {
		const collate = options.ignoreCase ? 'COLLATE NOCASE' : '';
		const query = `SELECT * FROM ${options.table} WHERE key = '${options.key}' ${collate} LIMIT 1`;
		let res = await util.promisify(this.db.get.bind(this.db))(query);

		if (res) {
			res = res.value;

			if (options.clean) {
				res = res
					.split('`')
					.join('\'')
					.replace(/''+/g, '\'');
			}
			
			if (!options.noParse)
				res = JSON.parse(res);
		} else if (!options.noParse && !options.noDefault)
			res = options.isArray ? [] : {};

		return res;
	},

	processGetAll: async function (options) {
		let res = await util.promisify(this.db.all.bind(this.db))(`SELECT * FROM ${options.table}`);
		if (res) {
			if (options.clean) {
				res.forEach(r => {
					r.value = r.value
						.split('`')
						.join('\'')
						.replace(/''+/g, '\'');
				});
			}
			
			if (!options.noParse) {
				if (!res)
					res = options.isArray ? [] : {};
				else {
					res.forEach(r => {
						r.value = JSON.parse(r.value);
					});
				}
			}
		} else if (!options.noParse && !options.noDefault)
			res = options.isArray ? [] : {};

		return res;
	},

	processSet: async function (options) {
		let table = options.table;
		let key = options.key;
		let value = options.value;

		if (options.serialize)
			value = JSON.stringify(value);

		//Clean single quotes
		if (value.split) {
			value = value
				.split('\'')
				.join('`');
		}

		let exists = await util.promisify(this.db.get.bind(this.db))(`SELECT * FROM ${table} WHERE key = '${key}' LIMIT 1`);

		let query = `INSERT INTO ${table} (key, value) VALUES('${key}', '${value}')`;
		if (exists)
			query = `UPDATE ${table} SET value = '${value}' WHERE key = '${key}'`;

		await util.promisify(this.db.run.bind(this.db))(query);
	},

	processDelete: async function (options) {
		let table = options.table;
		let key = options.key;

		let query = `DELETE FROM ${table} WHERE key = '${key}'`;

		await util.promisify(this.db.run.bind(this.db))(query);
	},

	done: function (options, err, result) {
		result = result || {
			value: null
		};

		if (options.callback)
			options.callback(result.value);
	}
};
