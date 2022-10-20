let skins = require('../config/skins');

module.exports = {
	type: 'wardrobe',
	proximalPlayers: [],

	init: function (blueprint) {
		this.obj.instance.objects.buildObjects([{
			properties: {
				x: this.obj.x - 1,
				y: this.obj.y - 1,
				width: 3,
				height: 3,
				cpnNotice: {
					actions: {
						enter: {
							cpn: 'wardrobe',
							method: 'enterArea',
							targetId: this.obj.id,
							args: []
						},
						exit: {
							cpn: 'wardrobe',
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
		else if (!this.proximalPlayers.some(p => p === obj)) 
			return;

		this.proximalPlayers.spliceWhere(p => p === obj);

		obj.syncer.setArray(true, 'serverActions', 'removeActions', {
			key: 'u',
			action: {
				cpn: 'wardrobe',
				method: 'access',
				data: {
					targetId: this.obj.id
				}
			}
		});

		this.obj.instance.syncer.queue('onCloseWardrobe', null, [obj.serverId]);
	},

	enterArea: function (obj) {
		if (!obj.player)
			return;

		if (!this.proximalPlayers.some(p => p === obj))
			this.proximalPlayers.push(obj);

		let msg = 'Press U to access the wardrobe';

		obj.syncer.setArray(true, 'serverActions', 'addActions', {
			key: 'u',
			name: 'open wardrobe',
			action: {
				cpn: 'wardrobe',
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

	open: function (msg) {
		if (!msg.has('sourceId'))
			return;

		let obj = this.obj.instance.objects.objects.find(o => o.serverId === msg.sourceId);
		if ((!obj) || (!obj.player))
			return;

		let thisObj = this.obj;
		if ((Math.abs(thisObj.x - obj.x) > 1) || (Math.abs(thisObj.y - obj.y) > 1))
			return;

		obj.auth.getSkinList({
			callback: this.onGetSkins.bind(this, obj)
		});
	},

	apply: function (msg) {
		let obj = this.obj.instance.objects.objects.find(o => o.serverId === msg.sourceId);
		if (
			!obj ||
			!this.proximalPlayers.some(p => p === obj) ||
			!obj.auth.doesOwnSkin(msg.skinId)
		)
			return;

		obj.skinId = msg.skinId;
		obj.cell = skins.getCell(obj.skinId);
		obj.sheetName = skins.getSpritesheet(obj.skinId);

		obj.fireEvent('onBeforeSkinChange', {
			newSkinId: obj.skinId,
			newCell: obj.cell,
			newSheetName: obj.sheetName
		});

		let syncer = obj.syncer;
		syncer.set(false, null, 'cell', obj.cell);
		syncer.set(false, null, 'sheetName', obj.sheetName);
		syncer.set(false, null, 'skinId', obj.skinId);

		let oSyncer = this.obj.instance.syncer;

		oSyncer.queue('onCloseWardrobe', null, [obj.serverId]);

		oSyncer.queue('onGetObject', {
			x: obj.x,
			y: obj.y,
			components: [{
				type: 'attackAnimation',
				row: 0,
				col: 4
			}]
		}, -1);
	},

	onGetSkins: function (obj, result) {
		this.obj.instance.syncer.queue('onGetWardrobeSkins', {
			id: this.obj.id,
			skins: result
		}, [obj.serverId]);
	}
};
