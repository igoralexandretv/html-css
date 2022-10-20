module.exports = {
	type: 'resourceNode',

	collisionEnter: function (obj) {
		if (!obj.player)
			return;

		obj.gatherer.enter(this.obj);
	},

	collisionExit: function (obj) {
		if (!obj.player)
			return;

		obj.gatherer.exit(this.obj);
	},

	gather: function () {
		this.quantity--;
		if (this.quantity <= 0)
			this.obj.destroyed = true;
	},

	simplify: function () {
		return {
			type: 'resourceNode',
			nodeType: this.nodeType
		};
	}
};
