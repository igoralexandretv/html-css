define([
	'js/system/events',
	'js/system/client',
	'ui/factory',
	'html!ui/templates/characters/template',
	'html!ui/templates/characters/templateListItem',
	'css!ui/templates/characters/styles',
	'js/system/globals'
], function (
	events,
	client,
	uiFactory,
	template,
	templateListItem,
	styles,
	globals
) {
	return {
		tpl: template,

		centered: true,
		characterInfo: {},
		characters: null,
		selected: null,
		selectedIndex: -1,
		deleteCount: 0,

		beforeRender: function () {
			const { clientConfig: { logoPath } } = globals;
			if (!logoPath)
				return;

			const tempEl = $(this.tpl);
			tempEl.find('.logo').attr('src', logoPath);

			this.tpl = tempEl.prop('outerHTML');
		},

		postRender: function () {
			this.find('.btnPlay').on('click', this.onPlayClick.bind(this));
			this.find('.btnNew').on('click', this.onNewClick.bind(this));
			this.find('.btnDelete')
				.on('click', this.onDeleteClick.bind(this))
				.on('mouseleave', this.onDeleteReset.bind(this));

			this.getCharacters();

			this.onEvent('onKeyDown', this.onKeyDown.bind(this));
		},

		onKeyDown: function (key) {
			if (this.el.hasClass('disabled'))
				return;

			if (key === 'enter')
				this.onPlayClick();
			else if (key === 'up' || key === 'down') {
				if (!this.characters || this.selectedIndex === -1)
					return;

				const numChars = this.characters.length;
				if (!numChars)
					return;

				const delta = key === 'up' ? -1 : 1;

				//Clamp index within range [0, numChars - 1]
				const newIndex = Math.min(Math.max(this.selectedIndex + delta, 0), numChars - 1);

				const list = this.find('.left');
				if (!list)
					return;

				const li = list.children()[newIndex];
				li.click();

				list.scrollTop(li.offsetTop);
			}
		},

		onPlayClick: function () {
			let char = this.selected;
			if (!char)
				return;

			this.el.addClass('disabled');

			client.request({
				cpn: 'auth',
				method: 'play',
				data: {
					name: this.selected
				},
				callback: this.onPlay.bind(this)
			});
		},
		onPlay: function () {
			this.el.removeClass('disabled');
			this.destroy();
		},

		onNewClick: function () {
			uiFactory.build('createCharacter', {});
			this.destroy();
		},

		getCharacters: function () {
			this.el.addClass('disabled');

			client.request({
				cpn: 'auth',
				method: 'getCharacterList',
				callback: this.onGetCharacters.bind(this)
			});
		},
		onGetCharacters: function (characters) {
			this.characters = characters;
			this.find('.sprite').css('background', '');
			this.find('.info div').html('');

			this.el.removeClass('disabled');

			let list = this.find('.left')
				.empty();

			this.characters
				.sort(function (a, b) {
					return (b.level - a.level);
				})
				.forEach(function (c, i) {
					let charName = c.name;
					if (c.level !== null)
						charName += '<font class="color-yellowB">&nbsp;(' + c.level + ')</font>';

					let html = templateListItem
						.replace('$NAME$', charName);

					let li = $(html)
						.appendTo(list);

					li.on('click', this.onCharacterClick.bind(this, c.name, i));

					if (i === 0)
						li.click();
				}, this);
		},
		onCharacterClick: function (charName, charIndex, e) {
			this.selectedIndex = charIndex;
			this.el.addClass('disabled');

			let el = $(e.target);
			el.parent().find('.selected').removeClass('selected');
			el.addClass('selected');

			let charInfo = this.characterInfo[charName];
			if (charInfo) {
				this.onGetCharacter(charName, charInfo);

				return;
			}

			client.request({
				cpn: 'auth',
				method: 'getCharacter',
				data: {
					name: charName
				},
				callback: this.onGetCharacter.bind(this, charName)
			});
		},
		onGetCharacter: function (charName, result) {
			this.find('.btn').removeClass('disabled');

			let spriteY = ~~(result.cell / 8);
			let spirteX = result.cell - (spriteY * 8);

			spirteX = -(spirteX * 8);
			spriteY = -(spriteY * 8);

			let spritesheet = result.sheetName;
			if (spritesheet === 'characters')
				spritesheet = '../../../images/characters.png';

			this.find('.sprite')
				.css('background', 'url("' + spritesheet + '") ' + spirteX + 'px ' + spriteY + 'px')
				.show();

			this.find('.name').html(charName);
			let stats = result.components.find(function (c) {
				return (c.type === 'stats');
			});
			if (stats) {
				this.find('.class').html(
					'Lvl ' + stats.values.level +
					' ' +
					result.class[0].toUpperCase() + result.class.substr(1)
				);
			} else 
				this.find('.class').html('');

			this.el.removeClass('disabled');

			this.characterInfo[charName] = result;
			this.selected = charName;

			let prophecies = result.components.find(function (c) {
				return (c.type === 'prophecies');
			});

			if ((prophecies) && (prophecies.list.indexOf('hardcore') > -1))
				this.find('.name').html(charName + ' (hc)');

			this.find('.btnPlay').removeClass('disabled');

			if (result.permadead) {
				this.find('.name').html(charName + ' (hc - rip)');
				this.find('.btnPlay').addClass('disabled');
			}
		},

		setMessage: function (msg) {
			this.find('.message').html(msg);
		},

		onDeleteClick: function () {
			if (!this.selected)
				return;

			if (this.deleteCount < 3) {
				this.deleteCount++;

				this.setMessage('click delete ' + (4 - this.deleteCount) + ' more time' + ((this.deleteCount === 3) ? '' : 's') + ' to confirm');

				this.find('.btnDelete')
					.removeClass('deleting')
					.addClass('deleting')
					.html('delete (' + (4 - this.deleteCount) + ')');

				return;
			}
			this.onDeleteReset();

			this.el.addClass('disabled');

			client.request({
				cpn: 'auth',
				method: 'deleteCharacter',
				data: {
					name: this.selected
				},
				callback: this.onGetCharacters.bind(this)
			});
		},

		onDeleteReset: function () {
			this.setMessage('');
			this.deleteCount = 0;
			this.find('.btnDelete')
				.removeClass('deleting')
				.html('delete');
		}
	};
});
