let blacklist = [
	'anal',
	'anilingus',
	'anus',
	'areola',
	'b1tch',
	'ballsack',
	'bitch',
	'blowjob',
	'boner',
	'boob',
	'bukkake',
	'cameltoe',
	'carpetmuncher',
	'chinc',
	'chink',
	'chode',
	'clit',
	'cock',
	'coital',
	'coon',
	'cum',
	'cunilingus',
	'cunnilingus',
	'cunt',
	'dick',
	'dike',
	'dildo',
	'dong',
	'dyke',
	'ejaculate',
	'erection',
	'fack',
	'fag',
	'felch',
	'fellate',
	'fellatio',
	'feltch',
	'foreskin',
	'fuck',
	'fuk',
	'goatse',
	'goldenshower',
	'handjob',
	'hardon',
	'hitler',
	'horny',
	'jerkoff',
	'jism',
	'jiz',
	'kkk',
	'labia',
	'lesbo',
	'lezbo',
	'masterbat',
	'masturbat',
	'menstruat',
	'muff',
	'nazi',
	'negro',
	'nigga',
	'niger',
	'nigger',
	'nipple',
	'nympho',
	'oral',
	'orgasm',
	'orgies',
	'orgy',
	'pantie',
	'panty',
	'pedo',
	'penetrat',
	'penial',
	'penile',
	'penis',
	'phalli',
	'phuck',
	'piss',
	'pms',
	'poon',
	'porn',
	'prostitut',
	'pube',
	'pubic',
	'pubis',
	'puss',
	'pussies',
	'pussy',
	'puto',
	'queaf',
	'queef',
	'queer',
	'rape',
	'rapist',
	'rectal',
	'rectum',
	'rectus',
	'reich',
	'rimjob',
	'schlong',
	'scrote',
	'scrotum',
	'semen',
	'sex',
	'shit',
	'skank',
	'slut',
	'sodomize',
	'sperm',
	'spunk',
	'stfu',
	'tampon',
	'tard',
	'testes',
	'testicle',
	'testis',
	'tits',
	'tramp',
	'turd',
	'twat',
	'undies',
	'urinal',
	'urine',
	'uterus',
	'vag',
	'vagina',
	'viagra',
	'virgin',
	'vulva',
	'wang',
	'wank',
	'weiner',
	'wetback',
	'whoralicious',
	'whore',
	'whoring',
	'wigger',
	'gaes',
	'gaez',
	'nogger'
];

module.exports = {
	tree: {},

	init: function () {
		blacklist.forEach(c => {
			this.buildPath(c);
		});
	},

	buildPath: function (chain, node) {
		node = node || this.tree;
		const letter = chain[0];

		if (!node[letter])
			node[letter] = {};

		if (chain.length > 1)
			this.buildPath(chain.substr(1), node[letter]);
	},

	isClean: function (text, finalLevel) {
		text = text
			.toLowerCase();

		const tree = this.tree;

		let tLen = text.length;
		for (let i = 0; i < tLen; i++) {
			let node = tree;

			for (let j = i; j < tLen; j++) {
				node = node[text[j]];
				if (!node)
					break;
				else if (Object.keys(node).length === 0)
					return false;
			}
		}

		if (!finalLevel)
			return this.isClean(text.replace(/[^\w\s]|(.)(?=\1)/gi, ''), true);

		return true;
	}
};
