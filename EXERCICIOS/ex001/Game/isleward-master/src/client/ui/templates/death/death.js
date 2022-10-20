define([
	'js/system/events',
	'js/system/client',
	'html!ui/templates/death/template',
	'css!ui/templates/death/styles'
], function (
	events,
	client,
	template,
	styles
) {
	return {
		tpl: template,

		modal: true,
		centered: true,

		postRender: function () {
			this.onEvent('onDeath', this.onDeath.bind(this));
			this.onEvent('onPermadeath', this.onPermadeath.bind(this));

			this.find('.btn-logout').on('click', this.onLogout.bind(this));
			this.find('.btn-respawn').on('click', this.performRespawn.bind(this));
		},

		onLogout: function () {
			$('.uiMainMenu').data('ui').charSelect();
		},

		performRespawn: function () {
			events.emit('onHideOverlay', this.el);
			this.hide(true);

			client.request({
				cpn: 'player',
				method: 'performAction',
				data: {
					cpn: 'stats',
					method: 'respawn',
					data: {}
				}
			});
		},

		hide: function (force) {
			if (!force)
				return;

			this.shown = false;
			this.el.hide();
		},

		doShow: function () {
			this.show();
			events.emit('onShowOverlay', this.el);
		},

		onDeath: function (eventObj) {
			if (!eventObj.source) 
				this.find('.msg').html('you are dead');
			else
				this.find('.msg').html('you were killed by [ <div class="inner">' + eventObj.source + '</div> ]');
			this.find('.penalty')
				.html('you lost ' + eventObj.xpLoss + ' experience')
				.show();

			if (!eventObj.xpLoss)
				this.find('.penalty').hide();

			this.el.removeClass('permadeath');
			this.doShow();
		},

		onPermadeath: function (eventObj) {
			this.find('.msg').html('you were killed by [ <div class="inner">' + eventObj.source + '</div> ]');
			this.el.addClass('permadeath');
			this.doShow();
		}
	};
});
