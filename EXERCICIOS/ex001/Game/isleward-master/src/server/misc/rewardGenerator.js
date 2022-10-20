const defaultConfig = [{
	name: 'Iron Bar',
	sprite: [0, 0],
	quality: 0,
	chance: 15
}, {
	name: 'Cloth Scrap',
	sprite: [0, 1],
	quality: 0,
	chance: 15
}, {
	name: 'Leather Scrap',
	sprite: [0, 7],
	quality: 0,
	chance: 15
}, {
	name: 'Skyblossom',
	sprite: [1, 2],
	quality: 0,
	chance: 8
}, {
	name: 'Common Essence',
	sprite: [0, 2],
	quality: 0,
	chance: 5
}, {
	name: 'Magic Essence',
	sprite: [0, 3],
	quality: 1,
	chance: 2
}, {
	name: 'Rare Essence',
	sprite: [0, 4],
	quality: 2,
	chance: 1
}];

const buildPool = config => {
	const pool = [];

	config.forEach(c => {
		for (let i = 0; i < c.chance; i++) 
			pool.push(c.name);
	});

	return pool;
};

const defaultPool = buildPool(defaultConfig);

module.exports = (itemCount, useConfig) => {
	const config = useConfig || defaultConfig;
	const pool = useConfig ? buildPool(useConfig) : defaultPool;

	const items = [];
		
	for (let i = 0; i < itemCount; i++) {
		let pickName = pool[~~(Math.random() * pool.length)];
		const pick = config.find(f => f.name === pickName);

		let item = items.find(f => f.name === pickName);
		if (!item) {
			items.push({
				name: pick.name,
				material: true,
				quality: pick.quality,
				sprite: pick.sprite,
				quantity: pick.quantity || 1
			});
		} else
			item.quantity += (pick.quantity || 1);
	}

	return items;
};

