define([
	'js/rendering/effects',
	'js/rendering/renderer'
], function (
	effects,
	renderer
) {
	return {
		type: 'light',

		lightCd: 0,
		lightO: {},

		emitters: {},

		range: 3,

		init: function (blueprint) {
			this.blueprint = this.blueprint || {};

			let x = this.obj.x;
			let y = this.obj.y;

			let range = this.range;
			let halfRange = (range - 1) / 2;

			for (let i = 0; i < range; i++) {
				for (let j = 0; j < range; j++) {
					let n = i + '|' + j;

					let maxAlpha = (1 + ((halfRange * 2) - (Math.abs(halfRange - i) + Math.abs(halfRange - j)))) * 0.1;

					this.emitters[n] = renderer.buildEmitter({
						obj: this.obj,
						pos: {
							x: ((x + i - halfRange) * scale) + (scale / 2),
							y: ((y + j - halfRange) * scale) + (scale / 2)
						},
						scale: {
							start: {
								min: 24,
								max: 32
							},
							end: {
								min: 12,
								max: 22
							}
						},
						color: this.blueprint.color || {
							start: ['ffeb38'],
							end: ['ffeb38', 'ff6942', 'd43346']
						},
						alpha: {
							start: maxAlpha,
							end: 0
						},
						frequency: 0.9 + (~~(Math.random() * 10) / 10),
						blendMode: 'screen',
						lifetime: this.blueprint.lifetime || {
							min: 1,
							max: 4
						},
						speed: {
							start: {
								min: 0,
								max: 4
							},
							end: {
								min: 0,
								max: 2
							}
						},
						randomSpeed: true,
						randomColor: true,
						randomScale: true
					});
				}
			}

			this.setVisible(this.obj.isVisible);
		},

		update: function () {

		},

		setVisible: function (visible) {
			let emitters = this.emitters;
			for (let p in emitters) 
				emitters[p].emit = visible;
		},

		destroy: function () {
			let keys = Object.keys(this.emitters);
			for (let i = 0; i < keys.length; i++) {
				let emitter = this.emitters[keys[i]];
				delete this.emitters[keys[i]];

				renderer.destroyEmitter(emitter);
			}
		}
	};
});
