const mobBuilder = require('./mobBuilder');
const animations = require('../config/animations');
const scheduler = require('../misc/scheduler');

module.exports = {
	list: [],
	mobTypes: {},

	init: function (msg) {
		this.objects = msg.objects;
		this.syncer = msg.syncer;
		this.zoneConfig = msg.zoneConfig;
	},

	reset: function () {
		this.list = [];
		this.mobTypes = {};
	},

	register: function (blueprint, cdMax) {
		const spawner = extend({
			cdMax: cdMax || 171,
			cron: blueprint.cron,
			lifetime: blueprint.lifetime,
			blueprint: blueprint,
			amountLeft: blueprint.amount || -1
		});

		this.list.push(spawner);

		if (blueprint.layerName !== 'mobs')
			return;

		const name = blueprint.name.toLowerCase();
		if (!this.mobTypes[name])
			this.mobTypes[name] = 1;
		else
			this.mobTypes[name]++;

		spawner.zonePrint = extend({}, this.zoneConfig.mobs.default, this.zoneConfig.mobs[name] || {});
	},

	spawn: function (spawner) {
		if (spawner.amountLeft === 0)
			return;

		const blueprint = spawner.blueprint;
		const obj = this.objects.buildObjects([blueprint]);

		let customSpawn = false;

		const sheetName = blueprint.sheetName;
		if ((sheetName) && (blueprint.sheetName.indexOf('/'))) {
			const spawnAnimation = _.getDeepProperty(animations, ['mobs', sheetName, blueprint.cell, 'spawn']);
			if (spawnAnimation) {
				customSpawn = true;

				this.syncer.queue('onGetObject', {
					id: obj.id,
					components: [spawnAnimation]
				}, -1);
			}
		}

		if (!customSpawn) {
			this.syncer.queue('onGetObject', {
				x: obj.x,
				y: obj.y,
				components: [{
					type: 'attackAnimation',
					row: 0,
					col: 4
				}]
			}, -1);
		}

		if (spawner.amountLeft !== -1)
			spawner.amountLeft--;

		return obj;
	},

	update: function () {
		const spawners = this.list;
		let count = spawners.length;

		for (let i = 0; i < count; i++) {
			const l = spawners[i];

			if (l.destroyed) {
				spawners.splice(i, 1);
				i--;
				count--;

				continue;
			}

			if (l.lifetime && l.mob) {
				if (!l.age)
					l.age = 1;
				else
					l.age++;

				if (l.age >= l.lifetime) {
					this.syncer.queue('onGetObject', {
						x: l.mob.x,
						y: l.mob.y,
						components: [{
							type: 'attackAnimation',
							row: 0,
							col: 4
						}]
					}, -1);

					l.mob.destroyed = true;
				}
			}

			if (!l.cron) {
				if (l.cd > 0) 
					l.cd--;
				else if (l.mob && l.mob.destroyed)
					l.cd = l.cdMax;
			}

			if (l.mob && l.mob.destroyed) {
				delete l.age;
				delete l.mob;
			}

			const cronInfo = {
				cron: l.cron,
				lastRun: l.lastRun
			};

			const doSpawn = (
				(
					!l.cron &&
					!l.cd
				) || (
					l.cron &&
					!l.mob &&
					scheduler.shouldRun(cronInfo)
				)
			);

			if (doSpawn) {
				if (!l.cron)
					l.cd = -1;
				else
					l.lastRun = cronInfo.lastRun;

				const mob = this.spawn(l);
				if (!mob)
					continue;

				const name = (l.blueprint.objZoneName || l.blueprint.name).toLowerCase();

				if (l.blueprint.layerName === 'mobs') 
					this.setupMob(mob, l.zonePrint);
				else {
					const blueprint = extend({}, this.zoneConfig.objects.default, this.zoneConfig.objects[name] || {});
					this.setupObj(mob, blueprint);
				}

				if (l.blueprint.objZoneName)
					mob.objZoneName = l.blueprint.objZoneName;

				l.mob = mob;
			}
		}
	},

	setupMob: function (mob, blueprint) {
		let type = 'regular';
		if (blueprint.rare.count > 0) {
			const rareCount = this.list.filter(l => (
				(l.mob) &&
				(!l.mob.destroyed) &&
				(l.mob.isRare) &&
				(l.mob.baseName === mob.name)
			));
			if (rareCount.length < blueprint.rare.count) {
				const roll = Math.random() * 100;
				if (roll < blueprint.rare.chance)
					type = 'rare';
			}
		}

		this.setupObj(mob, blueprint);

		mobBuilder.build(mob, blueprint, type, this.zoneConfig.name);
	},

	setupObj: function (obj, blueprint) {
		const cpns = blueprint.components;
		if (!cpns)
			return;

		for (let c in cpns) {
			const cpn = cpns[c];

			let cType = c.replace('cpn', '');
			cType = cType[0].toLowerCase() + cType.substr(1);

			const builtCpn = obj.addComponent(cType, cpn);

			if (cpn.simplify)
				builtCpn.simplify = cpn.simplify.bind(builtCpn);
		}
	},

	destroySpawnerForObject: function (obj) {
		const spawner = this.list.find(l => l.mob === obj);

		if (spawner)
			spawner.destroyed = true;
	}
};
