const cardRecipes = require('./recipes/recipes');
const cards = require('./cards');
const { dealer } = require('./config');

module.exports = {
	name: 'Feature: Cards',

	init: function () {
		this.events.on('onBeforeGetClientConfig', this.onBeforeGetClientConfig.bind(this));
		this.events.on('onBeforeDropBag', this.onBeforeDropBag.bind(this));
		this.events.on('onBeforeGetRecipes', this.onBeforeGetRecipes.bind(this));
		this.events.on('onAfterGetZone', this.onAfterGetZone.bind(this));
		this.events.on('onAfterGetLayerObjects', this.onAfterGetLayerObjects.bind(this));
	},

	onBeforeGetClientConfig: function (config) {
		config.textureList.push(`${this.folderName}/images/mobs.png`);
	},

	onAfterGetZone: function (zoneName, config) {
		const { zoneName: dealerZoneName, zoneConfig } = dealer;
		const dealerName = zoneConfig.name.toLowerCase();

		if (zoneName !== dealerZoneName)
			return;

		zoneConfig.sheetName = zoneConfig.sheetName.replace('$MODFOLDER$', this.folderName);

		config.objects[dealerName] = zoneConfig;
	},

	onAfterGetLayerObjects: function ({ map, layer, objects, mapScale }) {
		const { zoneName: dealerZoneName, pos: { x, y }, zoneConfig: { name } } = dealer;

		if (map !== dealerZoneName || layer !== 'objects')
			return;

		objects.push({
			name,
			x: x * mapScale,
			y: y * mapScale,
			height: 8,
			width: 8,
			visible: true
		});
	},

	onBeforeGetRecipes: function (recipes) {
		recipes.gambling = cardRecipes;
	},

	onBeforeDropBag: function (dropper, items, looter) {
		if (!looter.player)
			return;

		let dropEvent = {
			chanceMultiplier: 1,
			source: dropper
		};
		looter.fireEvent('beforeGenerateLoot', dropEvent);
		if (Math.random() >= dropEvent.chanceMultiplier)
			return;

		let res = cards.getCard(this.folderName, looter, dropper);
		if (!res)
			return;

		items.push(res);
	}
};
