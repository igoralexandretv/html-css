define([
	'js/rendering/lightningBuilder',
	'js/rendering/effects'
], function (
	lightningBuilder,
	effects
) {
	return {
		type: 'lightningEffect',

		cd: 0,
		cdMax: 1,

		effect: null,

		ttl: 6,
		lineGrow: false,
		linePercentage: 0.1,

		lineShrink: false,
		shrinking: false,

		init: function () {
			effects.register(this);

			let xOffset = (this.toX >= this.obj.x) ? 1 : 0;

			let fromX = this.obj.x + xOffset;
			let fromY = this.obj.y + 0.5;

			let toX = this.lineGrow ? fromX : this.toX + 0.5;
			let toY = this.lineGrow ? fromY : this.toY + 0.5;

			this.effect = lightningBuilder.build({
				fromX: fromX,
				fromY: fromY,
				toX: toX,
				toY: toY,
				divisions: this.divisions,
				colors: this.colors,
				maxDeviate: this.maxDeviate
			});
		},

		renderManual: function () {
			let linePercentage = this.linePercentage;

			let cdMax = this.cdMax;
			if (((this.lineGrow) && (linePercentage < 1)) || ((this.shrinking) && (linePercentage > 0)))
				cdMax = 1;

			if (this.cd > 0) {
				this.cd--;
				return;
			}

			this.cd = cdMax;

			lightningBuilder.destroy(this.effect);
			this.effect = null;

			if (!this.shrinking) {
				this.ttl--;
				if (this.ttl === 0) {
					this.destroyed = true;
					return;
				}
			}

			let xOffset = (this.toX >= this.obj.x) ? 1 : 0;

			let fromX = this.obj.x + xOffset;
			let fromY = this.obj.y + 0.5;

			let toX = this.toX + 0.5;
			let toY = this.toY + 0.5;

			let changeTo = (
				(
					(this.lineGrow) && 
					(linePercentage < 1)
				) ||
				(
					(this.shrinking) &&
					(linePercentage > 0)
				)
			);

			if (changeTo) {
				if (this.shrinking) 
					linePercentage /= 1.5;
				else {
					linePercentage *= 1.5;
					if (linePercentage > 1)
						linePercentage = 1;
				}

				let angle = Math.atan2(toY - fromY, toX - fromX);
				let distance = Math.sqrt(Math.pow(fromX - toX, 2) + Math.pow(fromY - toY, 2));
				toX = fromX + (Math.cos(angle) * distance * linePercentage);
				toY = fromY + (Math.sin(angle) * distance * linePercentage);
			}

			this.effect = lightningBuilder.build({
				fromX: fromX,
				fromY: fromY,
				toX: toX,
				toY: toY,
				divisions: this.divisions,
				colors: this.colors,
				maxDeviate: this.maxDeviate
			});

			if ((this.shrinking) && (linePercentage < 0.1))
				this.destroyed = true;

			this.linePercentage = linePercentage;
		},

		destroyManual: function () {
			if ((!this.lineShrink) || (this.shrinking)) {
				if (this.effect)
					lightningBuilder.destroy(this.effect);

				//effects.unregister(this);
				return;
			}

			this.destroyed = false;
			this.shrinking = true;

			return true;
		}
	};
});
