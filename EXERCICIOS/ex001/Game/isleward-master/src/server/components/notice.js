module.exports = {
	type: 'notice',

	msg: null,
	actions: null,

	syncer: null,

	maxLevel: 0,

	contents: [],

	init: function (blueprint) {
		this.msg = blueprint.msg;
		this.msgFunction = blueprint.msgFunction;
		this.actions = blueprint.actions || {};
		this.announce = blueprint.announce;
		this.maxLevel = blueprint.maxLevel || 0;

		this.syncer = this.obj.instance.syncer;
	},

	destroy: function () {
		this.contents.forEach(c => this.collisionExit(c));
	},

	callAction: function (obj, actionName) {
		let action = this.actions[actionName];
		if (!action)
			return;

		let args = action.args || [];

		let cpn = null;

		if (typeof(action) === 'function') {
			action(obj);
			
			return;
		}

		if (action.targetId) {
			let target = this.obj.instance.objects.find(o => o.id === action.targetId);
			if (target) {
				cpn = target[action.cpn];
				if ((cpn) && (cpn[action.method]))
					cpn[action.method](obj, ...args);
			}

			return;
		}

		cpn = obj[action.cpn];
		if ((cpn) && (cpn[action.method]))
			cpn[action.method](...args);
	},

	collisionEnter: function (obj) {
		if (!obj.player)
			return;
		else if ((this.maxLevel) && (obj.stats.values.level > this.maxLevel))
			return;

		this.contents.push(obj);

		this.callAction(obj, 'enter');

		if (!this.msg && !this.msgFunction)
			return;

		const msg = this.msg || this.msgFunction(obj);

		if (this.announce) {
			this.syncer.queue('onGetAnnouncement', {
				src: this.obj.id,
				msg
			}, [obj.serverId]);

			return;
		}

		this.syncer.queue('onGetDialogue', {
			src: this.obj.id,
			msg
		}, [obj.serverId]);
	},

	collisionExit: function (obj, force) {
		if (!force) {
			if (!obj.player)
				return;
			else if ((this.maxLevel) && (obj.stats.values.level > this.maxLevel))
				return;
		}

		this.contents.spliceWhere(c => (c === obj));

		this.callAction(obj, 'exit');

		if (!this.msg)
			return;

		this.syncer.queue('onRemoveDialogue', {
			src: this.obj.id
		}, [obj.serverId]);
	},

	events: {
		onCellPlayerLevelUp: function (obj) {
			if ((this.maxLevel) && (obj.stats.values.level > this.maxLevel))
				this.collisionExit(obj, true);
		}
	}
};
