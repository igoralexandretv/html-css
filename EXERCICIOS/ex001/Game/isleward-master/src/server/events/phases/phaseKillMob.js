let cpnDeathStopper = {
	type: 'deathStopper',
	percentage: 0,
	end: false,

	events: {
		beforeTakeDamage: function (damage, source) {
			let statValues = this.obj.stats.values;
			let minHp = statValues.hpMax * this.percentage;
			if (statValues.hp - damage.amount < minHp) {
				this.end = true;
				damage.amount = Math.max(0, statValues.hp - minHp);
			}
		}
	}
};

module.exports = {
	mobs: null,

	init: function () {
		if (!this.mobs.push)
			this.mobs = [this.mobs];

		let mobs = this.mobs;
		let percentage = this.percentage;

		let objects = this.instance.objects.objects;
		let oLen = objects.length;
		for (let i = 0; i < oLen; i++) {
			let o = objects[i];
			let index = mobs.indexOf(o.id);
			if (index === -1)
				continue;

			if (percentage) {
				let cpn = extend({}, cpnDeathStopper, {
					percentage: percentage
				});
				o.components.push(cpn);
				cpn.obj = o;
			}

			mobs.splice(index, 1, o);
		}
	},

	update: function () {
		let mobs = this.mobs;
		let mLen = mobs.length;
		for (let i = 0; i < mLen; i++) {
			let m = mobs[i];
			let destroyed = m.destroyed;
			if (!destroyed) {
				let deathStopper = m.components.find(c => (c.type === 'deathStopper'));
				if (deathStopper)
					destroyed = deathStopper.end;
			}

			if (destroyed) {
				mobs.splice(i, 1);
				mLen--;
				i--;
			}
		}

		if (mobs.length === 0)
			this.end = true;
	}
};
