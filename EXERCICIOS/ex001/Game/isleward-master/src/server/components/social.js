const chat = require('./social/chat');

module.exports = {
	type: 'social',

	isPartyLeader: null,
	partyLeaderId: null,
	party: null,

	customChannels: null,
	blockedPlayers: [],

	actions: null,

	messageHistory: [],

	maxChatLength: 255,

	init: function (blueprint) {
		this.obj.extendComponent('social', 'socialCommands', {});

		if (blueprint)
			this.blockedPlayers = blueprint.blockedPlayers || [];
	},

	simplify: function (self) {
		const { party, customChannels, blockedPlayers, actions } = this;

		const res = {
			type: 'social',
			party
		};

		if (self) {
			Object.assign(res, {
				actions,
				customChannels,
				blockedPlayers
			});
		}

		return res;
	},

	save: function () {
		return {
			type: 'social',
			customChannels: this.customChannels,
			blockedPlayers: this.blockedPlayers
		};
	},

	sendMessage: function (msg, color, target) {
		(target || this.obj).socket.emit('event', {
			event: 'onGetMessages',
			data: {
				messages: [{
					class: color || 'q0',
					message: msg,
					type: 'chat'
				}]
			}
		});
	},

	chat: function (msg) {
		chat(this, msg);
	},

	dc: function () {
		if (!this.party)
			return;

		this.leaveParty();
	},

	//This gets called on the target player
	getInvite: function (msg) {
		if (this.party)
			return;

		let obj = this.obj;
		let sourceId = msg.data.sourceId;

		if (sourceId === obj.id)
			return;

		let source = cons.players.find(c => c.id === sourceId);
		if (!source || !source.social)
			return;

		source.social.sendMessage('invite sent', 'color-yellowB');
		this.sendMessage(source.name + ' has invited you to join a party', 'color-yellowB');

		this.obj.socket.emit('event', {
			event: 'onGetInvite',
			data: sourceId
		});
	},

	//This gets called on the player that initiated the invite
	acceptInvite: function (msg) {
		let sourceId = msg.data.sourceId;
		let source = cons.players.find(c => c.id === sourceId);
		if (!source)
			return;

		if (!this.party) {
			this.isPartyLeader = true;
			this.party = [this.obj.id];
			this.updateMainThread('party', this.party);
		}

		// Only add if not yet in party
		if (!this.party.find(id => (id === sourceId)))
			this.party.push(sourceId);

		this.updateMainThread('party', this.party);

		this.party.forEach(function (p) {
			let player = cons.players.find(c => c.id === p);
			player.social.party = this.party;
			player.social.updateMainThread('party', player.social.party);

			let returnMsg = source.name + ' has joined the party';
			if (p === sourceId)
				returnMsg = 'you have joined a party';
			player.social.sendMessage(returnMsg, 'color-yellowB');

			player
				.socket.emit('event', {
					event: 'onGetParty',
					data: this.party
				});
		}, this);
	},
	declineInvite: function (msg) {
		let targetId = msg.data.targetId;
		let target = cons.players.find(c => c.id === targetId);
		if (!target)
			return;

		this.sendMessage(target.name + ' declined your party invitation', 'color-redA');
	},

	//Gets called on the player that requested to leave
	leaveParty: function (msg) {
		if (!this.party)
			return;

		let name = this.obj.name;

		this.party.spliceWhere(p => p === this.obj.id);

		this.party.forEach(function (p) {
			let player = cons.players.find(c => c.id === p);

			let messages = [{
				class: 'q0',
				message: name + ' has left the party'
			}];
			let party = this.party;
			if (this.party.length === 1) {
				messages.push({
					class: 'q0',
					message: 'your group has been disbanded'
				});

				player.social.isPartyLeader = false;
				player.social.party = null;
				player.social.updateMainThread('party', player.social.party);
				party = null;
			}

			player.socket.emit('events', {
				onGetParty: [party],
				onGetMessages: [{
					messages: messages
				}]
			});
		}, this);

		this.obj.socket.emit('events', {
			onGetParty: [
				[]
			],
			onGetMessages: [{
				messages: {
					class: 'q0',
					message: 'you have left the party'
				}
			}]
		});

		if ((this.isPartyLeader) && (this.party.length >= 2)) {
			let newLeader = cons.players.find(c => c.id === this.party[0]).social;
			newLeader.isPartyLeader = true;
			this.party.forEach(function (p) {
				let returnMsg = newLeader.obj.name + ' is now the party leader';
				if (p === newLeader.obj.id)
					returnMsg = 'you are now the party leader';

				cons.players.find(c => c.id === p).socket.emit('events', {
					onGetMessages: [{
						messages: [{
							class: 'q0',
							message: returnMsg
						}]
					}]
				});
			}, this);
		}

		this.party = null;
		this.updateMainThread('party', this.party);
	},

	//Gets called on the player that requested the removal
	removeFromParty: function (msg) {
		if (!this.isPartyLeader) {
			this.sendMessage('you are not the party leader', 'color-redA');
			return;
		}

		let target = cons.players.find(c => c.id === msg.data.id);
		if (!target)
			return;

		this.party.spliceWhere(p => p === target.id);

		this.party.forEach(function (p) {
			cons.players.find(c => c.id === p)
				.socket.emit('events', {
					onGetParty: [this.party],
					onGetMessages: [{
						messages: [{
							class: 'color-yellowB',
							message: target.name + ' has been removed from the party'
						}]
					}]
				});
		}, this);

		target.socket.emit('events', {
			onGetMessages: [{
				messages: [{
					class: 'color-redA',
					message: 'you have been removed from the party'
				}]
			}],
			onPartyDisband: [{}]
		});

		target.social.party = null;
		target.social.isPartyLeader = false;
		target.social.updateMainThread('party', target.social.party);

		if (this.party.length === 1) {
			this.party = null;
			this.isPartyLeader = null;
			this.updateMainThread('party', this.party);

			this.sendMessage('your party has been disbanded', 'color-yellowB');
		}
	},

	updateMainThread: function (property, value) {
		atlas.updateObject(this.obj, {
			components: [{
				type: 'social',
				[property]: value
			}]
		});
	},

	//Sends a notification to yourself
	// arg1 = { message, className, type }
	notifySelf: function ({ message, className = 'color-redA', type = 'info', subType }) {
		const { obj: { id, serverId, instance: { syncer } } } = this;

		syncer.queue('onGetMessages', {
			id,
			messages: [{
				class: className,
				message,
				type,
				subType
			}]
		}, [serverId]);
	},

	//Sends multiple notifications to yourself
	// messages = [{ msg, className, type }]
	notifySelfArray: function (messages) {
		const { obj: { id, serverId, instance: { syncer } } } = this;

		messages.forEach(m => {
			const { className = 'color-redA', type = 'info', subType } = m;
			m.class = className;
			m.type = type;
			m.subType = subType;
		});

		syncer.queue('onGetMessages', {
			id,
			messages
		}, [serverId]);
	}
};
