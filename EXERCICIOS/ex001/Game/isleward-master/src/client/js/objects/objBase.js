define([
	'js/components/components',
	'js/rendering/renderer',
	'js/system/events',
	'js/config'
], function (
	components,
	renderer,
	events,
	config
) {
	return {
		components: [],
		offsetX: 0,
		offsetY: 0,
		eventCallbacks: {},

		addComponent: function (type, options) {
			let c = this[type];

			if (!c || options.new) {
				const template = components.getTemplate(type);
				if (!template)
					return;

				c = $.extend(true, {}, template);
				c.obj = this;

				for (let o in options) 
					c[o] = options[o];

				//Only use component to initialize other components?
				if (c.init && c.init(options))
					return null;

				this[c.type] = c;
				this.components.push(c);

				return c;
			} 
			if (c.extend)
				c.extend(options);

			return c;
		},

		removeComponent: function (type) {
			let cpn = this[type];
			if (!cpn)
				return;

			this.components.spliceWhere(c => {
				return c === cpn;
			});

			delete this[type];
		},

		update: function () {
			const oComponents = this.components;
			let len = oComponents.length;
			for (let i = 0; i < len; i++) {
				const c = oComponents[i];
				if (c.update)
					c.update();

				if (c.destroyed) {
					if (c.destroy)
						c.destroy();

					oComponents.splice(i, 1);
					i--;
					len--;
					delete this[c.type];
				}
			}
		},

		on: function (eventName, callback) {
			let list = this.eventCallbacks[eventName] || (this.eventCallbacks[eventName] = []);
			list.push(events.on(eventName, callback));
		},

		setSpritePosition: function () {
			const { sprite, chatter, stats, x, y } = this;

			if (!sprite)
				return;

			renderer.setSpritePosition(this);

			['nameSprite', 'chatSprite'].forEach((s, i) => {
				const subSprite = this[s];
				if (!subSprite)
					return;

				let yAdd = scale;
				if (i === 1) {
					yAdd *= -0.8;
					yAdd -= (chatter.msg.split('\r\n').length - 1) * scale * 0.8;
				}

				subSprite.x = (x * scale) + (scale / 2) - (subSprite.width / 2);
				subSprite.y = (y * scale) + yAdd;
			});

			if (stats)
				stats.updateHpSprite();
		},

		updateVisibility: function () {
			const { x, y, hidden, isVisible } = this;

			const vis = (
				!hidden &&
				(
					this.self ||
					(
						renderer.sprites[x] &&
						renderer.sprites[x][y] &&
						renderer.sprites[x][y].length > 0 &&
						!renderer.isHidden(x, y)
					)
				)
			);

			if (vis === isVisible)
				return;

			this.isVisible = vis;
			this.setVisible(vis);
		},

		setVisible: function (visible) {
			if (this.sprite)
				this.sprite.visible = visible;

			if (this.nameSprite)
				this.nameSprite.visible = (visible && config.showNames);

			if (!visible && this.stats && this.stats.hpSprite && this.stats.hpSprite.visible) {
				this.stats.hpSprite.visible = false;
				this.stats.hpSpriteInner.visible = false;
			}

			this.components.forEach(c => {
				if (c.setVisible)
					c.setVisible(visible);
			});
		},

		destroy: function () {
			if (this.sprite)
				renderer.destroyObject(this);
			if (this.nameSprite) {
				renderer.destroyObject({
					layerName: 'effects',
					sprite: this.nameSprite
				});
			}

			const oComponents = this.components;
			const cLen = oComponents.length;
			for (let i = 0; i < cLen; i++) {
				const c = oComponents[i];
				if (c.destroy)
					c.destroy();
			}

			this.destroyed = true;

			this.offEvents();
		},

		offEvents: function () {
			if (this.pather)
				this.pather.resetPath();

			for (let e in this.eventCallbacks)
				this.eventCallbacks[e].forEach(c => events.off(e, c));
		}
	};
});
