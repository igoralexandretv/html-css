module.exports = {
	type: 'slowBlast',

	intCd: 0,
	intCdMax: 1,
	thickness: 2,
	casting: false,
	radius: 0,

	needLos: false,

	range: 100,

	castingEffect: null,

	update: function () {
		if (!this.casting)
			return;

		if (this.intCd > 0) {
			this.intCd--;
			return;
		} this.intCd = this.intCdMax;

		let obj = this.obj;

		let x = obj.x;
		let y = obj.y;

		for (let a = 0; a < this.thickness; a++) {
			this.radius++;
			let radius = this.radius;

			let physics = obj.instance.physics;
			let syncer = obj.instance.syncer;

			let xMin = x - radius;
			let yMin = y - radius;
			let xMax = x + radius;
			let yMax = y + radius;

			let success = false;

			for (let i = xMin; i <= xMax; i++) {
				let dx = Math.abs(x - i);
				for (let j = yMin; j <= yMax; j++) {
					let dy = Math.abs(y - j);

					if (Math.random() < 0.35)
						continue;

					let distance = ~~Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
					if (distance !== radius)
						continue;

					if (!physics.hasLos(x, y, i, j))
						continue;

					success = true;

					let effect = {
						x: i,
						y: j,
						components: [{
							type: 'attackAnimation',
							destroyObject: true,
							row: [10, 10, 10, 10, 10, 10, 10, 8, 8, 8, 7, 7, 7][~~(Math.random() * 13)],
							col: 4,
							frameDelay: 1 + ~~(Math.random() * 10)
						}, {
							type: 'particles',
							noExplosion: true,
							blueprint: this.particles
						}]
					};

					syncer.queue('onGetObject', effect, -1);

					let mobs = physics.getCell(i, j);
					let mLen = mobs.length;
					for (let k = 0; k < mLen; k++) {
						let m = mobs[k];

						//Maybe we killed something?
						if (!m) {
							mLen--;
							continue;
						} else if (!m.player)
							continue;

						let damage = this.getDamage(m);
						m.stats.takeDamage(damage, 1, obj);
					}
				}
			}

			if (!success) {
				this.casting = false;
				this.castingEffect.destroyed = true;
				return;
			}
		}

		this.sendBump({
			x: x,
			y: y + 1
		});

		return true;
	},

	cast: function (action) {
		this.castingEffect = this.obj.effects.addEffect({
			type: 'casting'
		});

		this.casting = true;
		this.radius = 0;
		this.intCd = 0;

		return true;
	}
};
