let cpnHealPatch = {
	type: 'healPatch',

	contents: [],

	init: function (blueprint) {
		for (let p in blueprint) 
			this[p] = blueprint[p];
	},

	applyHeal: function (o, amount) {
		o.stats.getHp(amount, this.caster);
	},

	collisionEnter: function (o) {
		if ((!o.aggro) || (!o.player))
			return;

		let isPlayer = !!this.caster.player;
		let isTargetPlayer = !!o.player;

		if ((this.caster.aggro.canAttack(o)) || (isPlayer !== isTargetPlayer))
			return;

		this.contents.push(o);
	},

	collisionExit: function (o) {
		let contents = this.contents;
		let cLen = contents.length;
		for (let i = 0; i < cLen; i++) {
			if (contents[i] === o) {
				contents.splice(i, 1);
				return;
			}
		}
	},

	update: function () {
		let contents = this.contents;
		let cLen = contents.length;
		for (let i = 0; i < cLen; i++) {
			let c = contents[i];

			let amount = this.spell.getDamage(c, true);
			this.applyHeal(c, amount);
		}
	}
};

module.exports = {
	type: 'healingCircle',

	cdMax: 20,
	manaCost: 0,
	range: 9,

	healing: 1,
	duration: 70,

	targetGround: true,
	needLos: true,

	cast: function (action) {
		let obj = this.obj;
		let target = action.target;

		let radius = this.radius;

		let x = target.x;
		let y = target.y;

		let objects = obj.instance.objects;
		let patches = [];

		let physics = obj.instance.physics;

		for (let i = x - radius; i <= x + radius; i++) {
			let dx = Math.abs(x - i);
			for (let j = y - radius; j <= y + radius; j++) {
				let distance = dx + Math.abs(j - y);

				if (distance > radius + 1)
					continue;

				if (!physics.hasLos(x, y, i, j))
					continue;

				let patch = objects.buildObjects([{
					x: i,
					y: j,
					properties: {
						cpnHealPatch: cpnHealPatch,
						cpnParticles: {
							simplify: function () {
								return {
									type: 'particles',
									blueprint: this.blueprint
								};
							},
							blueprint: this.particles
						}
					},
					extraProperties: {
						healPatch: {
							caster: obj,
							spell: this
						}
					}
				}]);

				patches.push(patch);
			}
		}

		this.sendBump(target);

		this.queueCallback(null, this.duration * consts.tickTime, this.endEffect.bind(this, patches), null, true);

		return true;
	},
	endEffect: function (patches) {
		let pLen = patches.length;
		for (let i = 0; i < pLen; i++) 
			patches[i].destroyed = true;
	}
};
