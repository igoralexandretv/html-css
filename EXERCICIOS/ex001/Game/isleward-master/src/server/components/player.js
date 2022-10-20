let classes = require('../config/spirits');
const eventEmitter = require('../misc/events');

module.exports = {
	type: 'player',

	seen: [],
	cdSave: 1000,
	cdSaveMax: 1000,

	update: function () {
		if (this.cdSave > 0)
			this.cdSave--;
		else {
			this.cdSave = this.cdSaveMax;
			this.obj.auth.doSave();
		}
	},

	spawn: function (character, cb) {
		let obj = this.obj;

		if (character.dead)
			obj.dead = true;

		extend(obj, {
			layerName: 'mobs',
			cell: character.cell,
			sheetName: character.sheetName,
			skinId: character.skinId,
			name: character.name,
			class: character.class,
			x: character.x,
			y: character.y,
			hidden: character.dead || null,
			account: character.account,
			zoneName: character.zoneName || clientConfig.config.defaultZone,
			zoneId: character.zoneId || null,
			zoneMapSeed: character.zoneMapSeed
		});

		character.components = character.components || [];

		let blueprintStats = character.components.find(c => c.type === 'stats') || {};
		extend(blueprintStats, classes.stats[obj.class]);
		if (!blueprintStats.values.hp)
			blueprintStats.values.hp = blueprintStats.values.hpMax;
		let stats = obj.addComponent('stats');
		for (let s in blueprintStats.values) 
			stats.values[s] = blueprintStats.values[s];

		for (let s in blueprintStats.stats) 
			stats.stats[s] = blueprintStats.stats[s];

		obj.portrait = classes.portraits[character.class];

		obj.addComponent('spellbook');

		obj.addComponent('dialogue');
		obj.addComponent('trade', character.components.find(c => c.type === 'trade'));
		obj.addComponent('reputation', character.components.find(c => c.type === 'reputation'));

		let social = character.components.find(c => c.type === 'social');
		if (social)
			delete social.party;
		obj.addComponent('social', social);
		obj.social.init();
		obj.social.party = null;
		obj.addComponent('aggro', {
			faction: 'players'
		});
		obj.addComponent('gatherer');
		obj.addComponent('stash');

		let blueprintEffects = character.components.find(c => c.type === 'effects') || {};
		if (blueprintEffects.effects) {
			//Calculate ttl of effects
			let time = +new Date();
			blueprintEffects.effects = blueprintEffects.effects.filter(e => {
				let remaining = e.expire - time;
				if (remaining < 0)
					return false;
				
				e.ttl = Math.max(~~(remaining / consts.tickTime), 1);
				return true;
			});
		}
		obj.addComponent('effects', blueprintEffects);

		let prophecies = character.components.find(c => c.type === 'prophecies');
		if (prophecies)
			obj.addComponent('prophecies', prophecies);

		['equipment', 'passives', 'inventory', 'quests', 'events'].forEach(c => {
			obj.addComponent(c, character.components.find(f => f.type === c));
		});

		eventEmitter.emit('onAfterBuildPlayerObject', {
			obj: this.obj,
			saveData: character
		});

		obj.xp = stats.values.xp;
		obj.level = stats.values.level;

		stats.stats.logins++;

		atlas.addObject(this.obj, true);

		cons.emit('events', {
			onGetMessages: [{
				messages: [{
					class: 'color-blueB',
					message: this.obj.name + ' has come online'
				}]
			}],
			onGetConnectedPlayer: [cons.getCharacterList()]
		});

		cb();
	},

	broadcastSelf: function () {
		let obj = this.obj;

		let self = {
			id: obj.id,
			zoneId: obj.zoneId,
			name: obj.name,
			level: obj.level,
			class: obj.class
		};

		cons.emit('events', {
			onGetConnectedPlayer: [self]
		});
	},

	hasSeen: function (id) {
		return (this.seen.indexOf(id) > -1);
	},

	see: function (id) {
		this.seen.push(id);
	},

	unsee: function (id) {
		this.seen.spliceWhere(s => s === id);
	},

	die: function (source, permadeath) {
		let obj = this.obj;

		obj.clearQueue();

		let physics = obj.instance.physics;

		physics.removeObject(obj, obj.x, obj.y);
		obj.dead = true;

		obj.aggro.die();

		if (!permadeath) {
			let level = obj.stats.values.level;
			let spawns = obj.spawn;
			let spawnPos = spawns.filter(s => ((s.maxLevel && s.maxLevel >= level) || !s.maxLevel));
			if (!spawnPos.length || !source.name)
				spawnPos = spawns[0];
			else if (source.name) {
				let sourceSpawnPos = spawnPos.find(s => ((s.source) && (s.source.toLowerCase() === source.name.toLowerCase())));
				if (sourceSpawnPos)
					spawnPos = sourceSpawnPos;
				else
					spawnPos = spawnPos[0];
			}

			obj.instance.eventEmitter.emit('onBeforePlayerRespawn', obj, spawnPos);

			obj.x = spawnPos.x;
			obj.y = spawnPos.y;

			obj.stats.die(source);

			process.send({
				method: 'object',
				serverId: obj.serverId,
				obj: {
					dead: true
				}
			});
		} else {
			process.send({
				method: 'object',
				serverId: obj.serverId,
				obj: {
					dead: true,
					permadead: true
				}
			});
		}

		obj.fireEvent('onAfterDeath', source);
		obj.auth.track('combat', 'death', source.name, 1);

		obj.spellbook.die();
		obj.effects.die();
	},

	respawn: function () {
		const obj = this.obj;

		const spawnPos = {
			x: obj.x,
			y: obj.y
		};
		obj.instance.eventEmitter.emit('onBeforePlayerRespawn', obj, spawnPos);

		if (!spawnPos.zoneName) {
			obj.x = spawnPos.x;
			obj.y = spawnPos.y;

			let syncer = obj.syncer;
			syncer.o.x = obj.x;
			syncer.o.y = obj.y;

			obj.effects.addEffect({
				type: 'invulnerability',
				force: true,
				ttl: 28
			});

			obj.aggro.move();

			obj.instance.physics.addObject(obj, obj.x, obj.y);

			obj.instance.syncer.queue('teleportToPosition', {
				x: obj.x,
				y: obj.y
			}, [obj.serverId]);
		} else {
			obj.fireEvent('beforeRezone');

			obj.destroyed = true;

			let simpleObj = obj.getSimple(true, false, true);
			simpleObj.x = spawnPos.x;
			simpleObj.y = spawnPos.y;

			process.send({
				method: 'rezone',
				id: obj.serverId,
				args: {
					obj: simpleObj,
					newZone: spawnPos.zoneName
				}
			});
		}
	},

	move: function (msg) {
		atlas.queueAction(this.obj, {
			action: 'move',
			data: msg.data
		});
	},

	castSpell: function (msg) {
		atlas.queueAction(this.obj, {
			action: 'spell',
			data: msg.data
		});
	},

	queueAction: function (msg) {
		atlas.queueAction(this.obj, msg.data);
	},
	
	performAction: function (msg) {
		if (msg.callback)
			msg.data.data.callbackId = atlas.registerCallback(msg.callback);

		atlas.performAction(this.obj, msg.data);
	},

	clearQueue: function (msg) {
		const spellbook = this.obj.spellbook;
		if (spellbook.isCasting())
			spellbook.stopCasting();
		else
			this.obj.clearQueue();
	}
};
