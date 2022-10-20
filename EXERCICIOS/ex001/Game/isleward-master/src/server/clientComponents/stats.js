define([
	'js/system/events',
	'js/rendering/renderer'
], function (
	events,
	renderer
) {
	const hpBarPadding = scaleMult;
	const hpBarHeight = scaleMult;

	return {
		type: 'stats',

		values: null,

		hpSprite: null,
		hpSpriteInner: null,

		init: function (blueprint) {
			if (this.obj.self)
				events.emit('onGetStats', this.values);

			if (this.obj.has('serverId'))
				events.emit('onGetPartyStats', this.obj.serverId, this.values);

			let obj = this.obj;

			this.hpSprite = renderer.buildRectangle({
				layerName: 'effects',
				x: obj.x * scale,
				y: obj.y * scale,
				w: 1,
				h: 1,
				color: 0x802343
			});

			this.hpSpriteInner = renderer.buildRectangle({
				x: 0,
				y: 0,
				w: 1,
				h: 1,
				layerName: 'effects',
				color: 0xd43346
			});

			this.updateHpSprite();
		},

		updateHpSprite: function () {
			const { obj: { x, y, dead, sprite } } = this;

			if (dead)
				return;

			//By default, hp sprites are 10px higher than the owner object's sprite. Keeping in
			// mind that bigger sprites always have their 'origin' in the bottom middle tile
			const spriteHeight = sprite ? sprite.height : scale;
			const spriteWidth = sprite ? sprite.width : scale;

			const xOffset = -(spriteWidth - scale) / 2;
			const yOffset = -(spriteHeight - scale) - (scaleMult * 2);

			const hpBarWidth = spriteWidth - (hpBarPadding * 2);

			const newX = (x * scale) + hpBarPadding + xOffset;
			const newY = (y * scale) + yOffset;

			renderer.moveRectangle({
				sprite: this.hpSprite,
				x: newX,
				y: newY,
				w: hpBarWidth,
				h: hpBarHeight
			});

			renderer.moveRectangle({
				sprite: this.hpSpriteInner,
				x: newX,
				y: newY,
				w: (this.values.hp / this.values.hpMax) * hpBarWidth,
				h: hpBarHeight
			});

			const isVisible = (this.values.hp < this.values.hpMax) && (!sprite || sprite.visible);

			this.hpSprite.visible = isVisible;
			this.hpSpriteInner.visible = isVisible;
		},

		extend: function (blueprint) {
			let bValues = blueprint.values || {};

			let values = this.values;

			for (let b in bValues) 
				values[b] = bValues[b];

			if (this.obj.self)
				events.emit('onGetStats', this.values, blueprint);

			if (this.obj.has('serverId'))
				events.emit('onGetPartyStats', this.obj.serverId, this.values);

			this.updateHpSprite();
		},

		destroy: function () {
			renderer.destroyObject({
				sprite: this.hpSprite,
				layerName: 'effects'
			});

			renderer.destroyObject({
				sprite: this.hpSpriteInner,
				layerName: 'effects'
			});
		}
	};
});
