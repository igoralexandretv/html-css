define([
	'js/system/events',
	'js/rendering/renderer',
	'js/system/client',
	'js/input',
	'js/objects/objects'
], function (
	events,
	renderer,
	client,
	input,
	objects
) {
	return {
		type: 'mouseMover',

		hoverTile: {
			x: 0,
			y: 0
		},

		path: [],

		pathColor: 'rgba(255, 255, 255, 0.5)',

		mouseDown: false,
		opacityCounter: 0,

		sprite: null,

		init: function () {
			this.hookEvent('onUiHover', this.onUiHover.bind(this, true));
			this.hookEvent('onUiLeave', this.onUiHover.bind(this, false));

			this.sprite = renderer.buildObject({
				layerName: 'effects',
				x: 0,
				y: 0,
				sheetName: 'ui',
				cell: 7
			});
		},

		onUiHover: function (dunno, onUiHover) {
			if (this.sprite)
				this.sprite.visible = !onUiHover;
		},

		showPath: function (e) {
			if ((e.button !== null) && (e.button !== 0))
				return;

			let tileX = ~~(e.x / scale);
			let tileY = ~~(e.y / scale);

			if ((tileX === this.hoverTile.x) && (tileY === this.hoverTile.y))
				return;

			events.emit('onChangeHoverTile', tileX, tileY);

			this.hoverTile.x = ~~(e.x / scale);
			this.hoverTile.y = ~~(e.y / scale);

			this.sprite.x = (this.hoverTile.x * scale);
			this.sprite.y = (this.hoverTile.y * scale);
		},

		update: function () {
			this.opacityCounter++;
			if (this.sprite)
				this.sprite.alpha = 0.35 + Math.abs(Math.sin(this.opacityCounter / 20) * 0.35);
			this.showPath(input.mouse);
		},

		destroy: function () {
			renderer.destroyObject({
				sprite: this.sprite
			});

			this.unhookEvents();
		}
	};
});
