define([
	'html!ui/templates/messages/tplTab'
], function (
	tplTab
) {
	const extensionObj = {
		renderKeyboard: function () {
			this.find('.keyboard').remove();

			let mainContainer = this.find('.main');

			let container = $('<div class="keyboard"></div>')
				.appendTo(mainContainer);

			let keyboard = {
				0: 'qwertyuiop|asdfghjkl|zxcvbnm',
				1: 'QWERTYUIOP|ASDFGHJKL|ZXCVBNM',
				2: '1234567890|@#&*-+=()|_$"\';/'
			}[this.kbUpper].split('');

			//Hacky: Insert control characters in correct positions
			//Backspace goes after 'm'
			if (this.kbUpper === 0) {
				keyboard.splice(keyboard.indexOf('z'), 0, 'caps');
				keyboard.splice(keyboard.indexOf('m') + 1, 0, '<<');
			} else if (this.kbUpper === 1) {
				keyboard.splice(keyboard.indexOf('Z'), 0, 'caps');
				keyboard.splice(keyboard.indexOf('M') + 1, 0, '<<');
			} else if (this.kbUpper === 2) 
				keyboard.splice(keyboard.indexOf('/') + 1, 0, '<<');

			keyboard.push(...['|', '123', ',', 'space', '.', 'send']);

			let row = 0;
			keyboard.forEach(k => {
				if (k === '|') {
					row++;

					const postGapCount = row === 4 ? 0 : row - 1;
					for (let i = 0; i < postGapCount; i++) 
						$('<div class="gap" />').appendTo(container);
					
					$('<div class="newline" />').appendTo(container);
					
					const preGapCount = row === 3 ? 0 : row;
					for (let i = 0; i < preGapCount; i++) 
						$('<div class="gap" />').appendTo(container);

					return;	
				}

				let className = (k.length === 1) ? 'key' : 'key special';
				if (k === ' ') {
					k = '.';
					className = 'key hidden';
				}

				className += ' ' + k;

				let elKey = $(`<div class="${className}">${k}</div>`)
					.appendTo(container);

				if (!className.includes('hidden')) 	
					elKey.on('click', this.clickKey.bind(this, k));
			});
		},

		clickKey: function (key) {
			window.navigator.vibrate(20);

			let elInput = this.find('input');

			const handler = {
				caps: () => {
					this.kbUpper = (this.kbUpper + 1) % 2;
					this.renderKeyboard();
				},

				123: () => {
					this.kbUpper = (this.kbUpper === 2) ? 0 : 2;
					this.renderKeyboard();
				},

				space: () => this.clickKey(' '),

				'<<': () => {
					elInput.val(elInput.val().slice(0, -1));
					this.find('.input').html(elInput.val());
				},

				send: () => {
					this.sendChat({ which: 13 });
					this.find('.input').html('');
					this.find('input').val('');
				}
			}[key];
			if (handler) {
				handler();
				return;
			}

			elInput.val(elInput.val() + key);
			this.enforceMaxMsgLength();

			this.find('.input').html(elInput.val());
		}
	};

	return {
		init: function () {
			$.extend(this, extensionObj);

			this.kbUpper = 0;

			this.el.on('click', this.toggle.bind(this, true));
			this.renderKeyboard();

			$(tplTab)
				.appendTo(this.find('.filters'))
				.addClass('btnClose')
				.html('x')
				.on('click', this.toggle.bind(this, false, true));
		}
	};
});
