define([
	'js/system/events',
	'html!ui/templates/middleHud/template',
	'css!ui/templates/middleHud/styles'
], function (
	events,
	template,
	styles
) {
	return {
		tpl: template,

		postRender: function () {
			this.onEvent('onGetSelfCasting', this.onGetCasting.bind(this));

			if (isMobile) {
				this.onEvent('onGetServerActions', this.onGetServerActions.bind(this));

				this.find('.btnGather').on('click', this.gather.bind(this));
			}
		},

		onGetCasting: function (casting) {
			let el = this.find('.casting');

			if ((casting === 0) || (casting === 1))
				el.hide();
			else {
				el
					.show()
					.find('.bar')
					.width((casting * 100) + '%');
			}
		},

		gather: function () {
			let btn = this.find('.btnGather');
			let action = btn.data('action');
			if (action) {
				//Server actions use keyUp
				events.emit('onKeyUp', action.key);
			} else
				events.emit('onKeyDown', 'g');
		},

		onGetServerActions: function (actions) {
			let btn = this.find('.btnGather').hide().data('action', null);

			let firstAction = actions[0];
			if (!firstAction)
				return;

			btn
				.data('action', firstAction)
				.show();
		}
	};
});
