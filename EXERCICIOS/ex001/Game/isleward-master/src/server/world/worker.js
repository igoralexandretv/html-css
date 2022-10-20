global.extend = require('../misc/clone');
global.io = require('../db/io');
global._ = require('../misc/helpers');
global.consts = require('../config/consts');
global.instancer = require('./instancer');
global.eventManager = require('../events/events');
global.clientConfig = require('../config/clientConfig');
global.rezoneManager = require('./rezoneManager');

const components = require('../components/components');
const mods = require('../misc/mods');
const animations = require('../config/animations');
const skins = require('../config/skins');
const factions = require('../config/factions');
const classes = require('../config/spirits');
const spellsConfig = require('../config/spellsConfig');
const spells = require('../config/spells');
const recipes = require('../config/recipes/recipes');
const itemTypes = require('../items/config/types');
const mapList = require('../config/maps/mapList');
const itemEffects = require('../items/itemEffects');
const profanities = require('../misc/profanities');
const eventEmitter = require('../misc/events');

instancer.mapName = process.argv[2];

let onCpnsReady = async function () {
	factions.init();
	skins.init();
	animations.init();
	classes.init();
	spellsConfig.init();
	spells.init();
	itemTypes.init();
	mapList.init();
	recipes.init();
	itemEffects.init();
	profanities.init();
	rezoneManager.init();

	await clientConfig.init();

	process.send({
		method: 'onReady'
	});
};

let onModsReady = function () {
	components.init(onCpnsReady);
};

const onCrash = async e => {
	if (e.toString().indexOf('ERR_IPC_CHANNEL_CLOSED') > -1)
		return;

	_.log('Error Logged: ' + e.toString());
	_.log(e.stack);

	await io.setAsync({
		key: new Date(),
		table: 'error',
		value: e.toString() + ' | ' + e.stack.toString()
	});

	process.send({
		event: 'onCrashed'
	});
};

let onDbReady = async function () {
	require('../misc/random');

	process.on('uncaughtException', onCrash);
	process.on('unhandledRejection', onCrash);

	await mods.init();

	onModsReady();
};

io.init(onDbReady);

process.on('message', m => {
	if (m.module) {
		let instances = instancer.instances;
		let iLen = instances.length;
		for (let i = 0; i < iLen; i++) {
			let objects = instances[i].objects.objects;
			let oLen = objects.length;
			let found = false;
			for (let j = 0; j < oLen; j++) {
				let object = objects[j];

				if (object.name === m.args[0]) {
					let mod = object.instance[m.module];
					mod[m.method].apply(mod, m.args);

					found = true;
					break;
				}
			}
			if (found)
				break;
		}
	} else if (m.threadModule)
		global[m.threadModule][m.method](m.data);
	else if (m.method)
		instancer[m.method](m.args);
	else if (m.event)
		eventEmitter.emit(m.event, m.data);
});
