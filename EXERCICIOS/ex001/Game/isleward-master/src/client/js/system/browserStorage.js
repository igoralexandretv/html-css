define([
	'js/system/browserStorage'
], function (
	browserStorage
) {
	const getEntryName = key => {
		return `iwd_${key.toLowerCase()}`;
	};

	return {
		get: key => {
			const keyName = getEntryName(key);

			const { [keyName]: value = '{unset}' } = localStorage;

			return value;
		},

		set: (key, value) => {
			const keyName = getEntryName(key);

			localStorage.setItem(keyName, value);
		}
	};
});
