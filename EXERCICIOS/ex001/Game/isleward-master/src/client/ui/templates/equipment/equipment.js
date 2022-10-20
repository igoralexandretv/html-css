define([
	'js/system/events',
	'js/system/client',
	'html!ui/templates/equipment/template',
	'css!ui/templates/equipment/styles',
	'js/input',
	'ui/shared/renderItem'
], function (
	events,
	client,
	template,
	styles,
	input,
	renderItem
) {
	return {
		tpl: template,

		centered: true,

		modal: true,
		hasClose: true,

		stats: null,
		equipment: null,

		hoverItem: null,
		hoverEl: null,
		hoverCompare: null,

		isInspecting: false,

		postRender: function () {
			this.onEvent('onGetStats', this.onGetStats.bind(this));
			this.onEvent('onGetItems', this.onGetItems.bind(this));

			this.onEvent('onInspectTarget', this.onInspectTarget.bind(this));

			this.onEvent('onShowEquipment', this.toggle.bind(this));

			this.find('.tab').on('click', this.onTabClick.bind(this));

			this.onEvent('onKeyDown', this.onKeyDown.bind(this));
			this.onEvent('onKeyUp', this.onKeyUp.bind(this));
		},

		beforeHide: function () {
			this.isInspecting = false;
			delete this.result;

			this.find('.itemList').hide();

			this.onHoverItem(null, null, null);
		},

		onAfterShow: function () {
			this.find('.itemList').hide();

			this.onGetStats();
			this.onGetItems();

			this.onHoverItem(null, null, null);
		},

		onKeyDown: function (key) {
			if (key === 'j')
				this.toggle();
			else if (key === 'shift' && this.hoverItem)
				this.onHoverItem(this.hoverEl, this.hoverItem, this.hoverCompare);
		},
		onKeyUp: function (key) {
			if (key === 'shift' && this.hoverItem)
				this.onHoverItem(this.hoverEl, this.hoverItem, null);
		},

		onTabClick: function (e) {
			this.find('.tab.selected').removeClass('selected');

			$(e.target).addClass('selected');
			
			let stats = this.isInspecting ? this.result.stats : this.stats;

			this.onGetStats(stats);
		},

		onGetItems: function (items) {
			items = items || this.items;

			if (!this.isInspecting)
				this.items = items;

			if (!this.shown)
				return;

			this.find('.slot').addClass('empty');

			this.find('[slot]')
				.removeData('item')
				.addClass('empty show-default-icon')
				.find('.info')
				.html('')
				.parent()
				.find('.icon')
				.off()
				.css('background-image', '')
				.css('background-position', '')
				.on('click', this.buildSlot.bind(this));

			this.find('[slot]').toArray().forEach(el => {
				el = $(el);
				let slot = el.attr('slot');
				let newItems = window.player.inventory.items.some(i => {
					if (slot.indexOf('finger') === 0)
						slot = 'finger';
					else if (slot === 'oneHanded')
						return (['oneHanded', 'twoHanded'].includes(i.slot) && i.isNew);

					return (i.slot === slot && i.isNew);
				});

				if (newItems)
					el.find('.info').html('new');
			});

			items
				.filter(item => item.has('quickSlot') || (item.eq && (item.slot || item.has('runeSlot'))))
				.forEach(item => {
					let slot = item.slot;
					if (item.has('runeSlot')) {
						let runeSlot = item.runeSlot;
						slot = 'rune-' + runeSlot;
					} else if (item.has('quickSlot'))
						slot = 'quick-' + item.quickSlot;

					slot = item.equipSlot || slot;

					const elSlot = this.find('[slot="' + slot + '"]')
						.removeClass('empty show-default-icon');

					const itemEl = renderItem(null, item, elSlot);

					itemEl
						.data('item', item)
						.removeClass('empty show-default-icon')
						.find('.icon')
						.off()
						.on('contextmenu', this.showContext.bind(this, item))
						.on('mousedown', this.buildSlot.bind(this, elSlot))
						.on('mousemove', this.onHoverItem.bind(this, elSlot, item, null))
						.on('mouseleave', this.onHoverItem.bind(this, null, null));
				});
		},

		showContext: function (item, e) {
			let menuItems = {
				unequip: {
					text: 'unequip',
					callback: this.unequipItem.bind(this, item)
				}			
			};

			let config = [];

			config.push(menuItems.unequip);

			events.emit('onContextMenu', config, e);

			e.preventDefault();
			return false;
		},

		unequipItem: function (item) {
			const isQuickslot = item.has('quickSlot');
			const method = isQuickslot ? 'setQuickSlot' : 'unequip';
			const data = isQuickslot ? { slot: item.quickSlot } : { itemId: item.id };

			client.request({
				cpn: 'player',
				method: 'performAction',
				data: {
					cpn: 'equipment',
					method,
					data
				}
			});
		},

		onInspectTarget: function (result) {
			this.isInspecting = true;

			this.show();

			this.result = result;

			this.onGetStats(result.stats);
			this.onGetItems(result.equipment);
		},

		buildSlot: function (el, e) {
			if (e && e.button !== 0) 
				return;

			if (this.isInspecting)
				return;

			if (el.target)
				el = $(el.target).parent();

			let slot = el.attr('slot');
			let isRune = (slot.indexOf('rune') === 0);
			const isConsumable = (slot.indexOf('quick') === 0);

			let container = this.find('.itemList')
				.empty()
				.show();

			let hoverCompare = this.hoverCompare = el.data('item');

			let items = this.items
				.filter(item => {
					if (isRune)
						return (!item.slot && item.spell && !item.eq);
					else if (isConsumable)
						return (item.type === 'consumable' && !item.has('quickSlot'));
					
					let checkSlot = (slot.indexOf('finger') === 0) ? 'finger' : slot;
					if (slot === 'oneHanded')
						return (!item.eq && (item.slot === 'oneHanded' || item.slot === 'twoHanded'));

					return (item.slot === checkSlot && !item.eq);
				});

			if (isConsumable)
				items = items.filter((item, i) => items.findIndex(f => f.name === item.name) === i);

			items.splice(0, 0, {
				name: 'None',
				slot: hoverCompare ? hoverCompare.slot : null,
				id: (hoverCompare && !isConsumable) ? hoverCompare.id : null,
				type: isConsumable ? 'consumable' : null,
				empty: true
			});
			if (hoverCompare)
				items.splice(1, 0, hoverCompare);

			items
				.forEach(function (item, i) {
					let sprite = item.sprite || [7, 0];

					let spriteSheet = item.empty ? '../../../images/uiIcons.png' : item.spritesheet || '../../../images/items.png';
					if (i > 0 && item.type === 'consumable')
						spriteSheet = '../../../images/consumables.png';
					let imgX = -sprite[0] * 64;
					let imgY = -sprite[1] * 64;

					let itemEl = $('<div class="slot"><div class="icon"></div></div>')
						.appendTo(container);

					itemEl
						.find('.icon')
						.css('background', 'url("' + spriteSheet + '") ' + imgX + 'px ' + imgY + 'px')
						.on('mousedown', this.equipItem.bind(this, item, slot))
						.on('mousemove', this.onHoverItem.bind(this, itemEl, item, null))
						.on('mouseleave', this.onHoverItem.bind(this, null, null));

					if (item === hoverCompare)
						itemEl.find('.icon').addClass('eq');
					else if (item.isNew)
						el.find('.icon').addClass('new');
				}, this);

			if (!items.length)
				container.hide();

			if (e) {
				e.preventDefault();
				return false;
			}
		},

		equipItem: function (item, slot, e) {
			let isNew = window.player.inventory.items.some(f => (f.equipSlot === slot && f.isNew));
			if (!isNew)
				this.find('[slot="' + slot + '"] .info').html('');

			if (item === this.hoverCompare) {
				this.find('.itemList').hide();
				return;
			}

			let cpn = 'equipment';
			let method = 'equip';
			let data = { itemId: item.id };

			if (item.empty)
				method = 'unequip';

			if (item.type === 'consumable') {
				cpn = 'equipment';
				method = 'setQuickSlot';
				data = {
					itemId: item.id,
					slot: ~~slot.replace('quick-', '')
				};
			} else if (!item.slot) {
				cpn = 'inventory';
				method = 'learnAbility';
				data = {
					itemId: item.id,
					slot: ~~slot.replace('rune-', '')
				};

				if (item.empty) {
					if (!this.hoverCompare) {
						this.find('.itemList').hide();
						return;
					} 
					method = 'unlearnAbility';
					data.itemId = this.hoverCompare.id;
					delete data.slot;
				}
			} else if (item.slot === 'finger') {
				data = {
					itemId: item.id,
					slot: slot
				};
			}

			client.request({
				cpn: 'player',
				method: 'performAction',
				data: {
					cpn: cpn,
					method: method,
					data: data
				}
			});

			this.find('.itemList').hide();

			e.preventDefault();
			return false;
		},

		onHoverItem: function (el, item, compare, e) {
			if (el) {
				this.hoverItem = item;
				this.hoverEl = el;

				if ((item.isNew) && (!item.eq)) {
					delete item.isNew;
					el.find('.icon').removeClass('new');
				}

				let ttPos = null;
				if (e) {
					ttPos = {
						x: ~~(e.clientX + 32),
						y: ~~(e.clientY)
					};
				}

				events.emit('onShowItemTooltip', item, ttPos, this.hoverCompare);
			} else {
				events.emit('onHideItemTooltip', this.hoverItem);
				this.hoverItem = null;
			}
		},

		onGetStats: function (stats ) {	
			if (stats && !this.isInspecting)
				this.stats = stats;

			stats = stats || this.stats;

			if (!this.shown)
				return;

			let container = this.el.find('.stats');

			container
				.children('*:not(.tabs)')
				.remove();

			let xpRemaining = (stats.xpMax - stats.xp).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

			let newStats = {
				basic: {
					level: stats.level,
					'next level': xpRemaining + 'xp',
					gap1: '',
					gold: window.player.trade.gold,
					gap2: '',
					hp: ~~stats.hp + '/' + ~~stats.hpMax,
					mana: ~~stats.mana + '/' + ~~stats.manaMax,
					'hp regen': stats.regenHp,
					'mana regen': ~~stats.regenMana + '%',
					gap3: '',
					str: stats.str,
					int: stats.int,
					dex: stats.dex,
					vit: stats.vit
				},
				offense: {
					'global crit chance': (~~(stats.critChance * 10) / 10) + '%',
					'global crit multiplier': (~~(stats.critMultiplier * 10) / 10) + '%',
					'attack crit chance': (~~((stats.critChance + stats.attackCritChance) * 10) / 10) + '%',
					'attack crit multiplier': (~~((stats.critMultiplier + stats.attackCritMultiplier) * 10) / 10) + '%',
					'spell crit chance': (~~((stats.critChance + stats.spellCritChance) * 10) / 10) + '%',
					'spell crit multiplier': (~~((stats.critMultiplier + stats.spellCritMultiplier) * 10) / 10) + '%',
					gap1: '',
					'arcane increase': stats.elementArcanePercent + '%',
					'fire increase': stats.elementFirePercent + '%',
					'frost increase': stats.elementFrostPercent + '%',
					'holy increase': stats.elementHolyPercent + '%',
					'poison increase': stats.elementPoisonPercent + '%',
					'physical increase': stats.physicalPercent + '%',
					gap2: '',
					'spell increase': stats.spellPercent + '%',
					gap3: '',
					'attack speed': (100 + stats.attackSpeed) + '%',
					'cast speed': (100 + stats.castSpeed) + '%'
				},
				defense: {
					armor: stats.armor,
					'chance to block attacks': stats.blockAttackChance + '%',
					'chance to block spells': stats.blockSpellChance + '%',
					gap1: '',
					'chance to dodge attacks': (~~(stats.dodgeAttackChance * 10) / 10) + '%',
					'chance to dodge spells': (~~(stats.dodgeSpellChance * 10) / 10) + '%',
					gap2: '',
					'arcane resist': stats.elementArcaneResist,
					'fire resist': stats.elementFireResist,
					'frost resist': stats.elementFrostResist,
					'holy resist': stats.elementHolyResist,
					'poison resist': stats.elementPoisonResist,
					gap3: '',
					'all resist': stats.elementAllResist,
					gap4: '',
					'life gained on hit': stats.lifeOnHit
				},
				misc: {
					'item quality': stats.magicFind + '%',
					'item quantity': stats.itemQuantity + '%',
					gap1: '',
					'sprint chance': ((~~(stats.sprintChance * 100) / 100) || 0) + '%',
					gap2: '',
					'xp increase': stats.xpIncrease + '%',
					gap3: '',
					'chance to catch a fish': stats.catchChance + '%',
					'fishing speed': stats.catchSpeed + '%',
					'increased fish rarity': stats.fishRarity + '%',
					'increased fish weight': stats.fishWeight + '%',
					'chance to fish items': stats.fishItems + '%'
				}
			}[this.find('.tab.selected').html()];

			for (let s in newStats) {
				let label = s + ': ';
				let value = newStats[s];

				let isGap = false;
				if (label.indexOf('gap') === 0) {
					isGap = true;
					label = '';
					value = '';
				}

				let row = $('<div class="stat"><font class="q0">' + label + '</font><font color="#999">' + value + '</font></div>')
					.appendTo(container);

				if (s === 'gold')
					row.addClass('gold');
				else if ((s === 'level') || (s === 'next level'))
					row.addClass('blueText');

				if (isGap)
					row.addClass('empty');
			}
		}
	};
});
