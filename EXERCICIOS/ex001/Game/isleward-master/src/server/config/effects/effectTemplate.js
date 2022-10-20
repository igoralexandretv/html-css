module.exports = {
	syncExtend: function (data) {
		let effects = this.obj.effects;
		effects.syncExtend(this.id, data);
	},

	isFirstOfType: function () {
		let effects = this.obj.effects;
		let firstOfType = effects.find(f => f.type === this.type);
		return (firstOfType.id === this);
	},

	save: function () {
		if (!this.persist)
			return null;

		let values = {};
		for (let p in this) {
			let value = this[p];
			if ((typeof(value) === 'function') || (p === 'obj') || (p === 'events'))
				continue;

			values[p] = value;
		}

		if (!values.expire)
			values.expire = (+new Date()) + (this.ttl * consts.tickTime);

		return values;
	},

	simplify: function () {
		return {
			id: this.id,
			type: this.type
		};
	}	
};
