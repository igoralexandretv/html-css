define([
	'js/system/browserStorage'
], function (
	browserStorage
) {
	const config = {
		showNames: true,
		showQuests: 'on',
		showEvents: true,
		playAudio: true,
		qualityIndicators: 'off',
		unusableIndicators: 'off',
		rememberChatChannel: true,
		soundVolume: 100,
		musicVolume: 100,
		partyView: 'full',
		damageNumbers: 'element'
	};

	const valueChains = {
		partyView: ['full', 'compact', 'minimal'],
		showQuests: ['on', 'minimal', 'off'],
		qualityIndicators: ['border', 'bottom', 'background', 'off'],
		unusableIndicators: ['off', 'border', 'top', 'background'],
		damageNumbers: ['element', 'white', 'off']
	};

	const getNextValue = key => {
		const currentValue = config[key];
		const chain = valueChains[key];
		const currentIndex = chain.indexOf(currentValue);

		const nextValue = chain[(currentIndex + 1) % chain.length];

		return nextValue;
	};

	const getKeyName = key => {
		return `opt_${key.toLowerCase()}`;
	};

	config.set = (key, value) => {
		config[key] = value;

		browserStorage.set(getKeyName(key), config[key]);
	};

	config.toggle = key => {
		if (valueChains[key])
			config[key] = getNextValue(key);
		else
			config[key] = !config[key];

		browserStorage.set(getKeyName(key), config[key]);
	};

	const loadValue = key => {
		const currentValue = browserStorage.get(getKeyName(key));

		if (currentValue === '{unset}')
			return;

		if (['true', 'false'].includes(currentValue))
			config[key] = currentValue === 'true';
		else if (~~currentValue === parseInt(currentValue))
			config[key] = ~~currentValue;
		else
			config[key] = currentValue;
	};

	Object.keys(config).forEach(key => loadValue(key) );

	return config;
});
