//Methods
const die = require('./stats/die');

let animations = require('../config/animations');
let spirits = require('../config/spirits');
let scheduler = require('../misc/scheduler');

let baseStats = {
	mana: 20,
	manaMax: 20,

	manaReservePercent: 0,

	hp: 5,
	hpMax: 5,
	xpTotal: 0,
	xp: 0,
	xpMax: 0,
	level: 1,
	str: 0,
	int: 0,
	dex: 0,
	magicFind: 0,
	itemQuantity: 0,
	regenHp: 0,
	regenMana: 5,

	addCritChance: 0,
	addCritMultiplier: 0,
	addAttackCritChance: 0,
	addAttackCritMultiplier: 0,
	addSpellCritChance: 0,
	addSpellCritMultiplier: 0,

	critChance: 5,
	critMultiplier: 150,
	attackCritChance: 0,
	attackCritMultiplier: 0,
	spellCritChance: 0,
	spellCritMultiplier: 0,

	armor: 0,
	vit: 0,

	blockAttackChance: 0,
	blockSpellChance: 0,
	dodgeAttackChance: 0,
	dodgeSpellChance: 0,

	attackSpeed: 0,
	castSpeed: 0,

	elementArcanePercent: 0,
	elementFrostPercent: 0,
	elementFirePercent: 0,
	elementHolyPercent: 0,
	elementPoisonPercent: 0,
	physicalPercent: 0,

	elementPercent: 0,
	spellPercent: 0,

	elementArcaneResist: 0,
	elementFrostResist: 0,
	elementFireResist: 0,
	elementHolyResist: 0,
	elementPoisonResist: 0,

	elementAllResist: 0,

	sprintChance: 0,

	xpIncrease: 0,

	lifeOnHit: 0,

	//Fishing stats
	catchChance: 0,
	catchSpeed: 0,
	fishRarity: 0,
	fishWeight: 0,
	fishItems: 0
};

