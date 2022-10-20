module.exports = {
	hermit: {
		1: {
			msg: [{
				msg: 'Nice to see you again. How can I help?',
				options: [1.1, 1.2, 1.3, 1.4]
			}],
			options: {
				1.1: {
					msg: 'What are you doing in the middle of the wilderness?',
					goto: 2
				},
				1.2: {
					msg: 'Have you scavenged anything worth selling lately?',
					goto: 'tradeBuy'
				},
				1.3: {
					msg: 'I have some items you might be interested in.',
					goto: 'tradeSell'
				},
				1.4: {
					msg: 'I changed my mind, I want to buy something back.',
					goto: 'tradeBuyback'
				}
			}
		},
		2: {
			msg: 'I ran into some trouble in the city a few years ago. Moving out here seemed preferable to taking up residence in prison.',
			options: {
				2.1: {
					msg: 'Trouble? What kind of trouble?',
					goto: '2-1'
				},
				2.2: {
					msg: 'Where is the city?',
					goto: '2-2'
				},
				2.3: {
					msg: 'I\'d like to ask something else.',
					goto: 1
				}
			}
		},
		'2-1': {
			msg: 'Let\'s just say it was of a royal nature. There are those who would still like to see me in prison, or better yet; dead.',
			options: {
				'2-1.1': {
					msg: 'I\'d like to ask something else',
					goto: 2
				}
			}
		},
		'2-2': {
			msg: 'It\'s on the northern part of the island. Just don\'t let your tongue slip about my location.',
			options: {
				'2-2.1': {
					msg: 'I\'d like to ask something else',
					goto: 2
				}
			}
		},
		tradeBuy: {
			cpn: 'trade',
			method: 'startBuy',
			args: [{
				targetName: 'hermit'
			}]
		},
		tradeSell: {
			cpn: 'trade',
			method: 'startSell',
			args: [{
				targetName: 'hermit'
			}]
		},
		tradeBuyback: {
			cpn: 'trade',
			method: 'startBuyback',
			args: [{
				targetName: 'hermit'
			}]
		}
	}
};
