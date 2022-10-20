define([
	'js/system/events',
	'html!ui/templates/spells/template',
	'css!ui/templates/spells/styles',
	'html!ui/templates/spells/templateSpell',
	'html!ui/templates/spells/templateTooltip'
], function (
	events,
	template,
	styles,
	templateSpell,
	templateTooltip
) {
	return {
		tpl: template,

		spells: null,

		postRender: function () {
			this.onEvent('onGetSpells', this.onGetSpells.bind(this));
			this.onEvent('onGetSpellCooldowns', this.onGetSpellCooldowns.bind(this));
			this.onEvent('onGetSpellActive', this.onGetSpellActive.bind(this));
			this.onEvent('onGetStats', this.onGetStats.bind(this));

			setInterval(this.update.bind(this), 100);
		},

		onGetSpells: function (spells) {
			this.el.empty();

			this.spells = spells;

			for (let i = 0; i < spells.length; i++) {
				let spell = spells[i];
				let icon = spell.icon;
				let x = -(icon[0] * 64);
				let y = -(icon[1] * 64);

				let hotkey = (spell.id === 0) ? 'space' : spells[i].id;

				let html = templateSpell
					.replace('$HOTKEY$', hotkey);

				let el = $(html)
					.appendTo(this.el);
				el
					.on('dblclick', this.onDblClickSpell.bind(this, hotkey))
					.on('click', this.onClickSpell.bind(this, hotkey))
					.on('mouseover', this.onShowTooltip.bind(this, el, spell))
					.on('mouseleave', this.onHideTooltip.bind(this, el));

				let spritesheet = spell.spritesheet || '../../../images/abilityIcons.png';
				el
					.find('.icon').css({
						background: 'url("' + spritesheet + '") ' + x + 'px ' + y + 'px'
					})
					.next().html(hotkey);

				if (spell.autoActive) 
					el.addClass('active');

				//HACK - we don't actually know how long a tick is
				if (spell.cd) {
					this.onGetSpellCooldowns({
						spell: spell.id,
						cd: spell.cd * 350
					});

					delete spell.cd;
				}
			}
		},

		onClickSpell: function (hotkey, e) {
			e.preventDefault();

			let key = (hotkey === 'space') ? ' ' : hotkey;

			window.player.spellbook.onKeyDown(key);

			return false;
		},

		onDblClickSpell: function (hotkey, e) {
			window.player.spellbook.tabTarget(true);
			return this.onClickSpell(hotkey, e);
		},

		onShowTooltip: function (el, spell) {
			if (isMobile)
				return false;

			let pos = el.parent().offset();
			pos = {
				x: pos.left - 26,
				y: pos.top
			};

			let values = Object.keys(spell.values).filter(function (v) {
				return ((v !== 'damage') && (v !== 'healing'));
			}).map(function (v) {
				return v + ': ' + spell.values[v];
			}).join('<br />');

			let manaCost = spell.manaCost;
			if (spell.manaReserve)
				manaCost = ~~(spell.manaReserve.percentage * 100) + '% reserved';

			let tooltip = templateTooltip
				.replace('$NAME$', spell.name)
				.replace('$DESCRIPTION$', spell.description)
				.replace('$MANA$', manaCost)
				.replace('$CD$', spell.cdMax + ' Ticks')
				.replace('$VALUES$', values)
				.replace('$ELEMENT$', spell.element ? 'element: ' + spell.element : '');

			if (spell.range) {
				tooltip = tooltip
					.replace('$RANGE$', spell.range);
			} else {
				tooltip = tooltip
					.replace('range', 'range hidden');
			}

			events.emit('onShowTooltip', tooltip, el[0], pos, 250, false, true, this.el.css('z-index'));
		},
		onHideTooltip: function (el) {
			events.emit('onHideTooltip', el[0]);
		},

		onGetSpellCooldowns: function (options) {
			let spell = this.spells.find(function (s) {
				return (s.id === options.spell);
			});
			spell.ttl = options.cd;
			spell.ttlStart = +new Date();
		},

		onGetSpellActive: function (options) {
			let spellIndex = this.spells.findIndex(s => s.id === options.spell);
			let el = this.el.children('div')
				.eq(spellIndex)
				.removeClass('active');

			if (options.active)
				el.addClass('active');			
		},

		onGetStats: function (stats) {
			let mana = stats.mana;

			let spells = this.spells;
			if (!spells)
				return;

			for (let i = 0; i < spells.length; i++) {
				let spell = spells[i];

				let el = this.el.children('div').eq(i).find('.hotkey');
				el.removeClass('no-mana');
				if (spell.manaCost > mana)
					el.addClass('no-mana');
			}
		},

		update: function () {
			let spells = this.spells;
			if (!spells)
				return;

			let time = +new Date();

			for (let i = 0; i < spells.length; i++) {
				let spell = spells[i];

				if (!spell.ttl) {
					this.el.children('div').eq(i).find('.cooldown').css({
						width: '0%'
					});
					continue;
				}

				let elapsed = time - spell.ttlStart;
				let width = 1 - (elapsed / spell.ttl);
				if (width <= 0) {
					delete spell.ttl;
					width = 0;
				}

				width = Math.ceil((width * 100) / 4) * 4;

				this.el.children('div').eq(i).find('.cooldown').css({
					width: width + '%'
				});
			}
		}
	};
});
