define([
	'js/system/events',
	'html!ui/templates/menu/template',
	'css!ui/templates/menu/styles'
], function (
	events,
	template,
	styles
) {
	return {
		tpl: template,
		postRender: function () {
			if (isMobile) {
				this.el.on('click', this.toggleButtons.bind(this));
				this.find('.btnCollapse').on('click', this.toggleButtons.bind(this));
			}

			this.find('.btnHelp').on('click', this.handler.bind(this, 'onShowHelp'));
			this.find('.btnInventory').on('click', this.handler.bind(this, 'onShowInventory'));
			this.find('.btnEquipment').on('click', this.handler.bind(this, 'onShowEquipment'));
			this.find('.btnOnline').on('click', this.handler.bind(this, 'onShowOnline'));
			this.find('.btnLeaderboard').on('click', this.handler.bind(this, 'onShowLeaderboard'));
			this.find('.btnReputation').on('click', this.handler.bind(this, 'onShowReputation'));
			this.find('.btnMainMenu').on('click', this.handler.bind(this, 'onShowMainMenu'));
			this.find('.btnPassives').on('click', this.handler.bind(this, 'onShowPassives'));

			this.onEvent('onGetPassivePoints', this.onGetPassivePoints.bind(this));
		},

		handler: function (e) {
			if (isMobile)
				this.el.removeClass('active');

			events.emit(e);

			return false;
		},

		onGetPassivePoints: function (points) {
			let el = this.find('.btnPassives .points');
			el
				.html('')
				.hide();

			if (points > 0) {
				el
					.html(points)
					.show();
			}
		},

		toggleButtons: function (e) {
			this.el.toggleClass('active');
			e.stopPropagation();
		}
	};
});
