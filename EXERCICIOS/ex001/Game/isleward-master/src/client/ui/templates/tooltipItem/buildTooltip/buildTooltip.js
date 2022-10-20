define([
	'js/input',
	'js/misc/statTranslations',
	'ui/templates/tooltipItem/buildTooltip/lineBuilders',
	'ui/templates/tooltipItem/buildTooltip/getCompareItem'
], function (
	input,
	statTranslations,
	lineBuilders,
	getCompareItem
) {
	const { init: initLineBuilders, lineBuilders: g } = lineBuilders;

	const buildTooltipHtml = ({ quality }) => {
		const html = [
			g.div(`name q${quality}`, g.name()),
			g.div('type', g.type()),
			g.div('power', g.power()),
			g.div('implicitStats', g.implicitStats()),
			g.div('stats', g.stats()),
			g.div('material', g.material()),
			g.div('quest', g.quest()),
			g.spellName(),
			g.div('damage', g.damage()),
			g.div('effects', g.effects()),
			g.div('cd', g.cd()),
			g.div('uses', g.uses()),
			g.div('description', g.description()),
			g.div('worth', g.worth()),
			g.requires('requires'),
			g.requireLevel('level'),
			g.requireStats('stats'),
			g.requireFaction('faction'),
			g.div('info', g.info())
		]
			.filter(t => t !== null)
			.join('');

		return html;
	};

	const buildTooltip = (ui, item, pos, canCompare, bottomAlign) => {
		let shiftDown = input.isKeyDown('shift', true);
		const equipErrors = window.player.inventory.equipItemErrors(item);

		const msg = {
			item,
			compare: null
		};
		getCompareItem(msg);

		const useItem = item = msg.item;
		if (isMobile && useItem === ui.item)
			shiftDown = true;

		const compare = canCompare ? msg.compare : null;

		initLineBuilders(item, compare, shiftDown, equipErrors);

		const contents = buildTooltipHtml(item);

		return contents;
	};

	return buildTooltip;
});
