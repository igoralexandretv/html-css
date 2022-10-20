define([
	'js/system/events',
	'js/system/client',
	'html!ui/templates/dialogue/template',
	'css!ui/templates/dialogue/styles'
], function (
	events,
	client,
	template,
	styles
) {
	return {
		tpl: template,
		text: [],

		centeredX: true,

		postRender: function () {
			this.onEvent('onGetDialogue', this.onGetDialogue.bind(this));
			this.onEvent('onRemoveDialogue', this.onRemoveDialogue.bind(this));
		},

		onGetDialogue: function (msg) {
			if (isMobile && msg.msg.includes('(U to'))
				return;

			this.text.spliceWhere(function (t) {
				return (t.src === msg.src);
			});

			this.text.push(msg);
			this.setText();
		},

		onRemoveDialogue: function (msg) {
			this.text.spliceWhere(function (t) {
				return (t.src === msg.src);
			});

			this.setText();
		},

		setText: function () {
			let text = '';
			for (let i = 0; i < this.text.length; i++) {
				let t = this.text[i];

				text += t.msg;
				if (i < this.text.length - 1)
					text += '<br /><hr>';
			}
			
			this.find('.textBox').html(text);

			if (text !== '') 
				this.show();
			
			else
				this.hide();
		}
	};
});
