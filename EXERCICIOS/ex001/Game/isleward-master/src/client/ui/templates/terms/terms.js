define([
	'ui/factory',
	'html!ui/templates/terms/template',
	'css!ui/templates/terms/styles',
	'js/system/globals',
	'js/system/browserStorage'
], function (
	uiFactory,
	template,
	styles,
	globals,
	browserStorage
) {
	return {
		tpl: template,
		centered: true,

		postRender: function () {
			const { clientConfig: { tos: { content, version } } } = globals;
			const morphedContent = content.split('\n').join('<br />');

			const elHeading = this.find('.heading');
			elHeading.html(`${elHeading.html()} (v${version})`);

			this.find('.content').html(morphedContent);

			this.find('.btnDecline').on('click', this.onDeclineClick.bind(this));
			this.find('.btnAccept').on('click', this.onAcceptClick.bind(this, version));
		},

		onDeclineClick: function () {
			browserStorage.set('tos_accepted_version', null);
			window.location = window.location;
		},

		onAcceptClick: function (version) {
			browserStorage.set('tos_accepted_version', version);
			this.destroy();

			uiFactory.build('characters');
		}
	};
});
