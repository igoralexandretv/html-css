//eslint-disable-next-line no-extend-native
Array.prototype.spliceWhere = function (callback, thisArg) {
	let T = thisArg;
	let O = Object(this);
	let len = O.length >>> 0;

	let k = 0;

	while (k < len) {
		let kValue;

		if (k in O) {
			kValue = O[k];

			if (callback.call(T, kValue, k, O)) {
				O.splice(k, 1);
				k--;
			}
		}
		k++;
	}
};

//eslint-disable-next-line no-extend-native
Array.prototype.spliceFirstWhere = function (callback, thisArg) {
	let T = thisArg;
	let O = Object(this);
	let len = O.length >>> 0;

	let k = 0;

	while (k < len) {
		let kValue;

		if (k in O) {
			kValue = O[k];

			if (callback.call(T, kValue, k, O)) {
				O.splice(k, 1);
				return kValue;
			}
		}
		k++;
	}
};

//eslint-disable-next-line no-extend-native
Object.defineProperty(Object.prototype, 'has', {
	enumerable: false,
	value: function (prop) {
		//eslint-disable-next-line no-undefined
		return (this.hasOwnProperty(prop) && this[prop] !== undefined && this[prop] !== null);
	}
});

if (!String.prototype.padStart) {
	//eslint-disable-next-line no-extend-native
	String.prototype.padStart = function padStart (targetLength, padString) {
		targetLength = targetLength >> 0;
		padString = String(typeof padString !== 'undefined' ? padString : ' ');
		if (this.length >= targetLength)
			return String(this);

		targetLength = targetLength - this.length;
		if (targetLength > padString.length)
			padString += padString.repeat(targetLength / padString.length);

		return padString.slice(0, targetLength) + String(this);
	};
}

window._ = {
	get2dArray: function (w, h, def) {
		def = def || 0;

		let result = [];
		for (let i = 0; i < w; i++) {
			let inner = [];
			for (let j = 0; j < h; j++) {
				if (def === 'array')
					inner.push([]);
				else
					inner.push(def);
			}

			result.push(inner);
		}

		return result;
	},

	toggleFullScreen: function () {
		let doc = window.document;
		let docEl = doc.documentElement;

		let requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
		let cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

		if (!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement)
			requestFullScreen.call(docEl);

		else
			cancelFullScreen.call(doc);
	},

	isIos: function () {
		return (
			[
				'iPad Simulator',
				'iPhone Simulator',
				'iPod Simulator',
				'iPad',
				'iPhone',
				'iPod'
			].includes(navigator.platform) ||
			(navigator.userAgent.includes('Mac') && 'ontouchend' in document)
		);
	}
};

define([], function () {
	const urlParams = Object.fromEntries(window.location.search.substr(1).split('&').map(k => k.split('=')));

	window.isMobile = (
		urlParams.forceMobile === 'true' ||
		/Mobi|Android/i.test(navigator.userAgent) ||
		(
			navigator.platform === 'MacIntel' &&
			navigator.maxTouchPoints > 1
		)
	);

	window.scale = isMobile ? 32 : 40;
	window.scaleMult = isMobile ? 4 : 5;

	if (!window.navigator.vibrate)
		window.navigator.vibrate = () => {};

	return window._;
});
