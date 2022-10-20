module.exports = {
	name: 'Fjolarok',
	level: [1, 12],
	resources: {
		Skyblossom: {
			type: 'herb',
			max: 4
		},
		Emberleaf: {
			type: 'herb',
			max: 1,
			cdMax: 1710
		}
	},
	objects: {
		shophermit: {
			properties: {
				cpnNotice: {
					actions: {
						enter: {
							cpn: 'dialogue',
							method: 'talk',
							args: [{
								targetName: 'hermit'
							}]
						},
						exit: {
							cpn: 'dialogue',
							method: 'stopTalk'
						}
					}
				}
			}
		},
		'sun carp school': {
			max: 9,
			type: 'fish',
			quantity: [6, 12]
		},
		fireplace: {
			components: {
				cpnWorkbench: {
					type: 'cooking'
				}
			}
		}
	},
	mobs: {
		default: {
			regular: {
				drops: {
					chance: 40,
					rolls: 1
				}
			}
		},
		'crazed seagull': {
			level: 1,
			attackable: false
		},
		seagull: {
			level: 2,
			regular: {
				drops: {
					chance: 55,
					rolls: 1
				}
			},
			rare: {
				name: 'Crazed Seagull'
			},
			questItem: {
				name: 'Gull Feather',
				sprite: [0, 0]
			}
		},
		bunny: {
			level: 3,
			regular: {
				drops: {
					chance: 50,
					rolls: 1
				}
			},
			rare: {
				count: 0
			},
			questItem: {
				name: "Rabbit's Foot",
				sprite: [0, 1]
			}
		},
		thumper: {
			level: 5,
			cron: '0 * * * *',

			regular: {
				hpMult: 3,
				dmgMult: 3,

				drops: {
					chance: 100,
					rolls: 2,
					magicFind: [1300]
				}
			},
			rare: {
				chance: 100
			}
		},
		elk: {
			level: 4,
			regular: {
				drops: {
					chance: 45,
					rolls: 1
				}
			},
			rare: {
				name: 'Ironhorn'
			},
			questItem: {
				name: 'Elk Antler',
				sprite: [0, 2]
			}
		},
		flamingo: {
			level: 5,
			regular: {
				drops: {
					rolls: 1
				}
			}
		},
		crab: {
			level: 6,

			rare: {
				name: 'Squiggles'
			},
			questItem: {
				name: 'Severed Pincer',
				sprite: [0, 3]
			}
		},
		'titan crab': {
			level: 7,
			rare: {
				name: 'The Pincer King'
			}
		},
		eagle: {
			level: 10,
			regular: {
				drops: {
					rolls: 1,
					noRandom: true,
					alsoRandom: true,
					blueprints: [{
						chance: 3,
						name: 'Eagle Feather',
						material: true,
						sprite: [0, 0],
						spritesheet: 'images/questItems.png'
					}]
				}
			},
			rare: {
				name: 'Fleshripper',
				drops: {
					rolls: 1,
					noRandom: true,
					alsoRandom: true,
					blueprints: [{
						chance: 80,
						name: 'Eagle Feather',
						material: true,
						sprite: [0, 0],
						spritesheet: 'images/questItems.png'
					}]
				}
			}
		},
		hermit: {
			level: 10,
			walkDistance: 0,
			attackable: false,
			rare: {
				count: 0
			},
			properties: {
				cpnTrade: {
					items: {
						min: 3,
						max: 5
					},
					forceItems: [{
						name: 'Flimsy Fishing Rod',
						type: 'Fishing Rod',
						slot: 'tool',
						quality: 0,
						worth: 5,
						sprite: [11, 0],
						infinite: true,
						noSalvage: true
					}, {
						name: 'Skewering Stick',
						material: true,
						sprite: [11, 7],
						worth: 2,
						quality: 0,
						infinite: true
					}],
					level: {
						min: 1,
						max: 5
					},
					markup: {
						buy: 0.25,
						sell: 2.5
					}
				}
			}
		},
		rodriguez: {
			attackable: false,
			level: 10,
			rare: {
				count: 0
			}
		},
		pig: {
			attackable: false,
			level: 3,
			rare: {
				count: 0
			}
		},
		goat: {
			attackable: false,
			level: 3,
			rare: {
				count: 0
			}
		},
		cow: {
			attackable: false,
			level: 3,
			rare: {
				count: 0
			}
		},
		sundfehr: {
			level: 9,
			walkDistance: 0,

			cron: '0 */2 * * *',

			regular: {
				hpMult: 10,
				dmgMult: 1,

				drops: {
					chance: 100,
					rolls: 3,
					magicFind: [2000]
				}
			},

			rare: {
				chance: 0
			},

			spells: [{
				type: 'warnBlast',
				range: 8,
				delay: 9,
				damage: 0.8,
				statMult: 1,
				cdMax: 7,
				targetRandom: true,
				particles: {
					color: {
						start: ['c0c3cf', '929398'],
						end: ['929398', 'c0c3cf']
					},
					spawnType: 'circle',
					spawnCircle: {
						x: 0,
						y: 0,
						r: 12
					},
					randomColor: true,
					chance: 0.03
				}
			}, {
				type: 'projectile',
				damage: 0.4,
				statMult: 1,
				cdMax: 5,
				targetRandom: true,
				row: 2,
				col: 4
			}],

			components: {
				cpnParticles: {
					simplify: function () {
						return {
							type: 'particles',
							blueprint: {
								color: {
									start: ['fc66f7', '802343'],
									end: ['393268', 'de43ae']
								},
								scale: {
									start: {
										min: 10,
										max: 18
									},
									end: {
										min: 4,
										max: 8
									}
								},
								speed: {
									start: {
										min: 6,
										max: 12
									},
									end: {
										min: 2,
										max: 4
									}
								},
								lifetime: {
									min: 5,
									max: 12
								},
								alpha: {
									start: 0.25,
									end: 0
								},
								randomScale: true,
								randomSpeed: true,
								chance: 0.06,
								randomColor: true,
								spawnType: 'rect',
								blendMode: 'add',
								spawnRect: {
									x: -24,
									y: -24,
									w: 48,
									h: 48
								}
							}
						};
					}
				}
			}
		}
	}
};
