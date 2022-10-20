module.exports = {
	type: 'projectile',

	applyEffect: null,

	cdMax: 7,
	manaCost: 0,

	range: 9,

	speed: 150,
	statMult: 1,
	damage: 1,

	row: 3,
	col: 0,

	needLos: true,
	shootAll: false,
	percentDamage: false,

	cast: function (action) {
		if (this.shootAll) {
			this.castAll(action);
			return true;
		}

		let obj = this.obj;
		let target = action.target;

		let ttl = (Math.sqrt(Math.pow(target.x - obj.x, 2) + Math.pow(target.y - obj.y, 2)) * this.speed) - 50;

		let projectileConfig = {
			caster: this.obj.id,
			extraTargets: 0,
			x: obj.x,
			y: obj.y,
			components: [{
				idSource: this.obj.id,
				idTarget: target.id,
				type: 'projectile',
				ttl: ttl,
				projectileOffset: this.projectileOffset,
				particles: this.particles
			}, {
				type: 'attackAnimation',
				layer: 'projectiles',
				loop: -1,
				row: this.row,
				col: this.col,
				spriteSheet: this.spriteSheet
			}]
		};

		this.obj.fireEvent('beforeSpawnProjectile', this, projectileConfig);

		this.sendBump(target);

		let targets = [target];
		let aggroList = this.obj.aggro.list
			.filter(function (l) {
				return (l.obj !== target);
			});

		for (let i = 0; i < Math.min(aggroList.length, projectileConfig.extraTargets); i++) {
			let pick = ~~(Math.random() * aggroList.length);
			targets.push(aggroList[pick].obj);
			aggroList.splice(pick, 1);
		}

		targets.forEach(function (t) {
			ttl = (Math.sqrt(Math.pow(t.x - obj.x, 2) + Math.pow(t.y - obj.y, 2)) * this.speed) - 50;
			let config = extend({}, projectileConfig);
			config.components[0].ttl = ttl;
			config.components[0].idTarget = t.id;

			this.sendAnimation(config);
			this.queueCallback(this.explode.bind(this, t), ttl, null, t);
		}, this);

		return true;
	},

	getAllTargets: function () {
		const targets = this.obj.aggro.list.map(a => a.obj);

		return targets;
	},

	castAll: function (action) {
		const { obj, projectileOffset, particles, row, col, speed } = this;

		const targets = this.getAllTargets();

		targets.forEach(t => {
			let ttl = (Math.sqrt(Math.pow(t.x - obj.x, 2) + Math.pow(t.y - obj.y, 2)) * speed) - 50;

			let projectileConfig = {
				caster: obj.id,
				x: obj.x,
				y: obj.y,
				components: [{
					idSource: obj.id,
					idTarget: t.id,
					type: 'projectile',
					ttl: ttl,
					projectileOffset: projectileOffset,
					particles: particles
				}, {
					type: 'attackAnimation',
					layer: 'projectiles',
					loop: -1,
					row: row,
					col: col,
					spriteSheet: this.spriteSheet
				}]
			};

			obj.fireEvent('beforeSpawnProjectile', this, projectileConfig);

			this.sendAnimation(projectileConfig);

			this.sendBump(t);

			this.queueCallback(this.explode.bind(this, t), ttl, null, t);
		});
	},

	explode: function (target) {
		if ((this.obj.destroyed) || (target.destroyed))
			return;

		let damage = this.getDamage(target);

		if (!target.stats)
			return;

		if (this.applyEffect)
			target.effects.addEffect(this.applyEffect, this.obj);

		target.stats.takeDamage(damage, this.threatMult, this.obj);
	}
};
