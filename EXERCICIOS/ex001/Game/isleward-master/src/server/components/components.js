let fileLister = require('../misc/fileLister');
let events = require('../misc/events');
const componentBase = require('./componentBase');

let onReady = null;

module.exports = {
	components: {},

	init: function (callback) {
		onReady = callback;
		events.emit('onBeforeGetComponents', this.components);
		this.getComponentFolder();
	},

	getComponentFolder: function () {
		const ignoreFiles = ['components.js', 'componentBase.js'];
		const files = fileLister.getFolder('./components/')
			.filter(f => !ignoreFiles.includes(f));

		const fLen = files.length;
		for (let i = 0; i < fLen; i++) 
			this.getComponentFile(`./${files[i]}`);

		onReady();
	},

	getComponentFile: function (path) {
		let cpn = require(path);
		this.onGetComponent(cpn);
	},

	onGetComponent: function (template) {
		template = extend({}, componentBase, template);
		this.components[template.type] = template;
	}
};
