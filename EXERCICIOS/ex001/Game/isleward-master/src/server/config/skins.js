const events = require('../misc/events');

const config = {
	wizard: {
		name: 'Wizard',
		sprite: [0, 0],
		defaultSpirit: 'owl',
		default: true
	},
	thief: {
		name: 'Thief',
		sprite: [1, 0],
		defaultSpirit: 'lynx',
		default: true
	},
	warrior: {
		name: 'Warrior',
		sprite: [2, 0],
		defaultSpirit: 'bear',
		default: true
	}
};

module.exports = {
	init: function () {
		events.emit('onBeforeGetSkins', config);
	},

	getBlueprint: function (skinId) {
		return config[skinId];
	},

	getList: function (skins) {
		const result = Object
			.entries(config)
			.map(([skinId, skinConfig]) => {
				const { sprite: [ spriteX, spriteY ] } = skinConfig;

				const serializedSprite = `${spriteX},${spriteY}`;

				const skin = {
					id: skinId,
					...skinConfig,
					sprite: serializedSprite
				};

				return skin;
			});

		return result;
	},

	getCell: function (skinId) {
		let skin = config[skinId] || config.wizard;
		return (skin.sprite[1] * 8) + skin.sprite[0];
	},

	getSpritesheet: function (skinId) {
		let skin = config[skinId] || config.wizard;
		return skin.spritesheet || 'characters';
	}
};
