define([
	'js/rendering/effects'
], function (
	effects
) {
	return {
		type: 'fadeInOut',

		delta: 1,

		updateCd: 0,
		updateCdMax: 10,

		alphaMax: 1,
		alphaMin: 0,

		infinite: false,

		init: function (blueprint) {
			if (this.obj.components.some(c => c.type === this.type))
				return true;
		},

		update: function () {
			let { updateCd, delta } = this;
			const { updateCdMax, alphaMin, alphaMax, infinite, obj: { sprite } } = this;

			updateCd += delta;
			if (updateCd === updateCdMax) {
				if (!infinite)
					this.destroyed = true;
				else
					delta *= -1;
			}

			this.updateCd = updateCd;
			this.delta = delta;

			if (!sprite)
				return;

			const alpha = alphaMin + ((updateCd / updateCdMax) * (alphaMax - alphaMin));
			sprite.alpha = alpha;
		},

		destroy: function () {
			effects.unregister(this);
		}
	};
});
