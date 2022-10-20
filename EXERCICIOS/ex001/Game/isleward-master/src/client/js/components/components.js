define([
	'js/system/events',
	'js/system/globals'
], function (
	events,
	globals
) {
	//Store templates here after loading them
	const templates = [];
	const extenders = [];

	//Bound Methods
	const hookEvent = function (e, cb) {
		if (!this.eventList[e])
			this.eventList[e] = [];

		this.eventList[e].push(cb);
		events.on(e, cb);
	};

	const unhookEvents = function () {
		Object.entries(this.eventList).forEach(([eventName, callbacks]) => {
			callbacks.forEach(c => events.off(eventName, c));
		});
	};

	//Helpers
	const loadComponent = cpn => {
		return new Promise(res => {
			require([cpn.path], tpl => {
				if (cpn.type)
					templates.push(tpl);
				if (cpn.extends)
					extenders.push({ extends: cpn.extends, tpl });
				
				res();
			});
		});
	};

	//Init Methods
	const loadComponents = paths => {
		return Promise.all(
			paths.map(p => loadComponent(p))
		);
	};
	
	const buildComponents = () => {
		templates.forEach(t => {
			const extensions = extenders.filter(e => e.extends === t.type);

			extensions.forEach(e => $.extend(true, t, e.tpl));

			t.eventList = {};
			t.hookEvent = hookEvent;
			t.unhookEvents = unhookEvents;
		});
	};

	//Export
	return {
		init: async function () {
			const paths = globals.clientConfig.clientComponents;

			await loadComponents(paths);

			buildComponents();
		},

		getTemplate: function (type) {
			if (type === 'lightpatch')
				type = 'lightPatch';

			return templates.find(t => t.type === type) || { type: type };
		}
	};
});
