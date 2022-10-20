define([
	'js/system/events',
	'js/system/client',
	'html!ui/templates/createCharacter/template',
	'css!ui/templates/createCharacter/styles',
	'ui/factory',
	'js/system/globals'
], function (
	events,
	client,
	template,
	styles,
	uiFactory,
	globals
) {
	return {
		tpl: template,
		centered: true,

		classSprites: null,
		class: null,
		costume: 0,
		skinId: null,

		prophecies: [],

		beforeRender: function () {
			const { clientConfig: { logoPath } } = globals;
			if (!logoPath)
				return;

			const tempEl = $(this.tpl);
			tempEl.find('.logo').attr('src', logoPath);

			this.tpl = tempEl.prop('outerHTML');
		},

		postRender: function () {
			this.getSkins();

			uiFactory.build('tooltips');

			this.find('.txtClass')
				.on('click', this.changeClass.bind(this))
				.on('mousemove', this.onClassHover.bind(this))
				.on('mouseleave', this.onClassUnhover.bind(this));

			this.find('.skinBox .btn').on('click', this.changeCostume.bind(this));

			this.find('.btnBack').on('click', this.back.bind(this));
			this.find('.btnCreate').on('click', this.create.bind(this));

			this.find('.prophecy')
				.on('click', this.onProphecyClick.bind(this))
				.on('mousemove', this.onProphecyHover.bind(this))
				.on('mouseleave', this.onProphecyUnhover.bind(this));
		},

		getSkins: function () {
			this.el.addClass('disabled');

			client.request({
				cpn: 'auth',
				method: 'getSkinList',
				data: {

				},
				callback: this.onGetSkins.bind(this)
			});
		},

		onGetSkins: function (result) {
			this.el.removeClass('disabled');

			this.classSprites = result;

			this.costume = 0;

			this.class = 'owl';
			this.find('.txtClass').html('Owl');

			this.changeCostume();
		},

		onProphecyHover: function (e) {
			let el = $(e.target);

			let pos = {
				x: e.clientX + 25,
				y: e.clientY
			};

			let text = el.attr('tooltip');

			events.emit('onShowTooltip', text, el[0], pos);
			$('.uiTooltips .tooltip').addClass('bright');
		},

		onProphecyUnhover: function (e) {
			let el = $(e.target);
			events.emit('onHideTooltip', el[0]);
		},

		onProphecyClick: function (e) {
			let el = $(e.target);
			let pName = el.attr('prophecy');

			if (el.hasClass('active')) {
				this.prophecies.spliceWhere(function (p) {
					return (p === pName);
				});
				el.removeClass('active');
			} else {
				this.prophecies.push(pName);
				el.addClass('active');
			}
		},

		clear: function () {
			this.prophecies = [];
			this.find('.prophecy').removeClass('active');
		},

		back: function () {
			this.clear();

			this.destroy();

			uiFactory.build('characters', {});
		},

		create: function () {
			this.el.addClass('disabled');

			client.request({
				cpn: 'auth',
				method: 'createCharacter',
				data: {
					name: this.find('.txtName').val(),
					class: this.class,
					skinId: this.skinId,
					prophecies: this.prophecies
				},
				callback: this.onCreate.bind(this)
			});
		},

		onCreate: function (result) {
			this.el.removeClass('disabled');

			if (!result) {
				this.clear();
				this.destroy();
			} else
				this.el.find('.message').html(result);
		},

		onClassHover: function (e) {
			let el = $(e.target);

			let pos = {
				x: e.clientX + 25,
				y: e.clientY
			};

			let text = ({
				owl: 'The wise Owl guides you; granting you the focus needed to cast spells. <br /><br />Upon level up, you gain 1 Intellect.',
				bear: 'The towering Bear strenghtens you; lending force to your blows. <br /><br />Upon level up, you gain 1 Strength.',
				lynx: 'The nimble Lynx hastens you; allowing your strikes to land true. <br /><br />Upon level up, you gain 1 Dexterity.'
			})[this.class];

			events.emit('onShowTooltip', text, el[0], pos, 200);
			$('.uiTooltips .tooltip').addClass('bright');
		},

		onClassUnhover: function (e) {
			let el = $(e.target);
			events.emit('onHideTooltip', el[0]);
		},

		changeClass: function (e) {
			let el = $(e.target);
			let classes = ['owl', 'bear', 'lynx'];
			let nextIndex = (classes.indexOf(this.class) + 1) % classes.length;

			let newClass = classes[nextIndex];

			el.html(newClass[0].toUpperCase() + newClass.substr(1));

			this.class = newClass;

			this.onClassHover(e);
		},

		changeCostume: function (e) {
			let delta = e ? ~~$(e.target).attr('delta') : 0;

			let spriteList = this.classSprites;
			if (!spriteList)
				return;

			this.costume = (this.costume + delta) % spriteList.length;
			if (this.costume < 0)
				this.costume = spriteList.length - 1;
			this.skinId = spriteList[this.costume].id;

			$('.txtCostume').html(spriteList[this.costume].name);

			this.setSprite();
		},

		setSprite: function () {
			let classSprite = this.classSprites[this.costume];
			let costume = classSprite.sprite.split(',');
			let spirteX = -costume[0] * 8;
			let spriteY = -costume[1] * 8;

			let spritesheet = classSprite.spritesheet || '../../../images/characters.png';

			this.find('.sprite')
				.css('background', 'url("' + spritesheet + '") ' + spirteX + 'px ' + spriteY + 'px');
		}
	};
});
