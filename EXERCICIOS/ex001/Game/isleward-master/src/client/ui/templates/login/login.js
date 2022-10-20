define([
	'js/system/events',
	'js/system/client',
	'ui/factory',
	'html!ui/templates/login/template',
	'css!ui/templates/login/styles',
	'js/rendering/renderer',
	'js/system/globals'
], function (
	events,
	client,
	uiFactory,
	template,
	styles,
	renderer,
	globals
) {
	return {
		tpl: template,
		centered: true,

		beforeRender: function () {
			const { clientConfig: { logoPath } } = globals;
			if (!logoPath)
				return;

			const tempEl = $(this.tpl);
			tempEl.find('.logo').attr('src', logoPath);

			this.tpl = tempEl.prop('outerHTML');
		},

		postRender: function () {
			this.onEvent('onHandshake', this.onHandshake.bind(this));

			this.on('.btnLogin', 'click', this.onLoginClick.bind(this));
			this.on('.btnRegister', 'click', this.onRegisterClick.bind(this));

			this.find('.extra, .version')
				.appendTo($('<div class="uiLoginExtra"></div>')
					.appendTo('.ui-container'));

			$('.uiLoginExtra').find('.btn').on('click', this.redirect.bind(this));

			$('.news, .version').on('click', this.redirect.bind(this));

			this.find('input')
				.on('keyup', this.onKeyDown.bind(this))
				.eq(0).focus();

			renderer.buildTitleScreen();
		},

		redirect: function (e) {
			let currentLocation = $(e.currentTarget).attr('location');
			window.open(currentLocation, '_blank');
		},

		onKeyDown: function (e) {
			if (e.keyCode === 13)
				this.onLoginClick();
		},
		onHandshake: function () {
			this.show();
		},

		onLoginClick: function () {		
			if (this.el.hasClass('disabled'))
				return;

			this.el.addClass('disabled');

			client.request({
				cpn: 'auth',
				method: 'login',
				data: {
					username: this.val('.txtUsername'),
					password: this.val('.txtPassword')
				},
				callback: this.onLogin.bind(this)
			});
		},
		onLogin: function (res) {
			this.el.removeClass('disabled');

			if (!res) {
				uiFactory.preload();

				$('.uiLoginExtra').remove();
				this.destroy();
			} else
				this.el.find('.message').html(res);
		},

		onRegisterClick: function () {
			this.el.addClass('disabled');

			client.request({
				cpn: 'auth',
				method: 'register',
				data: {
					username: this.val('.txtUsername'),
					password: this.val('.txtPassword')
				},
				callback: this.onLogin.bind(this)
			});
		}
	};
});
