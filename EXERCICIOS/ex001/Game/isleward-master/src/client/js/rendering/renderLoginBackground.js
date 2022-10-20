define([
	'js/system/globals'
], function (
	globals
) {
	let mRandom = Math.random.bind(Math);

	let customRenderer = null;

	const renderCustomLoginBg = async (renderer, path) => {
		if (!customRenderer) {
			await (new Promise(res => {
				require([path], loadedModule => {
					customRenderer = loadedModule;
					res();
				});
			}));
		}

		customRenderer(renderer);
	};

	const renderLoginBackground = renderer => {
		const { loginBgGeneratorPath } = globals.clientConfig;
		if (loginBgGeneratorPath) {
			renderCustomLoginBg(renderer, loginBgGeneratorPath);

			return;
		}

		const { width, height, layers } = renderer;

		renderer.setPosition({
			x: 0,
			y: 0
		}, true);

		let w = Math.ceil(width / scale) + 1;
		let h = Math.ceil(height / scale) + 1;

		const midX = ~~(w / 2);
		const midY = ~~(h / 2);

		const rGrass = 10;
		const rBeach = 2;
		const rShallow = 3;

		const noiseFactor = 3;

		let container = layers.tileSprites;

		for (let i = 0; i < w; i++) {
			for (let j = 0; j < h; j++) {
				let tile = 5;

				let distance = Math.sqrt(Math.pow(i - midX, 2) + Math.pow(j - midY, 2));
				if (distance < rGrass + (Math.random() * noiseFactor))
					tile = 3;
				else if (distance < rGrass + rBeach + (Math.random() * noiseFactor))
					tile = 4;
				else if (distance < rGrass + rBeach + rShallow + (Math.random() * noiseFactor))
					tile = 53;

				let alpha = mRandom();

				if ([5, 53].indexOf(tile) > -1)
					alpha *= 2;

				if (Math.random() < 0.3) {
					tile = {
						5: 6,
						3: 0,
						4: 1,
						53: 54
					}[tile];
				}
				
				let sprite = new PIXI.Sprite(renderer.getTexture('sprites', tile));

				alpha = Math.min(Math.max(0.15, alpha), 0.65);

				sprite.alpha = alpha;
				sprite.position.x = i * scale;
				sprite.position.y = j * scale;
				sprite.width = scale;
				sprite.height = scale;

				if (mRandom() < 0.5) {
					sprite.position.x += scale;
					sprite.scale.x = -scaleMult;
				}

				container.addChild(sprite);
			}
		}
	};

	return renderLoginBackground;
});
