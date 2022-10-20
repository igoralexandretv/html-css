//Config
const validModPatterns = ['.png', '/ui/', '/clientComponents/', '/audio/'];

//Methods
const appRoot = (req, res) => {
	res.sendFile('index.html');
};

const appFile = (req, res) => {
	let root = req.url.split('/')[1];
	let file = req.params[0];
	
	file = file.replace('/' + root + '/', '');

	const validRequest = (
		root !== 'server' ||
		(
			root === 'server' &&
			file.startsWith('clientComponents/')
		) ||
		(
			file.includes('mods/') &&
			validModPatterns.some(v => file.includes(v))
		)
	);
	
	if (!validRequest)
		return null;
	
	res.sendFile(file, {
		root: '../' + root
	});
};

//Exports
module.exports = {
	appRoot,
	appFile
};
