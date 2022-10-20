define([
	'js/rendering/effects'
], function (
	effects
) {
	return {
		type: 'bumpAnimation',

		deltaX: 0,
		deltaY: 0,

		updateCd: 0,
		updateCdMax: 1,

		direction: 1,
		speed: 2,

		duration: 3,
		durationCounter: 0,

		infinite: false,

		init: function (blueprint) {
			//Only allow one bumper at a time
			if (this.obj.components.some(c => c.type === this.type))
				return true;
		},

		update: function () {
			let deltaX = this.deltaX;
			if (deltaX < 0)
				this.obj.flipX = true;
			else if (deltaX > 0)
				this.obj.flipX = false;

			if (this.updateCd > 0) 
				this.updateCd--;
			else {
				this.obj.offsetX += (this.deltaX * this.direction * this.speed);
				this.obj.offsetY += (this.deltaY * this.direction * this.speed);

				this.updateCd = this.updateCdMax;
				this.durationCounter++;

				if (this.durationCounter === this.duration) {
					this.durationCounter = 0;
					this.direction *= -1;
					if ((this.direction === 1) && (!this.infinite))
						this.destroyed = true;
				}
			}

			this.obj.setSpritePosition();
		},

		destroy: function () {
			this.obj.offsetX = 0;
			this.obj.offsetY = 0;

			this.obj.setSpritePosition();

			effects.unregister(this);
		}
	};
});
