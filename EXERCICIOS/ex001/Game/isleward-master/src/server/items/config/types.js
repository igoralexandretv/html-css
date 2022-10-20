let events = require('../../misc/events');

const slotArmorMult = require('./slots').armorMult;
const configMaterials = require('./armorMaterials');

const plateArmorMult = configMaterials.plate.armorMult;
const leatherArmorMult = configMaterials.leather.armorMult;
const clothArmorMult = configMaterials.cloth.armorMult;

let types = {
	head: {
		Helmet: {
			sprite: [0, 0],
			material: 'plate',
			implicitStat: {
				stat: 'armor',
				valueMult: slotArmorMult.head * plateArmorMult
			}
		},
		Cowl: {
			sprite: [0, 1],
			material: 'cloth',
			implicitStat: {
				stat: 'armor',
				valueMult: slotArmorMult.head * clothArmorMult
			}
		},
		'Leather Cap': {
			sprite: [0, 2],
			material: 'leather',
			implicitStat: {
				stat: 'armor',
				valueMult: slotArmorMult.head * leatherArmorMult
			}
		},
		Facemask: {
			sprite: [0, 3],
			material: 'leather',
			implicitStat: {
				stat: 'armor',
				valueMult: slotArmorMult.head * leatherArmorMult
			}
		}
	},
	neck: {
		Pendant: {
			sprite: [1, 0],
			implicitStat: {
				stat: 'str',
				value: [1, 4]
			}
		},
		Amulet: {
			sprite: [1, 1],
			implicitStat: {
				stat: 'int',
				value: [1, 4]
			}
		},
		Locket: {
			sprite: [1, 2],
			implicitStat: {
				stat: 'dex',
				value: [1, 4]
			}
		},
		Choker: {
			sprite: [1, 3],
			implicitStat: {
				stat: 'regenHp',
				value: [2, 5]
			}
		}
	},
	chest: {
		Breastplate: {
			sprite: [2, 0],
			material: 'plate',
			implicitStat: {
				stat: 'armor',
				valueMult: slotArmorMult.chest * plateArmorMult
			}
		},
		Robe: {
			material: 'cloth',
			sprite: [2, 1],
			implicitStat: {
				stat: 'armor',
				valueMult: slotArmorMult.chest * clothArmorMult
			}
		},
		'Leather Armor': {
			sprite: [2, 2],
			material: 'leather',
			implicitStat: {
				stat: 'armor',
				valueMult: slotArmorMult.chest * leatherArmorMult
			}
		},
		Scalemail: {
			sprite: [2, 3],
			material: 'leather',
			implicitStat: {
				stat: 'armor',
				valueMult: slotArmorMult.chest * leatherArmorMult
			}
		}
	},
	hands: {
		Gauntlets: {
			sprite: [3, 0],
			material: 'plate',
			implicitStat: {
				stat: 'armor',
				valueMult: slotArmorMult.hands * plateArmorMult
			}
		},
		Gloves: {
			material: 'cloth',
			sprite: [3, 1],
			implicitStat: {
				stat: 'armor',
				valueMult: slotArmorMult.hands * clothArmorMult
			}
		},
		'Leather Gloves': {
			sprite: [3, 2],
			material: 'leather',
			implicitStat: {
				stat: 'armor',
				valueMult: slotArmorMult.hands * leatherArmorMult
			}
		},
		'Scale Gloves': {
			sprite: [3, 3],
			material: 'leather',
			implicitStat: {
				stat: 'armor',
				valueMult: slotArmorMult.hands * leatherArmorMult
			}
		}
	},
	finger: {
		Signet: {
			sprite: [4, 0],
			implicitStat: {
				stat: 'armor',
				value: [5, 15]
			}
		},
		Ring: {
			sprite: [4, 1],
			implicitStat: {
				stat: 'regenMana',
				value: [1, 5]
			}
		},
		Loop: {
			sprite: [4, 2],
			implicitStat: {
				stat: 'allAttributes',
				value: [1, 7]
			}
		},
		'Viridian Band': {
			sprite: [4, 3],
			implicitStat: {
				stat: 'physicalPercent',
				value: [1, 3]
			}
		}
	},
	waist: {
		Belt: {
			material: 'plate',
			sprite: [5, 0],
			implicitStat: {
				stat: 'armor',
				value: [10, 20]
			}
		},
		Sash: {
			material: 'cloth',
			sprite: [5, 1],
			implicitStat: {
				stat: 'manaMax',
				value: [1, 8]
			}
		},
		'Leather Belt': {
			material: 'leather',
			sprite: [5, 2],
			implicitStat: {
				stat: 'addCritChance',
				value: [10, 50]
			}
		},
		'Scaled Binding': {
			material: 'leather',
			sprite: [5, 3],
			implicitStat: {
				stat: 'vit',
				value: [2, 6]
			}
		}
	},
	legs: {
		Legplates: {
			material: 'plate',
			sprite: [6, 0],
			implicitStat: {
				stat: 'armor',
				valueMult: slotArmorMult.legs * plateArmorMult
			}
		},
		Pants: {
			material: 'cloth',
			sprite: [6, 1],
			implicitStat: {
				stat: 'armor',
				valueMult: slotArmorMult.legs * clothArmorMult
			}
		},
		'Leather Pants': {
			sprite: [6, 2],
			material: 'leather',
			implicitStat: {
				stat: 'armor',
				valueMult: slotArmorMult.legs * leatherArmorMult
			}
		},
		'Scale Leggings': {
			sprite: [6, 3],
			material: 'leather',
			implicitStat: {
				stat: 'armor',
				valueMult: slotArmorMult.legs * leatherArmorMult
			}
		}
	},
	feet: {
		'Steel Boots': {
			material: 'plate',
			sprite: [7, 0],
			implicitStat: {
				stat: 'armor',
				valueMult: slotArmorMult.feet * plateArmorMult
			}
		},
		Boots: {
			material: 'cloth',
			sprite: [7, 1],
			implicitStat: {
				stat: 'armor',
				valueMult: slotArmorMult.feet * clothArmorMult
			}
		},
		'Leather Boots': {
			material: 'leather',
			sprite: [7, 2],
			implicitStat: {
				stat: 'armor',
				valueMult: slotArmorMult.feet * leatherArmorMult
			}
		},
		'Scale Boots': {
			material: 'leather',
			sprite: [7, 3],
			implicitStat: {
				stat: 'armor',
				valueMult: slotArmorMult.feet * leatherArmorMult
			}
		}
	},
	trinket: {
		'Forged Ember': {
			sprite: [8, 0],
			implicitStat: {
				stat: 'armor',
				value: [25, 70]
			}
		},
		'Smokey Orb': {
			sprite: [8, 1],
			implicitStat: {
				stat: 'dodgeAttackChance',
				value: [1, 3]
			}
		},
		'Quartz Fragment': {
			sprite: [8, 2],
			implicitStat: {
				stat: 'elementArcanePercent',
				value: [3, 12]
			}
		},
		'Mystic Card': {
			sprite: [8, 3],
			implicitStat: {
				stat: 'magicFind',
				value: [3, 12]
			}
		},
		'Dragon Fang': {
			sprite: [8, 4],
			implicitStat: {
				stat: 'attackSpeed',
				value: [1, 5]
			}
		}
	},
	oneHanded: {
		Sword: {
			attrRequire: 'str',
			sprite: [9, 0],
			spellName: 'melee',
			spellConfig: {
				statType: 'str',
				statMult: 1,
				threatMult: 4,
				cdMax: 5,
				castTimeMax: 0,
				useWeaponRange: true,
				random: {
					damage: [1.47, 9.65]
				}
			},
			implicitStat: {
				stat: 'attackSpeed',
				value: [1, 5]
			}
		},
		Dagger: {
			attrRequire: 'dex',
			sprite: [9, 2],
			spellName: 'melee',
			spellConfig: {
				statType: 'dex',
				statMult: 1,
				cdMax: 3,
				castTimeMax: 0,
				useWeaponRange: true,
				random: {
					damage: [0.88, 5.79]
				}
			},
			implicitStat: {
				stat: 'addAttackCritChance',
				value: [10, 50]
			}
		},
		Wand: {
			attrRequire: 'int',
			sprite: [9, 8],
			spellName: 'projectile',
			spellConfig: {
				statType: 'int',
				statMult: 1,
				element: 'holy',
				cdMax: 5,
				castTimeMax: 0,
				manaCost: 0,
				range: 9,
				random: {
					damage: [1.17, 7.72]
				}
			},
			implicitStat: {
				stat: 'castSpeed',
				value: [1, 5]
			}
		}
	},
	twoHanded: {
		Axe: {
			attrRequire: 'str',
			sprite: [9, 3],
			spellName: 'melee',
			spellConfig: {
				statType: 'str',
				statMult: 1,
				threatMult: 4,
				cdMax: 9,
				castTimeMax: 0,
				useWeaponRange: true,
				random: {
					damage: [2.64, 17.37]
				}
			},
			implicitStat: {
				stat: 'addAttackCritMultiplier',
				value: [10, 30]
			}
		},
		'Gnarled Staff': {
			attrRequire: 'int',
			sprite: [9, 1],
			spellName: 'projectile',
			spellConfig: {
				statType: 'int',
				statMult: 1,
				element: 'arcane',
				auto: true,
				cdMax: 7,
				castTimeMax: 0,
				manaCost: 0,
				range: 9,
				random: {
					damage: [1.65, 10.81]
				}
			},
			implicitStat: {
				stat: 'regenMana',
				value: [3, 9]
			}
		},
		Spear: {
			attrRequire: 'dex',
			sprite: [9, 6],
			spellName: 'melee',
			range: 2,
			spellConfig: {
				statType: 'dex',
				statMult: 1,
				threatMult: 4,
				cdMax: 6,
				castTimeMax: 0,
				useWeaponRange: true,
				random: {
					damage: [1.76, 11.58]
				}
			},
			implicitStat: {
				stat: 'dodgeAttackChance',
				value: [1, 7]
			}
		}
	},
	offHand: {
		'Wooden Shield': {
			attrRequire: 'str',
			sprite: [13, 0],
			implicitStat: [{
				stat: 'armor',
				valueMult: 0.3
			}, {
				stat: 'blockAttackChance',
				valueMult: 1
			}]
		},
		'Gilded Shield': {
			attrRequire: 'str',
			sprite: [13, 1],
			implicitStat: [{
				stat: 'armor',
				valueMult: 0.6
			}, {
				stat: 'blockAttackChance',
				valueMult: 0.5
			}]
		},
		'Brittle Tome': {
			attrRequire: 'int',
			sprite: [13, 2],
			implicitStat: {
				stat: 'addSpellCritChance',
				value: [10, 50]
			}
		},
		'Ancient Tome': {
			attrRequire: 'int',
			sprite: [13, 3],
			implicitStat: {
				stat: 'addSpellCritMultiplier',
				value: [10, 30]
			}
		}
	},
	tool: {
		'Fishing Rod': {
			sprite: [11, 0]
		}
	}
};

module.exports = {
	types: types,
	init: function () {
		events.emit('onBeforeGetItemTypes', types);
	}
};