module.exports = {
	type: 'stats',

	values: baseStats,

	statScales: {
		vitToHp: 10,
		strToArmor: 1,
		intToMana: (1 / 6),
		dexToDodge: (1 / 12)
	},

	syncer: null,

	stats: {
		logins: 0,
		played: 0,
		lastLogin: null,
		loginStreak: 0,
		mobKillStreaks: {},
		lootStats: {}
	},

	dead: false,

	init: function (blueprint) {
		this.syncer = this.obj.instance.syncer;

		let values = (blueprint || {}).values || {};
		for (let v in values) 
			this.values[v] = values[v];

		let stats = (blueprint || {}).stats || {};
		for (let v in stats) 
			this.stats[v] = stats[v];

		if (this.obj.player) {
			this.calcXpMax();
			this.addLevelAttributes();
			this.calcHpMax();
		}

		if (blueprint)
			delete blueprint.stats;
	},

	resetHp: function () {
		let values = this.values;
		values.hp = values.hpMax;

		this.obj.syncer.setObject(false, 'stats', 'values', 'hp', values.hp);
	},

	update: function () {
		if ((this.obj.mob && !this.obj.follower) || this.obj.dead)
			return;

		let values = this.values;

		let manaMax = values.manaMax;
		manaMax -= (manaMax * values.manaReservePercent);

		let regen = {
			success: true
		};
		this.obj.fireEvent('beforeRegen', regen);
		if (!regen.success)
			return;

		let isInCombat = this.obj.aggro && this.obj.aggro.list.length > 0;
		if (this.obj.follower) {
			isInCombat = (this.obj.follower.master.aggro.list.length > 0);
			if (isInCombat)
				return;
		}

		let regenHp = 0;
		let regenMana = 0;

		regenMana = values.regenMana / 50;

		if (!isInCombat)
			regenHp = Math.max(values.hpMax / 112, values.regenHp * 0.2);
		else
			regenHp = values.regenHp * 0.2;

		if (values.hp < values.hpMax) {
			values.hp += regenHp;
			this.obj.syncer.setObject(false, 'stats', 'values', 'hp', values.hp);
		}

		if (values.hp > values.hpMax) {
			values.hp = values.hpMax;
			this.obj.syncer.setObject(false, 'stats', 'values', 'hp', values.hp);
		}

		if (values.mana < manaMax) {
			values.mana += regenMana;
			this.obj.syncer.setObject(!this.obj.player, 'stats', 'values', 'mana', values.mana);
		}

		if (values.mana > manaMax) {
			values.mana = manaMax;
			this.obj.syncer.setObject(!this.obj.player, 'stats', 'values', 'mana', values.mana);
		}
	},

	addStat: function (stat, value) {
		let values = this.values;

		if (['lvlRequire', 'allAttributes'].indexOf(stat) === -1)
			values[stat] += value;

		let sendOnlyToSelf = (['hp', 'hpMax', 'mana', 'manaMax', 'vit'].indexOf(stat) === -1);

		this.obj.syncer.setObject(sendOnlyToSelf, 'stats', 'values', stat, values[stat]);
		if (sendOnlyToSelf)
			this.obj.syncer.setObject(false, 'stats', 'values', stat, values[stat]);

		if (['addCritChance', 'addAttackCritChance', 'addSpellCritChance'].indexOf(stat) > -1) {
			let morphStat = stat.substr(3);
			morphStat = morphStat[0].toLowerCase() + morphStat.substr(1);
			this.addStat(morphStat, (0.05 * value));
		} else if (['addCritMultiplier', 'addAttackCritMultiplier', 'addSpellCritMultiplier'].indexOf(stat) > -1) {
			let morphStat = stat.substr(3);
			morphStat = morphStat[0].toLowerCase() + morphStat.substr(1);
			this.addStat(morphStat, value);
		} else if (stat === 'vit') 
			this.addStat('hpMax', (value * this.statScales.vitToHp));
		else if (stat === 'allAttributes') {
			['int', 'str', 'dex'].forEach(function (s) {
				this.addStat(s, value);
			}, this);
		} else if (stat === 'elementAllResist') {
			['arcane', 'frost', 'fire', 'holy', 'poison'].forEach(function (s) {
				let element = 'element' + (s[0].toUpperCase() + s.substr(1)) + 'Resist';
				this.addStat(element, value);
			}, this);
		} else if (stat === 'elementPercent') {
			['arcane', 'frost', 'fire', 'holy', 'poison'].forEach(function (s) {
				let element = 'element' + (s[0].toUpperCase() + s.substr(1)) + 'Percent';
				this.addStat(element, value);
			}, this);
		} else if (stat === 'str')
			this.addStat('armor', (value * this.statScales.strToArmor));
		else if (stat === 'int')
			this.addStat('manaMax', (value * this.statScales.intToMana));
		else if (stat === 'dex')
			this.addStat('dodgeAttackChance', (value * this.statScales.dexToDodge));
	},

	calcXpMax: function () {
		let level = this.values.level;
		this.values.xpMax = (level * 5) + ~~(level * 10 * Math.pow(level, 2.2)) - 5;

		this.obj.syncer.setObject(true, 'stats', 'values', 'xpMax', this.values.xpMax);
	},

	calcHpMax: function () {
		const spiritConfig = spirits.stats[this.obj.class];
		
		const initialHp = spiritConfig ? spiritConfig.values.hpMax : 32.7;
		let increase = spiritConfig ? spiritConfig.values.hpPerLevel : 32.7;

		this.values.hpMax = initialHp + (((this.values.level || 1) - 1) * increase);
	},

	//Source is the object that caused you to gain xp (mostly yourself)
	//Target is the source of the xp (a mob or quest)
	getXp: function (amount, source, target) {
		let obj = this.obj;
		let values = this.values;

		if (values.level === consts.maxLevel)
			return;

		let xpEvent = {
			source: source,
			target: target,
			amount: amount,
			multiplier: 1
		};

		obj.fireEvent('beforeGetXp', xpEvent);
		if (xpEvent.amount === 0)
			return;

		obj.instance.eventEmitter.emit('onBeforeGetGlobalXpMultiplier', xpEvent);

		amount = ~~(xpEvent.amount * (1 + (values.xpIncrease / 100)) * xpEvent.multiplier);

		values.xpTotal = ~~(values.xpTotal + amount);
		values.xp = ~~(values.xp + amount);

		obj.syncer.setObject(true, 'stats', 'values', 'xp', values.xp);

		this.syncer.queue('onGetDamage', {
			id: obj.id,
			event: true,
			text: '+' + amount + ' xp'
		}, -1);

		let syncO = {};
		let didLevelUp = false;

		while (values.xp >= values.xpMax) {
			didLevelUp = true;
			values.xp -= values.xpMax;
			obj.syncer.setObject(true, 'stats', 'values', 'xp', values.xp);

			values.level++;

			obj.fireEvent('onLevelUp', this.values.level);

			if (values.level === consts.maxLevel)
				values.xp = 0;

			this.calcHpMax();
			obj.syncer.setObject(true, 'stats', 'values', 'hpMax', values.hpMax);

			this.addLevelAttributes(true);

			obj.spellbook.calcDps();

			this.syncer.queue('onGetDamage', {
				id: obj.id,
				event: true,
				text: 'level up'
			}, -1);

			syncO.level = values.level;

			this.calcXpMax();
		}

		if (didLevelUp) {
			let cellContents = obj.instance.physics.getCell(obj.x, obj.y);
			cellContents.forEach(function (c) {
				c.fireEvent('onCellPlayerLevelUp', obj);
			});

			obj.auth.doSave();
		}

		process.send({
			method: 'object',
			serverId: this.obj.serverId,
			obj: syncO
		});

		if (didLevelUp) {
			this.obj.syncer.setObject(true, 'stats', 'values', 'hpMax', values.hpMax);
			this.obj.syncer.setObject(true, 'stats', 'values', 'level', values.level);
			this.obj.syncer.setObject(false, 'stats', 'values', 'hpMax', values.hpMax);
			this.obj.syncer.setObject(false, 'stats', 'values', 'level', values.level);
		}
	},

	kill: function (target) {
		if (target.player)
			return;

		let level = target.stats.values.level;
		let mobDiffMult = 1;
		if (target.isRare)
			mobDiffMult = 2;

		//Who should get xp?
		let aggroList = target.aggro.list;
		let aLen = aggroList.length;
		for (let i = 0; i < aLen; i++) {
			let a = aggroList[i];
			let dmg = a.damage;
			if (dmg <= 0)
				continue;

			let mult = 1;
			//How many party members contributed
			// Remember, maybe one of the aggro-ees might be a mob too
			let party = a.obj.social ? a.obj.social.party : null;
			if (party) {
				let partySize = aggroList.filter(function (f) {
					return ((a.damage > 0) && (party.indexOf(f.obj.serverId) > -1));
				}).length;
				partySize--;
				mult = (1 + (partySize * 0.1));
			}

			if (a.obj.player) {
				a.obj.auth.track('combat', 'kill', target.name);

				//Scale xp by source level so you can't just farm low level mobs (or get boosted on high level mobs).
				//Mobs that are farther then 10 levels from you, give no xp
				//We don't currently do this for quests/herb gathering
				let sourceLevel = a.obj.stats.values.level;
				let levelDelta = level - sourceLevel;

				let amount = null;
				if (Math.abs(levelDelta) <= 10)
					amount = ~~(((sourceLevel + levelDelta) * 10) * Math.pow(1 - (Math.abs(levelDelta) / 10), 2) * mult * mobDiffMult);
				else
					amount = 0;

				a.obj.stats.getXp(amount, this.obj, target);
			}

			a.obj.fireEvent('afterKillMob', target);
		}
	},

	preDeath: function (source) {
		const obj = this.obj;

		let killSource = source;
		if (source.follower)
			killSource = source.follower.master;

		if (killSource.stats)
			killSource.stats.kill(obj);

		const deathEvent = {
			target: obj,
			source: killSource
		}; 

		obj.instance.eventEmitter.emit('onAfterActorDies', deathEvent);
		obj.fireEvent('afterDeath', deathEvent);

		if (obj.player) {
			obj.syncer.setObject(false, 'stats', 'values', 'hp', this.values.hp);
			if (deathEvent.permadeath) {
				obj.auth.permadie();

				obj.instance.syncer.queue('onGetMessages', {
					messages: {
						class: 'color-redA',
						message: `(level ${this.values.level}) ${obj.name} has forever left the shores of the living.`
					}
				}, -1);

				this.syncer.queue('onPermadeath', {
					source: killSource.name
				}, [obj.serverId]);
			} else
				this.values.hp = 0;

			obj.player.die(killSource, deathEvent.permadeath);
		} else {
			if (obj.effects)
				obj.effects.die();
			if (this.obj.spellbook)
				this.obj.spellbook.die();

			obj.destroyed = true;
			obj.destructionEvent = 'death';

			let deathAnimation = _.getDeepProperty(animations, ['mobs', obj.sheetName, obj.cell, 'death']);
			if (deathAnimation) {
				obj.instance.syncer.queue('onGetObject', {
					x: obj.x,
					y: obj.y,
					components: [deathAnimation]
				}, -1);
			}

			if (obj.inventory) {
				let aggroList = obj.aggro.list;
				let aLen = aggroList.length;
				for (let i = 0; i < aLen; i++) {
					let a = aggroList[i];

					if (a.damage <= 0 || !a.obj.has('serverId'))
						continue;

					obj.inventory.dropBag(a.obj.name, killSource);
				}
			}
		}
	},

	die: function (source) {
		die(this, source);
	},

	respawn: function () {
		if (!this.obj.dead)
			return;
		
		this.obj.syncer.set(true, null, 'dead', false);

		let obj = this.obj;
		let syncO = obj.syncer.o;

		this.obj.dead = false;
		let values = this.values;

		values.hp = values.hpMax;
		values.mana = values.manaMax;

		obj.syncer.setObject(false, 'stats', 'values', 'hp', values.hp);
		obj.syncer.setObject(false, 'stats', 'values', 'mana', values.mana);

		obj.hidden = false;
		obj.nonSelectable = false;
		syncO.hidden = false;
		syncO.nonSelectable = false;

		process.send({
			method: 'object',
			serverId: this.obj.serverId,
			obj: {
				dead: false
			}
		});

		obj.instance.syncer.queue('onGetObject', {
			x: obj.x,
			y: obj.y,
			components: [{
				type: 'attackAnimation',
				row: 0,
				col: 4
			}]
		}, -1);

		this.obj.player.respawn();
	},

	addLevelAttributes: function (singleLevel) {
		const gainStats = spirits.stats[this.obj.class].gainStats;
		const count = singleLevel ? 1 : this.values.level;

		for (let s in gainStats) 
			this.addStat(s, gainStats[s] * count);
	},

	takeDamage: function (damage, threatMult, source) {
		if (this.values.hp <= 0)
			return;

		let obj = this.obj;

		if (!damage.noEvents) {
			source.fireEvent('beforeDealDamage', damage, obj);
			obj.fireEvent('beforeTakeDamage', damage, source);
		}

		if (damage.failed || obj.destroyed)
			return;

		let amount = Math.min(this.values.hp, damage.amount);

		damage.dealt = amount;

		let msg = {
			id: obj.id,
			source: source.id,
			crit: damage.crit,
			amount: amount,
			element: damage.element
		};

		this.values.hp -= amount;
		let recipients = [];
		if (obj.serverId)
			recipients.push(obj.serverId);
		if (source.serverId)
			recipients.push(source.serverId);

		if (source.follower && source.follower.master.serverId) {
			recipients.push(source.follower.master.serverId);
			msg.masterSource = source.follower.master.id;
		}
		
		if (obj.follower && obj.follower.master.serverId) {
			recipients.push(obj.follower.master.serverId);
			msg.masterId = obj.follower.master.id;
		}

		if (recipients.length) {
			if (!damage.blocked && !damage.dodged)
				this.syncer.queue('onGetDamage', msg, recipients);
			else {
				this.syncer.queue('onGetDamage', {
					id: obj.id,
					source: source.id,
					event: true,
					text: damage.blocked ? 'blocked' : 'dodged'
				}, recipients);
			}
		}

		obj.aggro.tryEngage(source, amount, threatMult);

		let died = (this.values.hp <= 0);

		if (died) {
			let death = {
				success: true
			};
			obj.instance.eventEmitter.emit('onBeforeActorDies', death, obj, source);
			obj.fireEvent('beforeDeath', death);

			if (death.success) 
				this.preDeath(source);
		} else {
			source.aggro.tryEngage(obj, 0);
			obj.syncer.setObject(false, 'stats', 'values', 'hp', this.values.hp);
		}

		if (!damage.noEvents)
			source.fireEvent('afterDealDamage', damage, obj);
	},

	getHp: function (heal, source) {
		let amount = heal.amount;
		if (amount === 0)
			return;

		let threatMult = heal.threatMult;
		if (!heal.has('threatMult'))
			threatMult = 1;

		let values = this.values;
		let hpMax = values.hpMax;

		if (values.hp >= hpMax)
			return;

		if (hpMax - values.hp < amount)
			amount = hpMax - values.hp;

		values.hp += amount;
		if (values.hp > hpMax)
			values.hp = hpMax;

		let recipients = [];
		if (this.obj.serverId)
			recipients.push(this.obj.serverId);
		if (source.serverId)
			recipients.push(source.serverId);
		if (recipients.length > 0) {
			this.syncer.queue('onGetDamage', {
				id: this.obj.id,
				source: source.id,
				heal: true,
				amount: amount,
				crit: heal.crit,
				element: heal.element
			}, recipients);
		}

		//Add aggro to all our attackers
		let threat = amount * 0.4 * threatMult;
		if (threat !== 0) {
			let aggroList = this.obj.aggro.list;
			let aLen = aggroList.length;
			for (let i = 0; i < aLen; i++) {
				let a = aggroList[i].obj;
				a.aggro.tryEngage(source, threat);
			}
		}

		this.obj.syncer.setObject(false, 'stats', 'values', 'hp', values.hp);
	},

	save: function () {
		if (this.sessionDuration) {
			this.stats.played = ~~(this.stats.played + this.sessionDuration);
			delete this.sessionDuration;
		}

		const values = this.values;

		return {
			type: 'stats',
			values: {
				level: values.level,
				xp: values.xp,
				xpTotal: values.xpTotal,
				hp: values.hp,
				mana: values.mana
			},
			stats: this.stats
		};
	},

	simplify: function (self) {
		let values = this.values;

		if (!self) {
			let result = {
				type: 'stats',
				values: {
					hp: values.hp,
					hpMax: values.hpMax,
					mana: values.mana,
					manaMax: values.manaMax,
					level: values.level
				}
			};

			return result;
		}

		return {
			type: 'stats',
			values: values,
			stats: this.stats,
			vitScale: this.vitScale
		};
	},

	simplifyTransfer: function () {
		return {
			type: 'stats',
			values: this.values,
			stats: this.stats
		};
	},

	onLogin: function () {
		let stats = this.stats;
		let time = scheduler.getTime();
		stats.lastLogin = time;
	},

	getKillStreakCoefficient: function (mobName) {
		let killStreak = this.stats.mobKillStreaks[mobName];
		if (!killStreak)
			return 1;
		return Math.max(0, (10000 - Math.pow(killStreak, 2)) / 10000);
	},

	canGetMobLoot: function (mob) {
		if (!mob.inventory.dailyDrops)
			return true;

		let lootStats = this.stats.lootStats[mob.name];
		let time = scheduler.getTime();
		if (!lootStats) 
			this.stats.lootStats[mob.name] = time;
		else
			return ((lootStats.day !== time.day) || (lootStats.month !== time.month));
	},

	events: {
		afterKillMob: function (mob) {
			let mobKillStreaks = this.stats.mobKillStreaks;
			let mobName = mob.name;

			if (!mobKillStreaks[mobName])
				mobKillStreaks[mobName] = 0;

			if (mobKillStreaks[mobName] < 100)
				mobKillStreaks[mobName]++;

			for (let p in mobKillStreaks) {
				if (p === mobName)
					continue;

				mobKillStreaks[p]--;
				if (mobKillStreaks[p] <= 0)
					delete mobKillStreaks[p];
			}
		},

		beforeGetXp: function (event) {
			if ((!event.target.mob) && (!event.target.player))
				return;

			event.amount *= this.getKillStreakCoefficient(event.target.name);
		},

		beforeGenerateLoot: function (event) {
			if (!event.source.mob)
				return;

			event.chanceMultiplier *= this.getKillStreakCoefficient(event.source.name);

			if ((event.chanceMultiplier > 0) && (!this.canGetMobLoot(event.source)))
				event.chanceMultiplier = 0;
		},

		afterMove: function (event) {
			let mobKillStreaks = this.stats.mobKillStreaks;

			for (let p in mobKillStreaks) {
				mobKillStreaks[p] -= 0.085;
				if (mobKillStreaks[p] <= 0)
					delete mobKillStreaks[p];
			}
		},

		afterDealDamage: function (damageEvent, target) {
			if (damageEvent.element)
				return;

			const { obj, values: { lifeOnHit } } = this;

			if (target === obj || !lifeOnHit)
				return;

			this.getHp({ amount: lifeOnHit }, obj);
		}
	}
};
