require('./globals');

let server = require('./server/index');
let components = require('./components/components');
let mods = require('./misc/mods');
let animations = require('./config/animations');
let skins = require('./config/skins');
let factions = require('./config/factions');
let classes = require('./config/spirits');
let spellsConfig = require('./config/spellsConfig');
let spells = require('./config/spells');
let itemTypes = require('./items/config/types');
let recipes = require('./config/recipes/recipes');
let mapList = require('./config/maps/mapList');
let fixes = require('./fixes/fixes');
let profanities = require('./misc/profanities');
const routerConfig = require('./security/routerConfig');

let startup = {
	init: function () {
		io.init(this.onDbReady.bind(this));
	},

	onDbReady: async function () {
		await fixes.fixDb();

		process.on('unhandledRejection', this.onError.bind(this));
		process.on('uncaughtException', this.onError.bind(this));

		await mods.init();

		this.onModsLoaded();
	},

	onModsLoaded: function () {
		animations.init();
		routerConfig.init();
		classes.init();
		spellsConfig.init();
		spells.init();
		recipes.init();
		itemTypes.init();
		profanities.init();
		mapList.init();
		components.init(this.onComponentsReady.bind(this));
	},

	onComponentsReady: async function () {
		skins.init();
		factions.init();

		await clientConfig.init();

		await server.init();

		await leaderboard.init();

		atlas.init();
	},

	onError: async function (e) {
		if (e.toString().indexOf('ERR_IPC_CHANNEL_CLOSED') > -1)
			return;

		_.log('Error Logged: ' + e.toString());
		_.log(e.stack);

		await io.setAsync({
			key: new Date(),
			table: 'error',
			value: e.toString() + ' | ' + e.stack.toString()
		});

		process.exit();
	}
};

startup.init();
