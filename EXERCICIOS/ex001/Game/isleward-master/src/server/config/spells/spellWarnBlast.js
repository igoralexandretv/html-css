module.exports = {
	type: 'warnBlast',

	range: 100,

	castingEffect: null,

	statType: 'dex',
	statMult: 1,
	targetGround: true,

	needLos: true,

	damage: 10,

	delay: 10,

	radius: 1,

	row: null,
	col: 4,
	rowOptions: [10, 10, 10, 10, 10, 10, 10, 8, 8, 8, 7, 7, 7],
	spriteSheet: 'attacks',

	cast: function (action) {
		let obj = this.obj;

		let physics = obj.instance.physics;

		let target = action.target;
		let x = target.x;
		let y = target.y;

		let radius = this.radius;

		let xMin = x - radius;
		let xMax = x + radius;

		let yMin = y - radius;
		let yMax = y + radius;

		let attackTemplate = this.attackTemplate;
		if (attackTemplate)
			attackTemplate = attackTemplate.split(' ');
		let count = -1;

		for (let i = xMin; i <= xMax; i++) {
			for (let j = yMin; j <= yMax; j++) {
				count++;

				if (!physics.hasLos(x, y, i, j))
					continue;
				else if ((attackTemplate) && (attackTemplate[count] === 'x'))
					continue;

				if ((attackTemplate) && (~~attackTemplate[count] > 0)) {
					this.queueCallback(this.spawnWarning.bind(this, i, j), ~~attackTemplate[count] * consts.tickTime);
					continue;
				} else
					this.spawnWarning(i, j);
			}
		}

		this.sendBump(target);

		return true;
	},

	spawnWarning: function (x, y) {
		let obj = this.obj;
		let syncer = obj.instance.syncer;

		let effect = {
			x: x,
			y: y,
			components: [{
				type: 'particles',
				noExplosion: true,
				ttl: this.delay * 175 / 16,
				blueprint: this.particles
			}]
		};

		syncer.queue('onGetObject', effect, -1);

		this.queueCallback(this.onWarningOver.bind(this, x, y), this.delay * consts.tickTime);
	},

	onWarningOver: function (x, y) {
		const { obj, spriteSheet, rowOptions, col, row } = this;

		let physics = obj.instance.physics;
		let syncer = obj.instance.syncer;

		const useRow = (row !== null) ? row : rowOptions[~~(Math.random() * rowOptions.length)];

		let effect = {
			x: x,
			y: y,
			components: [{
				type: 'attackAnimation',
				destroyObject: true,
				row: useRow,
				col,
				frameDelay: 4 + ~~(Math.random() * 7),
				spriteSheet
			}]
		};

		syncer.queue('onGetObject', effect, -1);

		let mobs = physics.getCell(x, y);
		let mLen = mobs.length;
		for (let k = 0; k < mLen; k++) {
			let m = mobs[k];

			//Maybe we killed something?
			if (!m) {
				mLen--;
				continue;
			} else if (!m.aggro)
				continue;
			else if (!this.obj.aggro.canAttack(m))
				continue;

			let damage = this.getDamage(m);
			m.stats.takeDamage(damage, 1, obj);
		}
	}
};
