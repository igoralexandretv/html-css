define([
	'js/system/events',
	'html!ui/templates/mainMenu/template',
	'css!ui/templates/mainMenu/styles',
	'js/rendering/renderer',
	'ui/factory',
	'js/objects/objects',
	'js/system/client',
	'js/sound/sound'
], function (
	events,
	template,
	styles,
	renderer,
	factory,
	objects,
	client,
	sound
) {
	return {
		tpl: template,

		modal: true,

		hasClose: true,

		postRender: function () {
			this.onEvent('onCloseOptions', this.show.bind(this));
			this.onEvent('onShowMainMenu', this.show.bind(this));

			this.el.find('.btnOptions').on('click', this.openOptions.bind(this));
			this.el.find('.btnCharSelect').on('click', this.charSelect.bind(this));
			this.el.find('.btnLogOut').on('click', this.logOut.bind(this));
			this.el.find('.btnPatreon').on('click', this.patreon.bind(this));

			this.onEvent('onResize', this.onResize.bind(this));
		},

		openOptions: function () {
			if (isMobile)
				this.el.removeClass('active');

			events.emit('onOpenOptions');
		},
		
		patreon: function () {
			window.open('https://patreon.com/bigbadwaffle', '_blank');
		},

		charSelect: function () {
			this.el.addClass('disabled');

			client.request({
				module: 'cons',
				method: 'unzone',
				callback: this.onCharSelect.bind(this)
			});
		},

		onCharSelect: function () {
			events.emit('destroyAllObjects');
			events.emit('resetRenderer');
			events.emit('resetPhysics');

			renderer.buildTitleScreen();
			sound.unload();

			events.emit('onShowCharacterSelect');

			factory.exitGame();

			factory.build('characters', {});
		},

		onResize: function () {
			let isFullscreen = (window.innerHeight === screen.height);
			if (isFullscreen)
				this.el.find('.btnScreen').html('Windowed');
			else
				this.el.find('.btnScreen').html('Fullscreen');
		},

		onAfterShow: function () {
			this.onResize();
		},

		beforeHide: function () {
			this.onResize();
		},

		logOut: function () {
			window.location = window.location;
		},

		onKeyDown: function (key) {
			if (key === 'esc')
				this.toggle();
		}
	};
});
