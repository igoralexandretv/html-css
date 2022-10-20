define([
	'js/system/events'
], function (
	events
) {
	return {
		type: 'social',

		customChannels: null,
		blockedPlayers: null,

		init: function (blueprint) {
			if (this.customChannels)
				events.emit('onGetCustomChatChannels', this.customChannels);

			if (blueprint.blockedPlayers)
				this.blockedList = blueprint.blockedList;

			if (blueprint.actions) {
				this.actions = blueprint.actions;
				events.emit('onGetSocialActions', this.actions);
			}
		},

		extend: function (blueprint) {
			if (blueprint.blockedPlayers)
				this.blockedPlayers = blueprint.blockedPlayers;
		},

		isPlayerBlocked: function (playerName) {
			if (!this.blockedPlayers)
				return false;

			return this.blockedPlayers.includes(playerName);
		}
	};
});
