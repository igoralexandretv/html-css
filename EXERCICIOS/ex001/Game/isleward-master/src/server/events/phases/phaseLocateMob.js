module.exports = {
	mobs: null,

	init: function () {
		if (!this.mobs.push)
			this.mobs = [ this.mobs ];

		let mobs = this.mobs;

		let objects = this.instance.objects.objects;
		let oLen = objects.length;
		for (let i = 0; i < oLen; i++) {
			let o = objects[i];
			let index = mobs.indexOf(o.id);
			if (index === -1)
				continue;

			mobs.splice(index, 1, o);
		}
	},

	update: function () {
		let players = this.instance.objects.objects.filter(function (o) {
			return o.player;
		});
		let pLen = players.length;

		let distance = this.distance;

		let mobs = this.mobs;
		let mLen = mobs.length;
		for (let i = 0; i < mLen; i++) {
			let m = mobs[i];

			for (let j = 0; j < pLen; j++) {
				let p = players[j];

				if ((Math.abs(p.x - m.x) <= distance) && (Math.abs(p.y - m.y) <= distance)) {
					mobs.splice(i, 1);
					mLen--;
					i--;
					break;
				}
			}
		}

		if (mobs.length === 0)
			this.end = true;
	}	
};
