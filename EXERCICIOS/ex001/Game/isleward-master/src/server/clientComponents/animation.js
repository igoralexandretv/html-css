define([
	'js/rendering/renderer'
], function (
	renderer
) {
	return {
		type: 'animation',

		frames: 4,
		frameDelay: 4,

		sheet: 'attacks',

		row: null,
		col: null,

		loop: 1,
		loopCounter: 0,

		frame: 0,

		frameDelayCd: 0,

		oldSheetName: null,
		oldCell: null,
		oldTexture: null,

		init: function (blueprint) {
			const { template, frameDelay, obj: { sheetName, cell, sprite } } = this;

			if (!sprite)
				return true;
			
			this.oldSheetName = sheetName;
			this.oldCell = cell;
			this.oldTexture = sprite.texture;

			this.frame = 0;
			this.frameDelayCd = 0;

			for (let p in template) 
				this[p] = template[p];

			this.frameDelayCd = frameDelay;

			this.setSprite();
		},

		setSprite: function () {
			renderer.setSprite({
				sprite: this.obj.sprite,
				cell: (this.row * 8) + this.col + this.frame,
				sheetName: this.spritesheet || this.sheet
			});
		},

		update: function () {
			if (this.frameDelayCd > 0)
				this.frameDelayCd--;
			else {
				this.frameDelayCd = this.frameDelay;
				this.frame++;
				if (this.frame === this.frames) {
					this.loopCounter++;
					if (this.loopCounter === this.loop) {
						this.destroyed = true;
						return;
					}
					this.frame = 0;
				}
			}

			this.setSprite();
		},

		destroy: function () {
			const { oldSheetName, oldCell, oldTexture, obj: { sheetName, cell, sprite } } = this;

			//Make sure something didn't happen while we were in animation form
			// that made us change sprite
			if (oldSheetName === sheetName && oldCell === cell) {
				sprite.texture = oldTexture;

				return;
			}

			renderer.setSprite({
				sprite,
				cell,
				sheetName
			});
		}
	};
});
