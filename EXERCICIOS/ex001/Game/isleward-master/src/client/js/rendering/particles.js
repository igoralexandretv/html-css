define([
	'particles',
	'js/rendering/particleDefaults',
	'js/rendering/shaders/outline'
], function (
	pixiParticles,
	particleDefaults,
	shaderOutline
) {
	return {
		renderer: null,
		stage: null,

		emitters: [],

		lastTick: null,

		init: function (options) {
			this.r = options.r;
			this.renderer = options.renderer;
			this.stage = options.stage;
			this.lastTick = Date.now();
		},

		buildEmitter: function (config) {
			let obj = config.obj;
			delete config.obj;

			let options = $.extend(true, {}, particleDefaults, config);

			let emitter = new PIXI.particles.Emitter(this.stage, ['images/particles.png'], options);
			emitter.obj = obj;
			emitter.emit = true;
			emitter.particleEngine = this;

			this.emitters.push(emitter);

			return emitter;
		},

		destroyEmitter: function (emitter) {
			emitter.emit = false;
		},

		update: function () {
			let renderer = this.r;
			let now = Date.now();

			let emitters = this.emitters;
			let eLen = emitters.length;
			for (let i = 0; i < eLen; i++) {
				let e = emitters[i];

				let visible = null;
				let destroy = (
					(!e.emit) &&
					(e.obj.destroyed)
				);

				if (destroy) {
					if (e.particleCount > 0) {
						visible = renderer.isVisible(e.spawnPos.x, e.spawnPos.y);
						if (visible) 
							destroy = false;
					}
				}

				if (destroy) {
					emitters.splice(i, 1);
					e.destroy();
					e = null;

					i--;
					eLen--;
					continue;
				} 

				if (visible === null)
					visible = renderer.isVisible(e.spawnPos.x, e.spawnPos.y);
				if (!visible)
					continue;

				let r = e.update((now - this.lastTick) * 0.001);
				r.forEach(function (rr) {
					if (e.blendMode === 'overlay')
						rr.pluginName = 'picture';
				}, this);
			}

			this.lastTick = now;
		}
	};
});
