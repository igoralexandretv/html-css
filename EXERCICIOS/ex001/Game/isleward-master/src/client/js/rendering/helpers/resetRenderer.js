define([
	'js/rendering/spritePool'
], function (
	spritePool
) {
	return function () {
		let map = this.map;
		let w = this.w = map.length;
		let h = this.h = map[0].length;

		this.stage.removeChild(this.layers.hiders);
		this.layers.hiders = new PIXI.Container();
		this.layers.hiders.layer = 'hiders';
		this.stage.addChild(this.layers.hiders);

		let container = this.layers.tileSprites;
		this.stage.removeChild(container);

		this.layers.tileSprites = container = new PIXI.Container();
		container.layer = 'tiles';
		this.stage.addChild(container);

		this.stage.children.sort((a, b) => {
			if (a.layer === 'hiders')
				return 1;
			else if (b.layer === 'hiders')
				return -1;
			else if (a.layer === 'tiles')
				return -1;
			else if (b.layer === 'tiles')
				return 1;
			return 0;
		});

		spritePool.clean();

		this.sprites = _.get2dArray(w, h, 'array');

		this.map = [];
		this.w = 0;
		this.h = 0;

		delete this.moveTo;
	};
});
