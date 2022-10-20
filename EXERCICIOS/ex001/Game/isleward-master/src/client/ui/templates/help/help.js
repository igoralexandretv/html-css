define([
	'js/system/events',
	'html!ui/templates/help/template',
	'css!ui/templates/help/styles'
], function (
	events,
	template,
	styles
) {
	return {
		tpl: template,

		modal: true,
		hasClose: true,

		isFlex: true,

		postRender: function () {
			this.onEvent('onKeyDown', this.onKeyDown.bind(this));
			this.onEvent('onShowHelp', this.toggle.bind(this));

			this.on('.toslink', 'click', this.redirect.bind(this));
		},

		onKeyDown: function (key) {
			if (key === 'h') 
				this.toggle();
		},

		redirect: function (e) {
			let currentLocation = $(e.currentTarget).attr('location');
			window.open(currentLocation, '_blank');
		}
	};
});
