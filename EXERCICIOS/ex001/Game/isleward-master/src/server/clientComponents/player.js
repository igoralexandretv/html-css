define([
	'js/rendering/renderer',
	'js/system/events',
	'js/misc/physics',
	'js/sound/sound'
], function (
	renderer,
	events,
	physics,
	sound
) {
	return {
		type: 'player',

		oldPos: {
			x: 0,
			y: 0
		},

		init: function () {
			const obj = this.obj;

			obj.addComponent('keyboardMover');
			obj.addComponent('mouseMover');

			if (isMobile)
				obj.addComponent('touchMover');

			obj.addComponent('serverActions');
			obj.addComponent('pather');

			this.hookEvent('teleportToPosition', this.teleportToPosition.bind(this));

			events.emit('onGetPortrait', obj.portrait);
		},

		extend: function (blueprint) {
			const { collisionChanges, mapChanges } = blueprint;
			delete blueprint.collisionChanges;
			delete blueprint.mapChanges;

			if (collisionChanges)
				collisionChanges.forEach(c => physics.setCollision(c));

			if (mapChanges) {
				mapChanges.forEach(({ x, y, mapCellString }) => {
					renderer.updateMapAtPosition(x, y, mapCellString);
				});
			}
		},

		update: function () {
			const obj = this.obj;
			const x = obj.x;
			const y = obj.y;

			let oldPos = this.oldPos;

			if ((oldPos.x === x) && (oldPos.y === y))
				return;

			oldPos.x = x;
			oldPos.y = y;

			sound.update(x, y);

			this.positionCamera(x, y);
		},

		positionCamera: function (x, y, instant) {
			renderer.setPosition({
				x: (x - (renderer.width / (scale * 2))) * scale,
				y: (y - (renderer.height / (scale * 2))) * scale
			}, instant);
		},

		teleportToPosition: function ({ x, y }) {
			this.positionCamera(x, y, true);
			sound.update(x, y);
		},

		destroy: function () {
			this.unhookEvents();
		}
	};
});
