define([
	'js/rendering/renderer',
	'js/system/events'
], function (
	renderer,
	events
) {
	const auras = {
		reflectDamage: 0,
		stealth: 1,
		regenHp: 9,
		regenMana: 10,
		swiftness: 11,
		holyVengeance: 8,
		rare: 16
	};
	const buffIcons = {
		regenHp: [3, 1],
		regenMana: [4, 1],
		swiftness: [5, 1],
		stealth: [7, 0],
		reflectDamage: [2, 1],
		holyVengeance: [4, 0]
	};

	let templates = {};

	Object.keys(auras).forEach(type => {
		let cell = auras[type];

		templates[type] = {
			sprite: null,

			alpha: 0,
			alphaDir: 0.0025,

			alphaMax: 0.6,
			alphaMin: 0.35,

			alphaCutoff: 0.4,
			
			init: function () {
				this.sprite = renderer.buildObject({
					layerName: 'effects',
					sheetName: 'auras',
					x: this.obj.x,
					y: this.obj.y + 1,
					w: scale * 3,
					h: scale * 3,
					cell: cell
				});

				this.defaultDamageText();

				if (this.self && buffIcons[type]) {
					events.emit('onGetEffectIcon', {
						id: this.id,
						icon: buffIcons[type]
					});
				}
			},

			getAlpha: function () {
				let listAuras = this.obj.effects.effects.filter(e => auras[e.type]);
				let first = listAuras[0];

				// The first aura in the list should do all the updating so that all auras pulse together
				if (first === this) {
					this.alpha += this.alphaDir;
					if ((this.alphaDir > 0) && (this.alpha >= this.alphaMax)) {
						this.alpha = this.alphaMax;
						this.alphaDir *= -1;
					} else if ((this.alphaDir < 0) && (this.alpha <= this.alphaMin)) {
						this.alpha = this.alphaMin;
						this.alphaDir *= -1;
					}
				} else {
					this.alpha = first.alpha;
					this.alphaDir = first.alphaDir;
				}				

				let useAlpha = this.alpha;
				if (useAlpha < this.alphaCutoff)
					useAlpha = 0;
				else {
					useAlpha -= this.alphaCutoff;
					useAlpha /= (this.alphaMax - this.alphaCutoff);
				}

				return useAlpha;
			},

			update: function () {
				let useAlpha = this.getAlpha();

				let x = this.obj.x;
				let y = this.obj.y;

				renderer.setSpritePosition({
					x,
					y: y + 1,
					sprite: this.sprite
				});

				this.sprite.alpha = useAlpha;

				this.sprite.visible = this.obj.isVisible;
			},

			destroy: function () {
				renderer.destroyObject({
					layerName: 'effects',
					sprite: this.sprite
				});

				this.defaultDamageText(true);

				if (this.self && buffIcons[type]) {
					events.emit('onRemoveEffectIcon', {
						id: this.id
					});
				}
			},

			setVisible: function (visible) {
				this.sprite.visible = visible;
			}
		};
	});

	return {
		templates: {
			...templates
		}
	};
});
