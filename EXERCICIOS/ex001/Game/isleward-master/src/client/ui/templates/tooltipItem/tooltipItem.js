define([
	'ui/templates/tooltipItem/buildTooltip/buildTooltip',
	'css!ui/templates/tooltipItem/styles',
	'html!ui/templates/tooltipItem/template',
	'js/system/events'
], function (
	buildTooltip,
	styles,
	template,
	events
) {
	return {
		tpl: template,
		type: 'tooltipItem',

		tooltip: null,
		item: null,

		postRender: function () {
			this.tooltip = this.el.find('.tooltip');

			this.onEvent('onShowItemTooltip', this.onShowItemTooltip.bind(this));
			this.onEvent('onHideItemTooltip', this.onHideItemTooltip.bind(this));
		},

		showWorth: function (canAfford) {
			this.tooltip.find('.worth').show();

			if (!canAfford)
				this.tooltip.find('.worth').addClass('no-afford');
		},

		onShowItemTooltip: function (item, pos, canCompare, bottomAlign) {
			this.removeButton();

			const html = buildTooltip(this, item, pos, canCompare, bottomAlign);

			this.item = item;

			const el = this.tooltip;
			el.html(html);
			el.css({ display: 'flex' });

			if (pos) {
				if (bottomAlign)
					pos.y -= el.height();

				//correct tooltips that are appearing offscreen
				// arbitrary constant -30 is there to stop resize code
				// completely squishing the popup
				if ((pos.x + el.width()) > window.innerWidth)
					pos.x = window.innerWidth - el.width() - 30;

				if ((pos.y + el.height()) > window.innerHeight)
					pos.y = window.innerHeight - el.height() - 30;

				el.css({
					left: pos.x,
					top: pos.y
				});
			}

			events.emit('onBuiltItemTooltip', this.tooltip);
		},

		onHideItemTooltip: function (item) {
			if (
				(!this.item) ||
				(
					(this.item !== item) &&
					(this.item.refItem) &&
					(this.item.refItem !== item)
				)
			)
				return;

			this.item = null;
			this.tooltip.hide();

			this.removeButton();
		},

		addButton: function (label, cb) {
			let tt = this.tooltip;
			let pos = tt.offset();
			let width = tt.outerWidth();
			let height = tt.outerHeight();

			$(`<div class='btn'>${label}</div>`)
				.appendTo(this.el)
				.on('click', cb)
				.css({
					width: width,
					left: pos.left,
					top: pos.top + height
				});
		},

		beforeHide: function () {
			this.removeButton();
		},

		removeButton: function () {
			this.find('.btn').remove();
		}
	};
});
