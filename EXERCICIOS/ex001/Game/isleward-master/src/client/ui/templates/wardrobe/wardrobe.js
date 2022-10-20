define([
	'js/system/events',
	'js/system/client',
	'html!ui/templates/wardrobe/template',
	'css!ui/templates/wardrobe/styles'
], function (
	events,
	client,
	template,
	styles
) {
	return {
		tpl: template,

		centered: true,

		modal: true,
		hasClose: true,

		skin: null,
		wardrobeId: null,

		postRender: function () {
			this.onEvent('onGetWardrobeSkins', this.onGetWardrobeSkins.bind(this));
			this.onEvent('onCloseWardrobe', this.hide.bind(this));

			this.on('.btnCancel', 'click', this.hide.bind(this));
			this.on('.btnApply', 'click', this.apply.bind(this));
		},

		onGetWardrobeSkins: function (msg) {
			let list = msg.skins;
			this.wardrobeId = msg.id;

			let container = this.find('.list').empty();

			list.forEach(function (l) {
				let html = '<div class="skinName">' + l.name + '</div>';

				let el = $(html)
					.appendTo(container);

				el.on('click', this.setPreview.bind(this, l, el));
				el.on('click', events.emit.bind(events, 'onClickListItem'));

				if (l.id === window.player.skinId) {
					el.addClass('current');
					this.setPreview(l, el);
				}
			}, this);

			this.show();
		},

		setPreview: function (skin, el) {
			this.find('.active').removeClass('active');

			el.addClass('active');

			this.skin = skin;

			let costume = skin.sprite.split(',');
			let spriteX = -costume[0] * 8;
			let spriteY = -costume[1] * 8;

			let spritesheet = skin.spritesheet || '../../../images/characters.png';

			this.find('.sprite')
				.css('background', 'url("' + spritesheet + '") ' + spriteX + 'px ' + spriteY + 'px');
		},

		apply: function () {
			client.request({
				cpn: 'player',
				method: 'performAction',
				data: {
					cpn: 'wardrobe',
					method: 'apply',
					data: {
						skinId: this.skin.id,
						targetId: this.wardrobeId
					}
				}
			});
		}
	};
});
