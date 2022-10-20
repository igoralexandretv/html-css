define([
	'js/system/client',
	'js/system/events',
	'html!ui/templates/events/template',
	'html!ui/templates/events/templateEvent',
	'css!ui/templates/events/styles',
	'js/config'
], function (
	client,
	events,
	tpl,
	templateEvent,
	styles,
	config
) {
	return {
		tpl: tpl,

		list: [],

		container: '.right',

		postRender: function () {
			if (isMobile) {
				this.el.on('click', this.toggleButtons.bind(this));
				this.find('.btnCollapse').on('click', this.toggleButtons.bind(this));
			}
			
			this.onEvent('clearUis', this.clear.bind(this));

			this.onEvent('onObtainEvent', this.onObtainEvent.bind(this));
			this.onEvent('onRemoveEvent', this.onRemoveEvent.bind(this));
			this.onEvent('onUpdateEvent', this.onUpdateEvent.bind(this));
			this.onEvent('onCompleteEvent', this.onCompleteEvent.bind(this));

			this.onEvent('onToggleEventsVisibility', this.onToggleEventsVisibility.bind(this));
			this.onToggleEventsVisibility(config.showEvents);
		},

		clear: function () {
			this.list = [];
			this.el.find('.list').empty();
		},

		onRemoveEvent: function (id) {
			let l = this.list.spliceFirstWhere(f => f.id === id);
			if (l)
				l.el.remove();
		},

		onObtainEvent: function (eventObj) {
			let exists = this.list.find(function (l) {
				return (l.id === eventObj.id);
			});
			if (exists) {
				exists.el.find('.name').html(eventObj.name);
				exists.el.find('.description').html(eventObj.description);
				return;
			}

			let container = this.el.find('.list');

			let html = templateEvent
				.replace('$NAME$', eventObj.name)
				.replace('$DESCRIPTION$', eventObj.description);

			let el = $(html).appendTo(container);

			if (eventObj.isReady)
				el.addClass('ready');

			this.list.push({
				id: eventObj.id,
				el: el,
				event: eventObj
			});

			let eventEl = container.find('.event');

			eventEl.toArray().forEach(c => {
				let childEl = $(c);
				if (childEl.hasClass('active'))
					childEl.prependTo(container);
			});
		},

		onUpdateEvent: function (eventObj) {
			let e = this.list.find(function (l) {
				return (l.id === eventObj.id);
			});

			e.event.isReady = eventObj.isReady;

			e.el.find('.description').html(eventObj.description);

			e.el.removeClass('ready');
			if (eventObj.isReady) {
				e.el.removeClass('disabled');
				e.el.addClass('ready');
			}
		},

		onCompleteEvent: function (id) {
			let e = this.list.find(function (l) {
				return (l.id === id);
			});

			if (!e)
				return;

			e.el.remove();
			this.list.spliceWhere(function (l) {
				return (l.id === id);
			});
		},

		toggleButtons: function (e) {
			this.el.toggleClass('active');
			e.stopPropagation();
		},

		onToggleEventsVisibility: function (active) {
			if (active)
				this.show();
			else 
				this.hide();
		}
	};
});
