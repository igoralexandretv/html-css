define([
	'js/system/events',
	'js/rendering/renderer'
], function (
	events,
	renderer
) {
	return {
		axes: {
			horizontal: {
				negative: ['left', 'a', 'q', 'z'],
				positive: ['right', 'd', 'e', 'c']
			},
			vertical: {
				negative: ['up', 'w', 'q', 'e'],
				positive: ['down', 's', 'x', 'z', 'c']
			}
		},

		//Certain keys should always register even if they don't get emitted
		modifiers: [
			'shift', 'ctrl'
		],

		numericalKeyCodeMappings: {
			Digit1: 49,
			Digit2: 50,
			Digit3: 51,
			Digit4: 52,
			Digit5: 53
		},

		mappings: {
			8: 'backspace',
			9: 'tab',
			13: 'enter',
			16: 'shift',
			17: 'ctrl',
			27: 'esc',
			37: 'left',
			38: 'up',
			39: 'right',
			40: 'down',
			46: 'del',

			//hacks for mac cmd key
			224: 'ctrl',
			91: 'ctrl',
			93: 'ctrl'
		},

		mouse: {
			button: null,
			x: 0,
			y: 0
		},
		mouseRaw: null,

		keys: {},

		enabled: true,

		blacklistedKeys: [],
		whitelistedKeys: [],

		init: function () {
			$(window).on('keydown', this.events.keyboard.keyDown.bind(this));
			$(window).on('keyup', this.events.keyboard.keyUp.bind(this));
			events.on('onSceneMove', this.events.mouse.mouseMove.bind(this));

			$('.ui-container')
				.on('mousedown', this.events.mouse.mouseDown.bind(this))
				.on('mouseup', this.events.mouse.mouseUp.bind(this))
				.on('mousemove', this.events.mouse.mouseMove.bind(this))
				.on('touchstart', this.events.touch.touchStart.bind(this))
				.on('touchmove', this.events.touch.touchMove.bind(this))
				.on('touchend', this.events.touch.touchEnd.bind(this))
				.on('touchcancel', this.events.touch.touchCancel.bind(this));

			if (isMobile)
				require(['plugins/shake.js'], this.onLoadShake.bind(this));
		},

		blacklistKeys: function (list) {
			this.blacklistedKeys.push(...list);
		},

		unBlacklistKeys: function (list) {
			this.blacklistedKeys.spliceWhere(d => list.includes(d));
		},

		whitelistKeys: function (list) {
			this.whitelistedKeys.push(...list);
		},

		unWhitelistKeys: function (list) {
			this.whitelistedKeys.spliceWhere(d => list.includes(d));
		},

		onLoadShake: function (shake) {
			let shaker = new shake({
				threshold: 5,
				timeout: 1000
			});

			shaker.start();
			window.addEventListener('shake', this.events.mobile.onShake.bind(this), false);
		},

		resetKeys: function () {
			for (let k in this.keys)
				events.emit('onKeyUp', k);

			this.keys = {};
		},

		getMapping: function (charCode) {
			if (charCode >= 97)
				return (charCode - 96).toString();

			return (
				this.mappings[charCode] ||
				String.fromCharCode(charCode).toLowerCase()
			);
		},

		isKeyDown: function (key, noConsume) {
			if (this.keys.has(key)) {
				if (noConsume)
					return true;

				let down = this.keys[key];

				this.keys[key] = 2;
				return (down === 1);
			} return false;
		},
		getAxis: function (axisName) {
			let axis = this.axes[axisName];
			if (!axis)
				return 0;

			let result = 0;

			for (let i = 0; i < axis.negative.length; i++) {
				if (this.keys[axis.negative[i]]) {
					result--;
					break;
				}
			}

			for (let i = 0; i < axis.positive.length; i++) {
				if (this.keys[axis.positive[i]]) {
					result++;
					break;
				}
			}

			return result;
		},

		isKeyAllowed: function (key) {
			const result = (
				key.length > 1 ||
				this.whitelistedKeys.includes(key) ||
				(
					!this.blacklistedKeys.includes(key) &&
					!this.blacklistedKeys.includes('*')
				)
			);

			return result;
		},

		events: {
			keyboard: {
				/* eslint-disable-next-line max-lines-per-function */
				keyDown: function (e) {
					if (!this.enabled)
						return;

					let code = this.numericalKeyCodeMappings[e.code] || e.which;
					let key = this.getMapping(code);
					let isModifier = this.modifiers.indexOf(key) > -1;
					let isBody = e.target === document.body;

					if (!isModifier && !isBody)
						return true;
					if ((e.keyCode === 9) || (e.keyCode === 8) || (e.keyCode === 122))
						e.preventDefault();

					if (!this.isKeyAllowed(key))
						return;

					if (this.keys.has(key))
						this.keys[key] = 2;
					else {
						this.keys[key] = 1;

						if (isBody || isModifier) {
							let keyEvent = {
								key: key,
								consumed: false
							};
							events.emit('onUiKeyDown', keyEvent);
							if (!keyEvent.consumed)
								events.emit('onCanvasKeyDown', keyEvent);
							events.emit('onKeyDown', key);
						}
					}

					if (key === 'backspace')
						return false;
					else if (e.key === 'F11')
						events.emit('onToggleFullscreen');
				},
				keyUp: function (e) {
					if (!this.enabled)
						return;

					let key = this.getMapping(e.which);
					let isModifier = this.modifiers.indexOf(key) > -1;
					let isBody = e.target === document.body;

					if (!isModifier && !isBody)
						return;

					delete this.keys[key];

					events.emit('onKeyUp', key);
				}
			},

			mouse: {
				mouseDown: function (e) {
					let el = $(e.target);
					if ((!el.hasClass('ui-container')) || (el.hasClass('blocking')))
						return;

					let button = e.button;
					this.mouse.button = button;
					this.mouse.down = true;
					this.mouse.event = e;

					//This is needed for casting targetted spells on Mobile...it's hacky.
					this.mouse.worldX = e.pageX + renderer.pos.x;
					this.mouse.worldY = e.pageY + renderer.pos.y;

					events.emit('mouseDown', this.mouse);
				},
				mouseUp: function (e) {
					let el = $(e.target);
					if ((!el.hasClass('ui-container')) || (el.hasClass('blocking')))
						return;

					this.mouse.button = null;
					this.mouse.down = false;

					events.emit('mouseUp', this.mouse);
				},
				mouseMove: function (e) {
					if (e)
						this.mouseRaw = e;
					else
						e = this.mouseRaw;

					if (!e)
						return;

					let el = $(e.target);
					if ((!el.hasClass('ui-container')) || (el.hasClass('blocking')))
						return;

					this.mouse.x = e.offsetX + renderer.pos.x;
					this.mouse.y = e.offsetY + renderer.pos.y;
				}
			},

			touch: {
				touchStart: function (e) {
					let el = $(e.target);
					if ((!el.hasClass('ui-container')) || (el.hasClass('blocking')))
						return;

					let touch = e.touches[0];
					events.emit('onTouchStart', {
						x: touch.clientX,
						y: touch.clientY,
						worldX: touch.clientX + renderer.pos.x,
						worldY: touch.clientY + renderer.pos.y
					});
				},

				touchMove: function (e) {
					let el = $(e.target);
					if ((!el.hasClass('ui-container')) || (el.hasClass('blocking')))
						return;

					let touch = e.touches[0];
					events.emit('onTouchMove', {
						x: touch.clientX,
						y: touch.clientY,
						touches: e.touches.length
					});
				},

				touchEnd: function (e) {
					let el = $(e.target);
					if ((!el.hasClass('ui-container')) || (el.hasClass('blocking')))
						return;

					events.emit('onTouchEnd');
				},

				touchCancel: function (e) {
					let el = $(e.target);
					if ((!el.hasClass('ui-container')) || (el.hasClass('blocking')))
						return;

					events.emit('onTouchCancel');
				}
			},

			mobile: {
				onShake: function (e) {
					events.emit('onShake', e);
				}
			}
		}
	};
});
