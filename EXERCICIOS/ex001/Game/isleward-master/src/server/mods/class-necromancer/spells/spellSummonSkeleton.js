let mobBuilder = require('../../../world/mobBuilder');

module.exports = {
	type: 'summonSkeleton',

	targetGround: true,

	cdMax: 7,
	manaCost: 0,

	range: 9,

	needLos: true,
	killMinionsBeforeSummon: true,
	killMinionsOnDeath: true,
	minionsDieOnAggroClear: false,

	maxSummon: 1,

	minions: [],

	name: 'Skeletal Minion',

	cell: 0,
	sheetName: null,
	positions: null,

	basicSpell: 'melee',

	damagePercent: 20,
	hpPercent: 40,

	cast: function (action) {
		const { target } = action;

		const {
			obj, name, cell, minions, maxSummon, summonTemplates, animation,
			minionsDieOnAggroClear, killMinionsBeforeSummon, killMinionsOnDeath,
			hpPercent, damagePercent
		} = this;

		const positions = this.positions || [[target.x, target.y]];
		const sheetName = this.sheetName || `${this.folderName}/images/mobs.png`;

		if (killMinionsBeforeSummon)
			this.killMinions();

		const livingMinions = minions.filter(m => !m.destroyed);
		if (livingMinions.length >= maxSummon)
			return false;

		const currentTarget = obj.aggro.getHighest();

		positions.forEach(pos => {
			const [ x, y ] = pos;

			let template = {};
			if (summonTemplates)
				template = summonTemplates[~~(Math.random() * summonTemplates.length)];

			const blueprint = {
				x,
				y,
				cell: template.cell || cell,
				sheetName,
				name: template.name || name,
				properties: {
					cpnFollower: {
						maxDistance: 3
					}
				},
				extraProperties: {
					follower: {
						master: obj
					}
				}
			};

			obj.fireEvent('beforeSummonMinion', blueprint);

			//Spawn a mob
			let mob = obj.instance.spawners.spawn({
				amountLeft: 1,
				blueprint: blueprint
			});

			mobBuilder.build(mob, {
				level: obj.stats.values.level,
				faction: obj.aggro.faction,
				walkDistance: 2,
				sheetName,
				cell,
				regular: {
					drops: 0,
					hpMult: (template.hpPercent || hpPercent) / 100,
					dmgMult: (template.damagePercent || damagePercent) / 100
				},
				spells: [{
					type: template.basicSpell || this.basicSpell,
					damage: 1,
					statMult: 1,
					animation: 'melee'
				}]
			}, 'regular');
			mob.stats.values.hpMax = obj.stats.values.hpMax * (this.hpPercent / 100);
			mob.stats.values.hp = mob.stats.values.hpMax;
			mob.stats.values.regenHp = mob.stats.values.hpMax / 100;

			const spell = mob.spellbook.spells[0];
			spell.statType = ['str', 'int'];
			spell.threatMult *= 8;

			mob.stats.values.str = obj.stats.values.str || 1;
			mob.stats.values.int = obj.stats.values.int || 1;

			mob.follower.noNeedMaster = !killMinionsOnDeath;
			if (killMinionsOnDeath)
				mob.follower.bindEvents();
			else {
				mob.aggro.dieOnAggroClear = minionsDieOnAggroClear;
				mob.removeComponent('follower');

				if (currentTarget)
					mob.aggro.tryEngage(currentTarget);
			}

			minions.push(mob);
		});

		this.sendBump({
			x: obj.x,
			y: obj.y - 1
		});

		if (animation) {
			obj.instance.syncer.queue('onGetObject', {
				id: obj.id,
				components: [{
					type: 'animation',
					template: animation
				}]
			}, -1);
		}

		return true;
	},

	update: function () {
		let minions = this.minions;
		let mLen = minions.length;
		for (let i = 0; i < mLen; i++) {
			let m = minions[i];
			if (m.destroyed) {
				minions.splice(i, 1);
				i--;
				mLen--;
			}
		}
	},

	onAfterSimplify: function (simple) {
		delete simple.minions;
	},

	killMinions: function (minion) {
		this.minions.forEach(m => {
			if (m && !m.destroyed) {
				m.destroyed = true;
				this.minions.length = 0;

				let animations = require('../../../config/animations');

				let deathAnimation = _.getDeepProperty(animations, ['mobs', m.sheetName, m.cell, 'death']);
				if (deathAnimation) {
					this.obj.instance.syncer.queue('onGetObject', {
						x: m.x,
						y: m.y,
						components: [deathAnimation]
					}, -1);
				} else {
					this.obj.instance.syncer.queue('onGetObject', {
						x: m.x,
						y: m.y,
						components: [{
							type: 'attackAnimation',
							row: 0,
							col: 4
						}]
					}, -1);
				}
			}
		});
	},

	unlearn: function () {
		this.killMinions();
	},

	events: {
		onAfterDeath: function (source) {
			if (this.killMinionsOnDeath)
				this.killMinions();
		}
	}
};
