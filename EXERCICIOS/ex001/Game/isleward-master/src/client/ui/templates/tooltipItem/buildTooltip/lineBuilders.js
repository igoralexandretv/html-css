define([
	'js/misc/statTranslations',
	'ui/templates/tooltipItem/buildTooltip/stringifyStatValue'
], function (
	statTranslations,
	stringifyStatValue
) {
	let item = null;
	let compare = null;
	let shiftDown = null;
	let equipErrors = null;

	const init = (_item, _compare, _shiftDown, _equipErrors) => {
		item = _item;
		compare = _compare;
		shiftDown = _shiftDown;
		equipErrors = _equipErrors;
	};

	const lineBuilders = {
		div: (className, children) => {
			if (!children)
				return null;

			if (children.join)
				children = children.join('');

			if (!children.length)
				return null;

			return `<div class="${className}">${children}</div>`;
		},

		name: () => {
			let itemName = item.name;
			if (item.quantity > 1)
				itemName += ' x' + item.quantity;

			return itemName; 
		},

		type: () => {
			if (!item.type || item.type === item.name)
				return null;

			return item.type;
		},

		power: () => {
			if (!item.power)
				return null;

			return (new Array(item.power + 1)).join('+');
		},

		implicitStats: () => {
			if (!item.implicitStats)
				return null;

			const tempImplicitStats = $.extend(true, [], item.implicitStats);

			if (compare && shiftDown && !item.eq) {
				const compareImplicitStats = (compare.implicitStats || []);

				tempImplicitStats.forEach(s => {
					const { stat, value } = s;

					const f = compareImplicitStats.find(c => c.stat === stat);

					if (!f) {
						s.value = `+${value}`;
						return;
					}

					const delta = value - f.value;
					if (delta > 0)
						s.value = `+${delta}`;
					else if (delta < 0)
						s.value = delta;
				});

				compareImplicitStats.forEach(s => {
					if (tempImplicitStats.some(f => f.stat === s.stat))
						return;

					tempImplicitStats.push({
						stat: s.stat,
						value: -s.value
					});
				});
			}

			const html = tempImplicitStats
				.map(({ stat, value }) => {
					let statName = statTranslations.translate(stat);

					const prettyValue = stringifyStatValue(stat, value);

					let rowClass = '';

					if (compare) {
						if (prettyValue.indexOf('-') > -1)
							rowClass = 'loseStat';
						else if (prettyValue.indexOf('+') > -1)
							rowClass = 'gainStat';
					}

					return `<div class="${rowClass}">${prettyValue} ${statName}</div>`;
				})
				.join('');

			const result = (
				lineBuilders.div('space', ' ') +
				html
			);

			return result;
		},

		stats: () => {
			const tempStats = $.extend(true, {}, item.stats);
			const enchantedStats = item.enchantedStats || {};

			if (compare && shiftDown) {
				if (!item.eq) {
					const compareStats = compare.stats;
					for (let s in tempStats) {
						if (compareStats[s]) {
							const delta = tempStats[s] - compareStats[s];
							if (delta > 0)
								tempStats[s] = '+' + delta;
							else if (delta < 0)
								tempStats[s] = delta;
						} else
							tempStats[s] = '+' + tempStats[s];
					}
					for (let s in compareStats) {
						if (!tempStats[s]) 
							tempStats[s] = -compareStats[s];
					}
				}
			} else {
				Object.keys(tempStats).forEach(s => {
					if (enchantedStats[s]) {
						tempStats[s] -= enchantedStats[s];
						if (tempStats[s] <= 0)
							delete tempStats[s];

						tempStats['_' + s] = enchantedStats[s];
					}
				});
			}

			const html = Object.keys(tempStats)
				.map(s => {
					const isEnchanted = (s[0] === '_');
					let statName = s;
					if (isEnchanted)
						statName = statName.substr(1);

					const prettyValue = stringifyStatValue(statName, tempStats[s]);
					statName = statTranslations.translate(statName);

					let rowClass = '';

					if (compare) {
						if (prettyValue.indexOf('-') > -1)
							rowClass = 'loseStat';
						else if (prettyValue.indexOf('+') > -1)
							rowClass = 'gainStat';
					}
					if (isEnchanted)
						rowClass += ' enchanted';

					return `<div class="${rowClass}">${prettyValue} ${statName}</div>`;
				})
				.sort((a, b) => {
					return (a.replace(' enchanted', '').length - b.replace(' enchanted', '').length);
				})
				.sort((a, b) => {
					if (a.indexOf('enchanted') > -1 && b.indexOf('enchanted') === -1)
						return 1;
					else if (a.indexOf('enchanted') === -1 && b.indexOf('enchanted') > -1)
						return -1;

					return 0;
				})
				.join('');

			if (!html)
				return null;

			const result = (
				lineBuilders.div('space', ' ') +
				lineBuilders.div('line', ' ') +
				lineBuilders.div('smallSpace', ' ') +
				html + 
				lineBuilders.div('smallSpace', ' ') +
				lineBuilders.div('line', ' ')
			);

			return result;
		},

		effects: () => {
			if (!item.effects || !item.effects.length || !item.effects[0].text || item.type === 'mtx')
				return null;

			let html = '';

			item.effects.forEach((e, i) => {
				html += e.text;
				if (i < item.effects.length - 1)
					html += '<br />';
			});

			return html;
		},

		material: () => {
			if (item.material)
				return 'crafting material';
		},

		quest: () => {
			if (item.quest)
				return 'quest item';
		},

		spellName: () => {
			if (!item.spell || item.ability)
				return null;

			return (
				lineBuilders.div('space', ' ') +
				lineBuilders.div(`spellName q${item.spell.quality}`, item.spell.name)
			);
		},

		damage: () => {
			if (!item.spell || !item.spell.values)
				return null;

			const abilityValues = Object.entries(item.spell.values)
				.map(([k, v]) => {
					if (!compare || !shiftDown)
						return `${k}: ${v}<br/>`;

					let delta = v - compare.spell.values[k];
					// adjust by EPSILON to handle float point imprecision, otherwise 3.15 - 2 = 1.14 or 2 - 3.15 = -1.14
					// have to move away from zero by EPSILON, not a simple add
					if (delta >= 0) 
						delta += Number.EPSILON;
					else 
						delta -= Number.EPSILON;
					delta = ~~((delta) * 100) / 100;

					let rowClass = '';
					if (delta > 0) {
						rowClass = 'gainDamage';
						delta = '+' + delta;
					} else if (delta < 0) 
						rowClass = 'loseDamage';
						
					return `<div class="${rowClass}">${k}: ${delta}</div>`;
				})
				.join('');

			return abilityValues;
		},

		requires: (className, children) => {
			if (!item.requires && !item.level && (!item.factions || !item.factions.length))
				return null;

			if (equipErrors.length)
				className += ' high-level';

			return (
				lineBuilders.div('space', ' ') +
				lineBuilders.div(className, 'requires')
			);
		},

		requireLevel: className => {
			if (!item.level)
				return null;

			if (equipErrors.includes('level'))
				className += ' high-level';

			const level = item.level.push ? `${item.level[0]} - ${item.level[1]}` : item.level;

			return lineBuilders.div(className, `level: ${level}`);
		},

		requireStats: className => {
			if (!item.requires || !item.requires[0])
				return null;

			if (equipErrors.includes('stats'))
				className += ' high-level';
			
			let html = `${item.requires[0].stat}: ${item.requires[0].value}`;

			return lineBuilders.div(className, html);
		},

		requireFaction: () => {
			if (!item.factions)
				return null;

			let htmlFactions = '';

			item.factions.forEach((f, i) => {
				let htmlF = f.name + ': ' + f.tierName;
				if (f.noEquip)
					htmlF = '<font class="color-red">' + htmlF + '</font>';

				htmlFactions += htmlF;
				if (i < item.factions.length - 1)
					htmlFactions += '<br />';
			});

			return htmlFactions;
		},

		worth: () => {
			if (!item.worthText)
				return null;

			return (
				lineBuilders.div('space', ' ') +
				`value: ${item.worthText}`
			);
		},

		info: () => {
			if (!item.slot)
				return null;

			let text = null;

			if (isMobile && compare && !shiftDown)
				text = 'tap again to compare';
			else if (!shiftDown && compare)
				text = '[shift] to compare';

			if (!text)
				return null;

			return (
				lineBuilders.div('space', ' ') +
				text
			);
		},

		description: () => {
			if (!item.description)
				return null;

			return (
				lineBuilders.div('space', ' ') +
				item.description
			);
		},

		cd: () => {
			if (!item.cd)
				return null;

			return `cooldown: ${item.cd}`;
		},

		uses: () => {
			if (!item.uses)
				return null;
			
			return `uses: ${item.uses}`;
		}
	};

	return {
		init,
		lineBuilders
	};
});
