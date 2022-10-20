define([
	'js/rendering/renderer'
], function (
	renderer
) {
	return {
		type: 'moveAnimation',

		targetX: 0,
		targetY: 0,

		x: 0,
		y: 0,

		ttl: 50,
		endTime: 0,

		particles: null,
		particleBlueprint: null,

		particleExplosionBlueprint: null,

		init: function (blueprint) {
			const particleBlueprint = $.extend({
				scale: {
					start: {
						min: 6,
						max: 16
					},
					end: {
						min: 0,
						max: 10
					}
				},
				opacity: {
					start: 0.05,
					end: 0
				},
				lifetime: {
					min: 1,
					max: 2
				},
				speed: {
					start: {
						min: 2,
						max: 20
					},
					end: {
						min: 0,
						max: 8
					}
				},
				color: {
					start: 'fcfcfc',
					end: 'c0c3cf'
				},
				randomScale: true,
				randomSpeed: true,
				chance: 0.4
			}, this.particleBlueprint);

			this.particles = this.obj.addComponent('particles', { blueprint: particleBlueprint });

			this.endTime = +new Date() + this.ttl;

			let obj = this.obj;
			this.x = obj.x;
			this.y = obj.y;

			if (this.targetX > this.x) 
				this.obj.flipX = false;
			
			else if (this.targetX < this.x)
				this.obj.flipX = true;

			this.obj.setSpritePosition();
		},

		update: function () {
			let source = this.obj;
			let target = this.target;

			let dx = this.targetX - this.x;
			let dy = this.targetY - this.y;

			let ticksLeft = ~~((this.endTime - (+new Date())) / 16);

			if (ticksLeft <= 0) {
				source.x = this.targetX;
				source.y = this.targetY;

				source.setSpritePosition();

				this.destroyed = true;
				this.particles.destroyed = true;

				//Sometimes we just move to a point without exploding
				if (target) {
					const particleExplosionBlueprint = this.particleExplosionBlueprint || {};

					target.addComponent('explosion', {
						new: true,
						blueprint: particleExplosionBlueprint
					}).explode();
				}
			} else {
				dx /= ticksLeft;
				dy /= ticksLeft;

				this.x += dx;
				this.y += dy;

				source.x = (~~((this.x * 32) / 8) * 8) / 32;
				source.y = (~~((this.y * 32) / 8) * 8) / 32;

				source.setSpritePosition();
			}

			renderer.updateSprites();
		}
	};
});
