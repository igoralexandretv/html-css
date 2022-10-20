define([
	'js/system/globals'
], function (
	globals
) {
	return {
		getSheetNum: function (tile) {
			if (tile < 224)
				return 0;
			else if (tile < 480)
				return 1;
			return 2;
		},

		getSheetName: function (tile) {
			const { clientConfig: { atlasTextures } } = globals;

			const sheetNum = this.getSheetNum(tile);
			const sheetName = atlasTextures[sheetNum];

			return sheetName;
		},

		getOffsetAndSheet: function (tile) {
			const { clientConfig: { atlasTextureDimensions, atlasTextures } } = globals;

			let offset = 0;
			let sheetName = null;

			let aLen = atlasTextures.length;
			for (let i = 0; i < aLen; i++) {
				sheetName = atlasTextures[i];

				const dimensions = atlasTextureDimensions[sheetName];
				const spriteCount = dimensions.w * dimensions.h;

				if (offset + spriteCount > tile)
					break;

				offset += spriteCount;
			}

			return {
				offset,
				sheetName
			};
		},

		map: function (tile) {
			const { clientConfig: { tileOpacities } } = globals;

			const { offset, sheetName } = this.getOffsetAndSheet(tile);
			const mappedTile = tile - offset;

			const opacityConfig = tileOpacities[sheetName] || tileOpacities.default;

			let alpha = (opacityConfig[mappedTile] || opacityConfig.default);
			if (opacityConfig.max !== null) {
				alpha = alpha + (Math.random() * (alpha * 0.2));
				alpha = Math.min(1, alpha);
			}

			return alpha;
		},

		canFlip: function (tile) {
			const { clientConfig: { tilesNoFlip } } = globals;

			const { offset, sheetName } = this.getOffsetAndSheet(tile);
			const mappedTile = tile - offset;

			const noFlipTiles = tilesNoFlip[sheetName];
			if (!noFlipTiles)
				return true;

			return !noFlipTiles.includes(mappedTile);
		}
	};
});
