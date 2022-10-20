let statsFishingRod = require('./statsFishingRod');

module.exports = {
	generators: {
		elementDmgPercent: function (item, level, blueprint, perfection, calcPerfection) {
			let max = (level / 6.7);

			if (calcPerfection)
				return (calcPerfection / max);
			else if (!perfection)
				return random.norm(1, max) * (blueprint.statMult.elementDmgPercent || 1);

			return max * perfection * (blueprint.statMult.elementDmgPercent || 1);
		},

		addCritMultiplier: function (item, level, blueprint, perfection, calcPerfection) {
			let div = 1 / 11;
			if (item.slot === 'twoHanded')
				div *= 2;

			let max = (level * 15) * div;

			if (calcPerfection)
				return (calcPerfection / max);
			else if (!perfection)
				return random.norm(1, max) * (blueprint.statMult.addCritMultiplier || 1);

			return max * perfection * (blueprint.statMult.addCritMultiplier || 1);
		},

		addCritChance: function (item, level, blueprint, perfection, calcPerfection) {
			let div = 1 / 11;
			if (item.slot === 'twoHanded')
				div *= 2;

			let max = (level - 3) * 50 * div;

			if (calcPerfection)
				return (calcPerfection / max);
			else if (!perfection)
				return random.norm(1, max) * (blueprint.statMult.addCritChance || 1);

			return max * perfection * (blueprint.statMult.addCritChance || 1);
		},

		vit: function (item, level, blueprint, perfection, calcPerfection) {
			let div = 1 / 11;
			if (item.slot === 'twoHanded')
				div *= 2;

			let max = ((-0.6340155 + (13.68923 * level) - (0.34383 * Math.pow(level, 2)) + (0.06754871 * Math.pow(level, 3)) + (0.000174046 * Math.pow(level, 4)) + (0.000007675887 * Math.pow(level, 5))) / 10) * div;

			if (calcPerfection)
				return (calcPerfection / max);
			else if (!perfection)
				return random.norm(1, max) * (blueprint.statMult.vit || 1);

			return max * perfection * (blueprint.statMult.vit || 1);
		},

		mainStat: function (item, level, blueprint, perfection, calcPerfection) {
			let div = 1 / 11;
			if (item.slot === 'twoHanded')
				div *= 2;

			let min = (level / 15) * div;
			let max = (level * 5) * div;

			if (calcPerfection)
				return ((calcPerfection - min) / (max - min));
			else if (!perfection)
				return random.norm(min, max) * (blueprint.statMult.mainStat || 1);

			return (min + ((max - min) * perfection)) * (blueprint.statMult.mainStat || 1);
		},
		armor: function (item, level, blueprint, perfection, calcPerfection) {
			let min = (level * 20);
			let max = (level * 50);

			if (calcPerfection)
				return ((calcPerfection - min) / (max - min));
			else if (!perfection)
				return random.norm(min, max) * blueprint.statMult.armor;

			return (min + ((max - min) * perfection)) * (blueprint.statMult.armor || 1);
		},
		elementResist: function (item, level, blueprint, perfection, calcPerfection) {
			let div = 1 / 11;
			if (item.slot === 'twoHanded')
				div *= 2;

			if (calcPerfection)
				return (calcPerfection / (100 * div));
			else if (!perfection)
				return random.norm(1, 100) * (blueprint.statMult.elementResist || 1) * div;

			return ~~((1 + (99 * perfection)) * (blueprint.statMult.elementResist || 1) * div);
		},
		regenHp: function (item, level, blueprint, perfection, calcPerfection) {
			let div = 1 / 11;
			if (item.slot === 'twoHanded')
				div *= 2;

			let max = (-0.05426729 + (3.477385 * level) - (0.03890282 * Math.pow(level, 2)) + (0.009244822 * Math.pow(level, 3)) + (0.0001700915 * Math.pow(level, 4)) - (0.00000138085 * Math.pow(level, 5))) * div;

			if (calcPerfection)
				return (calcPerfection / max);
			else if (!perfection)
				return random.norm(1, max) * (blueprint.statMult.regenHp || 1);

			return max * perfection * (blueprint.statMult.regenHp || 1);
		},
		lvlRequire: function (item, level, blueprint, perfection, calcPerfection) {
			let max = ~~(level / 2);

			if (calcPerfection)
				return (calcPerfection / max);
			else if (!perfection)
				return random.norm(1, max) * (blueprint.statMult.lvlRequire || 1);

			return max * perfection * (blueprint.statMult.lvlRequire || 1);
		},
		lifeOnHit: function (item, level, blueprint, perfection, calcPerfection, statBlueprint) {
			const { min, max } = statBlueprint;
			const scale = level / consts.maxLevel;
			const maxRoll = scale * (max - min);

			if (calcPerfection)
				return ((calcPerfection - min) / maxRoll);
			else if (!perfection)
				return (min + random.norm(1, maxRoll)) * (blueprint.statMult.lifeOnHit || 1);

			return (min + (maxRoll * perfection)) * (blueprint.statMult.lifeOnHit || 1);
		}
	},

	stats: {
		vit: {
			generator: 'vit'
		},
		regenHp: {
			generator: 'regenHp'
		},

		manaMax: {
			min: 1,
			max: 8
		},

		regenMana: {
			min: 1,
			max: 5
		},

		lvlRequire: {
			level: {
				min: 5
			},
			generator: 'lvlRequire'
		},

		str: {
			generator: 'mainStat'
		},
		int: {
			generator: 'mainStat'
		},
		dex: {
			generator: 'mainStat'
		},

		elementArcaneResist: {
			level: {
				min: 15
			},
			generator: 'elementResist'
		},
		elementFrostResist: {
			level: {
				min: 15
			},
			generator: 'elementResist'
		},
		elementFireResist: {
			level: {
				min: 15
			},
			generator: 'elementResist'
		},
		elementHolyResist: {
			level: {
				min: 15
			},
			generator: 'elementResist'
		},
		elementPoisonResist: {
			level: {
				min: 15
			},
			generator: 'elementResist'
		},
		elementAllResist: {
			level: {
				min: 15
			},
			generator: 'elementResist'
		},

		elementArcanePercent: {
			level: {
				min: 10
			},
			ignore: true,
			generator: 'elementDmgPercent'
		},
		elementFrostPercent: {
			level: {
				min: 10
			},
			ignore: true,
			generator: 'elementDmgPercent'
		},
		elementFirePercent: {
			level: {
				min: 10
			},
			ignore: true,
			generator: 'elementDmgPercent'
		},
		elementHolyPercent: {
			level: {
				min: 10
			},
			ignore: true,
			generator: 'elementDmgPercent'
		},
		elementPoisonPercent: {
			level: {
				min: 10
			},
			ignore: true,
			generator: 'elementDmgPercent'
		},
		physicalPercent: {
			level: {
				min: 10
			},
			ignore: true,
			generator: 'elementDmgPercent'
		},
		elementPercent: {
			level: {
				min: 10
			},
			ignore: true,
			generator: 'elementDmgPercent'
		},
		spellPercent: {
			level: {
				min: 10
			},
			ignore: true,
			generator: 'elementDmgPercent'
		},
		allAttributes: {
			generator: 'mainStat',
			ignore: true
		},

		attackSpeed: {
			min: 1,
			max: 8.75,
			ignore: true
		},

		castSpeed: {
			min: 1,
			max: 8.75,
			ignore: true
		},

		lifeOnHit: {
			min: 1,
			max: 10,
			ignore: true,
			generator: 'lifeOnHit'
		},

		armor: {
			generator: 'armor',
			ignore: true
		},

		blockAttackChance: {
			min: 1,
			max: 10,
			ignore: true
		},

		blockSpellChance: {
			min: 1,
			max: 10,
			ignore: true
		},

		dodgeAttackChance: {
			min: 1,
			max: 10,
			ignore: true
		},

		dodgeSpellChance: {
			min: 1,
			max: 10,
			ignore: true
		},

		addCritChance: {
			generator: 'addCritChance',
			level: {
				min: 7
			}
		},
		addCritMultiplier: {
			generator: 'addCritMultiplier',
			level: {
				min: 12
			}
		},

		addAttackCritChance: {
			generator: 'addCritChance',
			level: {
				min: 7
			}
		},
		addAttackCritMultiplier: {
			generator: 'addCritMultiplier',
			level: {
				min: 12
			}
		},

		addSpellCritChance: {
			generator: 'addCritChance',
			level: {
				min: 7
			}
		},
		addSpellCritMultiplier: {
			generator: 'addCritMultiplier',
			level: {
				min: 12
			}
		},

		magicFind: {
			min: 1,
			max: 15
		},

		itemQuantity: {
			min: 2,
			max: 27
		},

		xpIncrease: {
			min: 1,
			max: 6
		},

		sprintChance: {
			min: 1,
			max: 20,
			ignore: true
		}
	},

	slots: {
		feet: {
			sprintChance: {
				min: 1,
				max: 20
			},

			dodgeAttackChance: {
				min: 1,
				max: 10
			},

			dodgeSpellChance: {
				min: 1,
				max: 10
			}
		},

		offHand: {
			lifeOnHit: {
				min: 1,
				max: 10
			}
		},

		trinket: {
			attackSpeed: {
				min: 1,
				max: 8.75
			},
			castSpeed: {
				min: 1,
				max: 8.75
			},
			lifeOnHit: {
				min: 1,
				max: 10
			}
		},

		finger: {
			elementArcanePercent: {
				generator: 'elementDmgPercent'
			},
			elementFrostPercent: {
				generator: 'elementDmgPercent'
			},
			elementFirePercent: {
				generator: 'elementDmgPercent'
			},
			elementHolyPercent: {
				generator: 'elementDmgPercent'
			},
			elementPoisonPercent: {
				generator: 'elementDmgPercent'
			},
			elementPercent: {
				generator: 'elementDmgPercent'
			},
			physicalPercent: {
				generator: 'elementDmgPercent'
			},
			spellPercent: {
				generator: 'elementDmgPercent'
			},
			allAttributes: {
				generator: 'mainStat'
			},
			attackSpeed: {
				min: 1,
				max: 8.75
			},
			castSpeed: {
				min: 1,
				max: 8.75
			}
		},

		neck: {
			elementArcanePercent: {
				generator: 'elementDmgPercent'
			},
			elementFrostPercent: {
				generator: 'elementDmgPercent'
			},
			elementFirePercent: {
				generator: 'elementDmgPercent'
			},
			elementHolyPercent: {
				generator: 'elementDmgPercent'
			},
			elementPoisonPercent: {
				generator: 'elementDmgPercent'
			},
			physicalPercent: {
				generator: 'elementDmgPercent'
			},
			elementPercent: {
				generator: 'elementDmgPercent'
			},
			spellPercent: {
				generator: 'elementDmgPercent'
			},
			allAttributes: {
				generator: 'mainStat'
			},
			attackSpeed: {
				min: 1,
				max: 8.75
			},
			castSpeed: {
				min: 1,
				max: 8.75
			}
		}
	},

	generate: function (item, blueprint, result) {
		if (item.slot === 'tool') {
			statsFishingRod.generate(item, blueprint, result);
			return;
		}

		if (!blueprint.statCount || !item.stats)
			item.stats = {};

		if (blueprint.noStats)
			return;

		//If we enchant something we don't add armor
		if (!blueprint.statMult)
			blueprint.statMult = {};
		for (let s in blueprint.statMult) {
			if (blueprint.statMult[s] > 0)
				this.buildStat(item, blueprint, s);
		}

		let statCount = blueprint.statCount || (item.quality + 1);

		if (blueprint.forceStats) {
			for (let i = 0; i < Math.min(statCount, blueprint.forceStats.length); i++) {
				let choice = blueprint.forceStats[i];
				this.buildStat(item, blueprint, choice, result);
				statCount--;
			}
		}

		this.buildImplicitStats(item, blueprint.implicitStat);

		if (blueprint.stats) {
			let useStats = extend([], blueprint.stats);
			let addStats = Math.min(statCount, blueprint.stats.length);
			for (let i = 0; i < addStats; i++) {
				let choice = useStats[~~(Math.random() * useStats.length)];
				useStats.spliceFirstWhere(s => s === choice);
				this.buildStat(item, blueprint, choice, result);
				statCount--;
			}
		}

		for (let i = 0; i < statCount; i++) 
			this.buildStat(item, blueprint, null, result);

		for (let s in item.stats) {
			item.stats[s] = Math.ceil(item.stats[s]);
			if (item.stats[s] === 0)
				delete item.stats[s];
		}
	},

	buildStat: function (item, blueprint, stat, result, isImplicit) {
		let slotStats = this.slots[item.slot] || {};
		let statOptions = extend({}, this.stats, slotStats || {});

		for (let p in statOptions) {
			if ((!slotStats[p]) || (slotStats[p].ignore))
				continue;

			delete statOptions[p].ignore;
		}

		let statBlueprint = null;

		let value = null;
		if ((stat) && (stat.indexOf('|') > -1)) {
			let split = stat.split('|');
			stat = split[0];
			value = ~~split[1];
		}

		if (
			!stat || 
			!statOptions[stat] ||
			(
				blueprint.limitSlotStats &&
				statOptions[stat].ignore
			)
		) {
			let options = Object.keys(statOptions).filter(function (s) {
				let o = statOptions[s];
				if (o.ignore)
					return false;
				else if ((o.level) && (o.level.min) && (item.level < o.level.min))
					return false;
				return true;
			});

			stat = options[~~(Math.random() * options.length)];
			statBlueprint = statOptions[stat];
		} else
			statBlueprint = statOptions[stat];

		if (!value) {
			if (statBlueprint.generator) {
				let level = Math.min(20, item.originalLevel || item.level);
				value = Math.ceil(this.generators[statBlueprint.generator](item, level, blueprint, blueprint.perfection, null, statBlueprint));
			} else if (!blueprint.perfection)
				value = Math.ceil(random.norm(statBlueprint.min, statBlueprint.max));
			else
				value = statBlueprint.min + ((statBlueprint.max - statBlueprint.min) * blueprint.perfection);
		}

		if ((result) && (result.addStatMsgs)) {
			result.addStatMsgs.push({
				stat: stat,
				value: value
			});

			if (!item.enchantedStats)
				item.enchantedStats = {};
			if (item.enchantedStats[stat])
				item.enchantedStats[stat] += value;
			else
				item.enchantedStats[stat] = value;
		}

		if (stat === 'lvlRequire') {
			if (!item.originalLevel)
				item.originalLevel = item.level;

			item.level -= value;
			if (item.level < 1)
				item.level = 1;
		}

		if (item.stats[stat])
			value += item.stats[stat];

		item.stats[stat] = value;
	},

	rescale: function (item, level) {
		let stats = item.stats;
		let nStats = extend({}, stats);
		let bpt = {
			statMult: {}
		};

		for (let p in stats) {
			let generator = this.stats[p].generator;
			if (!generator)
				continue;
			else if (['lvlRequire'].indexOf(p) > -1)
				continue;

			generator = this.generators[generator];

			let perfection = generator(item, item.originalLevel || item.level, bpt, null, stats[p]);
			nStats[p] = Math.ceil(generator(item, level, bpt, perfection));
		}

		return nStats;
	},

	buildImplicitStats: function (item, implicits) {
		if (!implicits)
			return;

		implicits = implicits.push ? implicits : [ implicits ];
		implicits.forEach(i => {
			let stat = {
				stat: i.stat
			};

			if (i.value) {
				const [min, max] = i.value;
				stat.value = Math.ceil(random.expNorm(min, max));
			} else if (i.valueMult) {
				let statBlueprint = this.stats[i.stat];

				if (statBlueprint.generator) {
					const generator = this.generators[statBlueprint.generator];

					const blueprint = {
						statMult: {
							[i.stat]: i.valueMult
						}
					};

					const itemLevel = Math.min(20, item.level);
					stat.value = Math.ceil(generator(item, itemLevel, blueprint));
				} else
					stat.value = Math.ceil(random.norm(statBlueprint.min, statBlueprint.max) * i.valueMult);		
			}
				
			if (!item.implicitStats)
				item.implicitStats = [];

			item.implicitStats.push(stat);
		});
	}
};
