define([
	'js/system/events',
	'js/system/client',
	'html!ui/templates/leaderboard/template',
	'css!ui/templates/leaderboard/styles',
	'js/system/globals'
], function (
	events,
	client,
	template,
	styles,
	globals
) {
	return {
		tpl: template,

		centered: true,
		modal: true,
		hasClose: true,

		prophecyFilter: null,

		records: [],

		offset: 0,
		pageSize: 10,
		maxOffset: 0,

		postRender: function () {
			this.onEvent('onShowLeaderboard', this.toggle.bind(this, true));

			this.find('.prophecy[prophecy]').on('click', this.onProphecyClick.bind(this));

			this.find('.prophecy-mine').on('click', this.onMine.bind(this));
			this.find('.prophecy-none').on('click', this.onNone.bind(this));

			this.find('.btn-refresh').on('click', this.onRefresh.bind(this));

			this.find('.buttons .btn').on('click', this.onPage.bind(this));
		},

		onPage: function (e) {
			let el = $(e.target);
			let offset = ~~el.attr('offset');

			this.offset += offset;
			if (this.offset < 0)
				this.offset = 0;
			else if (this.offset > this.maxOffset)
				this.offset = this.maxOffset;

			this.getList(true);
		},

		onMine: function () {
			let prophecies = window.player.prophecies;
			prophecies = prophecies ? prophecies.list : [];

			this.prophecyFilter = [];
			this.find('.prophecy').removeClass('selected');

			prophecies.forEach(function (p) {
				this.onProphecyClick({
					currentTarget: this.find('.prophecy[prophecy="' + p + '"]')
				});
			}, this);
		},

		onNone: function () {
			this.find('.prophecy[prophecy]').removeClass('selected');
			this.prophecyFilter = [];
		},

		onRefresh: function () {
			this.getList();
		},

		onProphecyClick: function (e) {
			let el = $(e.currentTarget);

			el.toggleClass('selected');

			let prophecyName = el.attr('prophecy');

			let exists = this.prophecyFilter.some(function (p) {
				return (p === prophecyName);
			}, this);

			if (exists) {
				this.prophecyFilter.spliceWhere(function (p) {
					return (p === prophecyName);
				}, this);
			} else
				this.prophecyFilter.push(prophecyName);
		},

		getList: function (keepOffset) {
			this.el.addClass('disabled');

			if (!this.prophecyFilter) {
				let prophecies = window.player.prophecies;
				this.prophecyFilter = prophecies ? prophecies.list : [];
				this.prophecyFilter = $.extend(true, [], this.prophecyFilter);
			}

			client.request({
				module: 'leaderboard',
				method: 'requestList',
				data: {
					prophecies: this.prophecyFilter,
					offset: this.offset * this.pageSize
				},
				callback: this.onGetList.bind(this, keepOffset)
			});
		},

		onGetList: function (keepOffset, result) {
			this.records = result;

			if (!keepOffset) {
				this.offset = 0;

				let foundIndex = this.records.list.findIndex(function (r) {
					return (r.name === window.player.name);
				}, this);
				if (foundIndex !== -1)
					this.offset = ~~(foundIndex / this.pageSize);
			}

			let container = this.find('.list').empty();

			this.maxOffset = Math.ceil(result.length / this.pageSize) - 1;

			for (let i = 0; i < this.records.list.length; i++) {
				let r = this.records.list[i];

				let html = '<div class="row"><div class="col">' + r.level + '</div><div class="col">' + r.name + '</div></div>';
				let el = $(html)
					.appendTo(container);

				if (r.name === window.player.name)
					el.addClass('self');
				else {
					let online = globals.onlineList.some(function (o) {
						return (o.name === r.name);
					});
					if (online)
						el.addClass('online');
				}

				if (r.dead)
					el.addClass('disabled');
			}

			this.updatePaging();

			this.el.removeClass('disabled');
		},

		updatePaging: function () {
			this.find('.buttons .btn').removeClass('disabled');

			if (this.offset === 0)
				this.find('.btn-first, .btn-prev').addClass('disabled');

			if (this.offset >= this.maxOffset)
				this.find('.btn-next, .btn-last').addClass('disabled');
		},

		onAfterShow: function () {
			this.find('.prophecy[prophecy]').removeClass('selected');
			let prophecies = window.player.prophecies;
			prophecies = prophecies ? prophecies.list : [];
			prophecies.forEach(function (p) {
				this.find('.prophecy[prophecy="' + p + '"]').addClass('selected');
			}, this);

			this.prophecyFilter = null;

			this.getList();
		}
	};
});
