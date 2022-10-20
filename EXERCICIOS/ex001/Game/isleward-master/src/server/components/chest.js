module.exports = {
	type: 'chest',

	ownerName: null,

	ttl: -1,

	init: function (blueprint) {
		if (blueprint.has('ownerName'))
			this.ownerName = blueprint.ownerName;

		if (blueprint.ttl)
			this.ttl = blueprint.ttl;
	},

	simplify: function (self) {
		return {
			type: 'chest',
			ownerName: this.ownerName
		};
	},

	update: function () {
		if (this.ttl > 0) {
			this.ttl--;

			if (!this.ttl)
				this.obj.destroyed = true;
		}
	},

	collisionEnter: function (obj) {
		if (!obj.player)
			return;

		let ownerName = this.ownerName;
		if (ownerName) {
			if (ownerName instanceof Array) {
				if (ownerName.indexOf(obj.name) === -1)
					return;
			} else if (ownerName !== obj.name)
				return;
		}

		//Make sure the player took all the items
		// since maybe he doesn't have enough space for everything
		if (this.obj.inventory.giveItems(obj))
			this.obj.destroyed = true;
	}
};
