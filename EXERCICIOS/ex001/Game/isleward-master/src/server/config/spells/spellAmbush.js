const particlePatch = {
	type: 'particlePatch',

	ttl: 0,

	update: function () {
		this.ttl--;
		if (this.ttl <= 0)
			this.obj.destroyed = true;
	}
};

module.exports = {
	type: 'ambush',

	cdMax: 40,
	manaCost: 10,
	range: 9,

	damage: 1,
	speed: 70,
	isAttack: true,

	stunDuration: 20,
	needLos: true,

	tickParticles: {
		ttl: 5,
		blueprint: { color: {
			start: ['a24eff', '7a3ad3'],
			end: ['533399', '393268']
		},
		scale: {
			start: {
				min: 2,
				max: 12
			},
			end: {
				min: 0,
				max: 6
			}
		},
		lifetime: {
			min: 1,
			max: 2
		},
		alpha: {
			start: 0.8,
			end: 0
		},
		spawnType: 'rect',
		spawnRect: {
			x: -12,
			y: -12,
			w: 24,
			h: 24
		},
		randomScale: true,
		randomColor: true,
		frequency: 0.25 }
	},

	cast: function (action) {
		let obj = this.obj;
		let target = action.target;

		let x = obj.x;
		let y = obj.y;

		let dx = target.x - x;
		let dy = target.y - y;

		//This calculation is much like the charge one except we land on the
		// furthest side of the target instead of the closest. Hence, we multiply
		// the delta by -1
		let offsetX = 0;
		if (dx !== 0)
			offsetX = dx / Math.abs(dx);

		let offsetY = 0;
		if (dy !== 0)
			offsetY = dy / Math.abs(dy);

		let targetPos = {
			x: target.x,
			y: target.y
		};

		const physics = obj.instance.physics;
		const fnTileValid = this.isTileValid.bind(this, physics, x, y);
		//Check where we should land
		if (!fnTileValid(targetPos.x + offsetX, targetPos.y + offsetY)) {
			if (!fnTileValid(targetPos.x + offsetX, targetPos.y)) {
				if (!fnTileValid(targetPos.x, targetPos.y + offsetY)) {
					targetPos.x -= offsetX;
					targetPos.y -= offsetY;
				} else
					targetPos.y += offsetY;
			} else 
				targetPos.x += offsetX;
		} else {
			targetPos.x += offsetX;
			targetPos.y += offsetY;
		}

		let targetEffect = target.effects.addEffect({
			type: 'stunned',
			ttl: this.stunDuration
		});

		if (targetEffect) {
			this.obj.instance.syncer.queue('onGetDamage', {
				id: target.id,
				event: true,
				text: 'stunned'
			}, -1);
		}

		if (this.animation) {
			this.obj.instance.syncer.queue('onGetObject', {
				id: this.obj.id,
				components: [{
					type: 'animation',
					template: this.animation
				}]
			}, -1);
		}

		physics.removeObject(obj, obj.x, obj.y);
		physics.addObject(obj, targetPos.x, targetPos.y);

		this.reachDestination(target, targetPos);

		return true;
	},

	onCastTick: function (particleFrequency) {
		const { obj, tickParticles } = this;
		const { x, y, instance: { objects } } = obj;

		const particleBlueprint = extend({}, tickParticles.blueprint, {
			frequency: particleFrequency
		});

		objects.buildObjects([{
			x,
			y,
			properties: {
				cpnParticlePatch: particlePatch,
				cpnParticles: {
					simplify: function () {
						return {
							type: 'particles',
							blueprint: particleBlueprint
						};
					},
					blueprint: this.particles
				}
			},
			extraProperties: {
				particlePatch: {
					ttl: tickParticles.ttl
				}
			} 
		}]);
	},

	reachDestination: function (target, targetPos) {
		if (this.obj.destroyed)
			return;

		let obj = this.obj;

		obj.x = targetPos.x;
		obj.y = targetPos.y;

		let syncer = obj.syncer;
		syncer.o.x = targetPos.x;
		syncer.o.y = targetPos.y;

		this.onCastTick(0.01);

		this.obj.aggro.move();

		let damage = this.getDamage(target);
		target.stats.takeDamage(damage, this.threatMult, obj);
	},

	isTileValid: function (physics, fromX, fromY, toX, toY) {
		if (physics.isTileBlocking(toX, toY))
			return false;
		return physics.hasLos(fromX, fromY, toX, toY);
	}
};
