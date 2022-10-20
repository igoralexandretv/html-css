define([
	'js/system/events',
	'js/system/client',
	'html!ui/templates/reputation/template',
	'css!ui/templates/reputation/styles'
], function (
	events,
	client,
	template,
	styles
) {
	return {
		tpl: template,

		centered: true,
		modal: true,
		hasClose: true,

		list: null,

		postRender: function () {
			this.onEvent('onGetReputations', this.onGetReputations.bind(this));
			this.onEvent('onShowReputation', this.toggle.bind(this, true));
		},

		build: function () {
			let list = this.list;
			
			this.find('.info .heading-bottom').html('');
			this.find('.info .description').html('');
			this.find('.bar-outer').hide();

			if (!list.length)
				this.find('.heading-bottom').html("you haven't discovered any factions yet");
			else
				this.find('.heading-bottom').html('select a faction to see more info');

			let elList = this.find('.list').empty();

			list.forEach(l => {
				if (l.noGainRep)
					return;

				let html = '<div class="faction">' + l.name + '</div>';

				let el = $(html).appendTo(elList);

				el.on('click', this.onSelectFaction.bind(this, el, l));
				el.on('click', events.emit.bind(events, 'onClickButton'));
			});
		},

		onSelectFaction: function (el, faction) {
			this.find('.selected').removeClass('selected');
			el.addClass('selected');

			this.find('.info .heading-bottom').html(faction.name);
			this.find('.info .description').html(faction.description);

			let rep = faction.rep;
			let tier = faction.tier;
			let tiers = faction.tiers;
			let prevTier = tiers[tier];
			let nextTier = (tier === tiers.length - 1) ? tiers[tiers.length - 1] : tiers[tier + 1];

			let percentage = (rep - prevTier.rep) / (nextTier.rep - prevTier.rep) * 100;

			if (tier === tiers.length - 1)
				percentage = 100;

			this.find('.bar-outer').show();

			this.find('.front').css({
				width: percentage + '%',
				minWidth: percentage + '%'
			});

			let w = ~~(this.find('.front').width() / 5) * 5;
			this.find('.front').css({
				width: w
			});

			percentage = ~~(percentage * 10) / 10;

			this.find('.tier').html(tiers[tier].name.toLowerCase() + ' (' + percentage + '%)');
		},

		onGetReputations: function (list) {
			this.list = list;

			this.list.sort(function (a, b) {
				if (a.name[0] < b.name[0])
					return -1;
				return 1;
			});

			let selElement = this.find('.selected');
			if (this.el.is(':visible') && selElement.index() !== -1)
				this.onSelectFaction(selElement, list[selElement.index() + 1]);
		},

		onAfterShow: function () {
			this.build();
		}
	};
});
