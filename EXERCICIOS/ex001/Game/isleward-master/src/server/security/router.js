const { routerConfig: { signatures, allowed, allowTargetId, secondaryAllowed, globalAllowed, secondaryAllowTargetId } } = require('./routerConfig');

module.exports = {
	allowedCpn: function (msg) {
		const { cpn, method, data: { cpn: secondaryCpn, method: secondaryMethod, targetId } } = msg;

		const valid = allowed[cpn] && allowed[cpn].includes(method);
		if (!valid)
			return false;

		if (!secondaryCpn) {
			if (targetId !== undefined) {
				const canHaveTargetId = allowTargetId?.[cpn]?.includes(method);
				if (!canHaveTargetId)
					return false;
			}

			return true;
		}

		const secondaryValid = secondaryAllowed?.[secondaryCpn]?.includes(secondaryMethod);
		if (!secondaryValid)
			return false;

		if (targetId !== undefined) {
			const canHaveTargetId = secondaryAllowTargetId?.[secondaryCpn]?.includes(secondaryMethod);
			if (!canHaveTargetId)
				return false;
		}

		return true;
	},

	allowedGlobal: function (msg) {
		const result = globalAllowed[msg.module] && globalAllowed[msg.module].includes(msg.method);

		return result;
	},

	allowedGlobalCall: function (threadModule, method) {
		const result = globalAllowed[threadModule] && globalAllowed[threadModule].includes(method);

		return result;
	},

	keysCorrect: function (obj, keys) {
		const foundIncorrect = keys.some(({ key, dataType, optional, spec }) => {
			if (!Object.hasOwnProperty.call(obj, key)) {
				if (optional)
					return false;

				return true;
			}

			const value = obj[key];

			if (dataType === 'string' || dataType === 'boolean')
				return dataType !== typeof(value);
			else if (dataType === 'numberOrString')
				return (typeof(value) !== 'string' && !Number.isFinite(value));
			else if (dataType === 'integerOrString')
				return (typeof(value) !== 'string' && !Number.isInteger(value));
			else if (dataType === 'integer')
				return !Number.isInteger(value);
			else if (dataType === 'integerNullOrObject') {
				const isCorrect = (
					Number.isInteger(value) ||
					value === null ||
					(
						typeof(value) === 'object' &&
						this.keysCorrect(value, spec)
					)
				);

				return !isCorrect;
			} else if (dataType === 'integerNullObjectOrString') {
				const isCorrect = (
					Number.isInteger(value) ||
					typeof(dataType) === 'string' ||
					value === null ||
					(
						typeof(value) === 'object' &&
						this.keysCorrect(value, spec)
					)
				);

				return !isCorrect;
			} else if (dataType === 'arrayOfStrings')
				return (!Array.isArray(value) || value.some(v => typeof(v) !== 'string'));
			else if (dataType === 'arrayOfIntegers')
				return (!Array.isArray(value) || value.some(v => !Number.isInteger(v)));
			else if (dataType === 'arrayOfObjects') {
				if (!Array.isArray(value) || value.some(v => v === null || typeof(v) !== 'object'))
					return true;

				const foundIncorrectObject = value.some(v => !this.keysCorrect(v, spec));
				if (foundIncorrectObject) 
					return true;

				return foundIncorrectObject;
			} else if (dataType === 'object') {
				if (typeof(value) !== 'object' || value === null)
					return true;

				if (!spec)
					return false;

				const foundIncorrectObject = !this.keysCorrect(value, spec);
				if (foundIncorrectObject) 
					return true;

				return foundIncorrectObject;
			} else if (dataType === 'stringOrNull')
				return (typeof(value) !== 'string' && value !== null);

			return true;
		});

		if (foundIncorrect)
			return false;

		const foundInvalid = Object.keys(obj).some(o => !keys.some(k => k.key === o));

		return !foundInvalid;
	},

	signatureCorrect: function (msg, config) {
		if (config.callback !== 'deferred') {
			if (config.callback === true && !msg.callback)
				return false;
			else if (config.callback === false && !!msg.callback)
				return false;
		}

		const expectKeys = config.data;

		const keysCorrect = this.keysCorrect(msg.data, expectKeys);

		return keysCorrect;
	},

	isMsgValid: function (msg, source) {
		let signature;

		if (msg.module) {
			if (msg.threadModule !== undefined || msg.cpn !== undefined || msg.data.cpn !== undefined) 
				return false;

			signature = signatures.global[msg.module]?.[msg.method];
		} else if (msg.threadModule) {
			if (msg.module !== undefined || msg.cpn !== undefined || msg.data.cpn !== undefined) 
				return false;

			signature = signatures.threadGlobal[msg.threadModule]?.[msg.method];
		} else if (msg.cpn) {
			if (msg.module !== undefined || msg.threadModule !== undefined) 
				return false;

			signature = signatures.cpnMethods[msg.cpn]?.[msg.method];
		}

		if (!signature) 
			return false;

		const result = this.signatureCorrect(msg, signature);

		if (!result || msg.cpn !== 'player' || msg.method !== 'performAction') {
			if (result && signature.allowWhenIngame === false && source?.name !== undefined)
				return false;

			return result;
		}

		const signatureThreadMsg = signatures.threadCpnMethods[msg.data.cpn]?.[msg.data.method];

		if (!signatureThreadMsg) 
			return false;

		const resultSub = this.signatureCorrect(msg.data, signatureThreadMsg);

		return resultSub;
	}
};
