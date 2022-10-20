const recipes = require('../config/recipes/recipes');

const buildRecipe = require('./workbench/buildRecipe');
const craft = require('./workbench/craft');

module.exports = {
	type: 'workbench',

	craftType: null,

	noticeMessage: null,

	init: function (blueprint) {
		this.craftType = blueprint.type;
		this.noticeMessage = blueprint.noticeMessage;

		this.obj.instance.objects.buildObjects([{
			properties: {
				x: this.obj.x - 1,
				y: this.obj.y - 1,
				width: 3,
				height: 3,
				cpnNotice: {
					actions: {
						enter: {
							cpn: 'workbench',
							method: 'enterArea',
							targetId: this.obj.id,
							args: []
						},
						exit: {
							cpn: 'workbench',
							method: 'exitArea',
							targetId: this.obj.id,
							args: []
						}
					}
				}
			}
		}]);
	},

	exitArea: function (obj) {
		if (!obj.player)
			return;

		obj.syncer.setArray(true, 'serverActions', 'removeActions', {
			key: 'u',
			action: {
				cpn: 'workbench',
				method: 'open',
				data: {
					targetId: this.obj.id
				}
			}
		});

		this.obj.instance.syncer.queue('onCloseWorkbench', null, [obj.serverId]);
	},

	enterArea: function (obj) {
		if (!obj.player)
			return;

		let msg = `Press U to ${this.noticeMessage || `access the ${this.obj.name}`}`;

		obj.syncer.setArray(true, 'serverActions', 'addActions', {
			key: 'u',
			name: 'access workbench',
			action: {
				cpn: 'workbench',
				method: 'open',
				data: {
					targetId: this.obj.id
				}
			}
		});

		this.obj.instance.syncer.queue('onGetAnnouncement', {
			src: this.obj.id,
			msg: msg
		}, [obj.serverId]);
	},

	open: async function (msg) {
		if (!msg.has('sourceId'))
			return;

		let obj = this.obj.instance.objects.objects.find(o => o.serverId === msg.sourceId);
		if ((!obj) || (!obj.player))
			return;

		let thisObj = this.obj;
		if ((Math.abs(thisObj.x - obj.x) > 1) || (Math.abs(thisObj.y - obj.y) > 1))
			return;

		const unlocked = await io.getAsync({
			key: obj.name,
			table: 'recipes',
			isArray: true
		});

		this.obj.instance.syncer.queue('onOpenWorkbench', {
			workbenchId: this.obj.id,
			name: this.obj.name,
			recipes: recipes.getList(this.craftType, unlocked)
		}, [obj.serverId]);
	},

	getRecipe: function (msg) {
		let obj = this.obj.instance.objects.objects.find(o => o.serverId === msg.sourceId);
		if ((!obj) || (!obj.player))
			return;

		const sendRecipe = buildRecipe(this.craftType, obj, msg);

		this.resolveCallback(msg, sendRecipe);
	},

	craft: function (msg) {
		const result = craft(this, msg);

		if (result)
			this.resolveCallback(msg, result);
	},

	resolveCallback: function (msg, result) {
		let callbackId = (msg.has('callbackId')) ? msg.callbackId : msg;
		result = result || [];

		if (!callbackId)
			return;

		process.send({
			module: 'atlas',
			method: 'resolveCallback',
			msg: {
				id: callbackId,
				result: result
			}
		});
	}
};
