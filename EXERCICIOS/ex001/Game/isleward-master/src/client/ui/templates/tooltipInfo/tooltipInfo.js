define([
	'js/system/events',
	'html!ui/templates/tooltipInfo/template',
	'css!ui/templates/tooltipInfo/styles'
], function (
	events,
	template,
	styles
) {
	return {
		tpl: template,

		lastHp: null,
		lastHpMax: null,
		mob: null,

		postRender: function () {
			this.onEvent('onMobHover', this.onMobHover.bind(this));
		},

		onMobHover: function (mob) {
			this.mob = mob;

			if (!mob) {
				this.el.hide();
				return;
			}

			let values = mob.stats.values;
			this.lastHp = values.hp;
			this.lastHpMax = values.hpMax;

			let html = mob.name + ' (' + mob.stats.values.level + ')';
			if (mob.stats.values.level - 5 >= window.player.stats.values.level)
				html = '<font class="color-red">' + html + '</font>';
			if (mob.aggro) {
				//TODO: Figure this out some other wayh since factions interact in different ways now
				if (mob.aggro.faction === 'hostile')
					html += '<br />aggressive';
			}
			html += '<br />hp: ' + Math.floor(mob.stats.values.hp) + '/' + Math.floor(mob.stats.values.hpMax);

			this.el.show();
			this.el.html(html);
		},

		update: function () {
			let mob = this.mob;
			if (!mob)
				return;

			if (mob.destroyed) {
				this.mob = null;
				this.el.hide();
			} else {
				let values = mob.stats.values;
				if (values.hp !== this.lastHp)
					this.onMobHover(mob);
				else if (values.hpMax !== this.lastHpMax)
					this.onMobHover(mob);
			}
		}
	};
});
