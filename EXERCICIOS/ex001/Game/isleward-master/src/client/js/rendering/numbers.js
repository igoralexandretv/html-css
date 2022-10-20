define([
	'js/system/events',
	'js/objects/objects',
	'js/rendering/renderer',
	'js/config'
], function (
	events,
	objects,
	renderer,
	config
) {
	//Create an object of the form: { elementName: elementIntegerColor, ... } from corresponding variable values.
	// These variables are defiend in main.less and take the form: var(--color-element-elementName)
	const elementColors = Object.fromEntries(
		['default', 'arcane', 'frost', 'fire', 'holy', 'poison'].map(e => {
			const variableName = `--color-element-${e}`;
			const variableValue = getComputedStyle(document.documentElement).getPropertyValue(variableName);

			const integerColor = `0x${variableValue.replace('#', '')}`;

			return [e, integerColor];
		})
	);

	return {
		list: [],

		init: function () {
			events.on('onGetDamage', this.onGetDamage.bind(this));
		},

		onGetDamage: function (msg) {
			if (config.damageNumbers === 'off')
				return;

			let target = objects.objects.find(function (o) {
				return (o.id === msg.id);
			});
			if (!target || !target.isVisible)
				return;

			let ttl = 35;

			let numberObj = {
				obj: target,
				amount: msg.amount,
				x: (target.x * scale),
				y: (target.y * scale) + scale - (scale / 4),
				ttl: ttl,
				ttlMax: ttl,
				event: msg.event,
				text: msg.text,
				crit: msg.crit,
				heal: msg.heal,
				element: msg.element
			};

			if (numberObj.event) 
				numberObj.y += (scale / 2);
			else if (numberObj.heal)
				numberObj.x -= scale;
			else
				numberObj.x += scale;

			let text = numberObj.text;
			if (!numberObj.event) {
				let amount = numberObj.amount;
				let div = ((~~(amount * 10) / 10) > 0) ? 10 : 100;
				text = (numberObj.heal ? '+' : '') + (~~(amount * div) / div);
			}

			const colorVariableName = config.damageNumbers === 'element' ? numberObj.element : 'default';
				
			numberObj.sprite = renderer.buildText({
				fontSize: numberObj.crit ? 22 : 18,
				layerName: 'effects',
				x: numberObj.x,
				y: numberObj.y,
				text: text,
				color: elementColors[colorVariableName]
			});

			this.list.push(numberObj);
		},

		update: function () {
			let list = this.list;
			let lLen = list.length;

			for (let i = 0; i < lLen; i++) {
				let l = list[i];
				l.ttl--;

				if (l.ttl === 0) {
					renderer.destroyObject({
						layerName: 'effects',
						sprite: l.sprite
					});
					list.splice(i, 1);
					i--;
					lLen--;
					continue;
				}

				if (l.event)
					l.y += 1;
				else
					l.y -= 1;

				let alpha = l.ttl / l.ttlMax;

				l.sprite.x = ~~(l.x / scaleMult) * scaleMult;
				l.sprite.y = ~~(l.y / scaleMult) * scaleMult;
				l.sprite.alpha = alpha;
			}
		}
	};
});
