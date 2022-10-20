let lastId = 0;
const list = [];

const complete = id => {
	list.spliceWhere(l => l === id);
};

const register = () => {
	const nextId = ++lastId;
	list.push(nextId);

	return complete.bind(null, nextId);
};

const returnWhenDone = async () => {
	if (!list.length)
		return;

	return new Promise(res => {
		const checker = () => {
			if (!list.length) {
				res();

				return;
			}

			setTimeout(checker, 100);
		};

		checker();
	});
};

module.exports = {
	register,
	returnWhenDone	
};
