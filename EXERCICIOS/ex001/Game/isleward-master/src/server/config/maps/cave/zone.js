module.exports = {
	name: 'The Crystal Caves',
	level: [14, 16],
	addLevel: 0,
	resources: {},
	mobs: {
		default: {
			spells: [{
				type: 'melee',
				element: 'arcane'
			}],

			regular: {
				drops: {
					chance: 35,
					rolls: 1
				}
			}
		},

		'crystal snail': {
			level: 14,

			regular: {
				drops: {
					rolls: 1,
					noRandom: true,
					alsoRandom: true,
					blueprints: [{
						chance: 30,
						name: 'Digested Crystal',
						quality: 0,
						quest: true,
						sprite: [1, 1]
					}]
				}
			},

			spells: [{
				type: 'melee'
			}, {
				type: 'smokeBomb',
				radius: 0,
				repeat: 5,
				duration: 7,
				randomPos: true,
				range: 2,
				selfCast: 0.2,
				statMult: 1,
				damage: 0.125,
				element: 'arcane',
				cdMax: 5,
				particles: {
					scale: {
						start: {
							min: 10,
							max: 25
						},
						end: {
							min: 10,
							max: 0
						}
					},
					opacity: {
						start: 0.3,
						end: 0
					},
					lifetime: {
						min: 1,
						max: 2
					},
					speed: {
						start: 3,
						end: 0
					},
					color: {
						start: ['fc66f7', 'a24eff'],
						end: ['933159', '393268']
					},
					chance: 0.125,
					randomColor: true,
					randomScale: true,
					blendMode: 'add',
					spawnType: 'rect',
					spawnRect: {
						x: -10,
						y: -10,
						w: 20,
						h: 20
					}
				}
			}]
		},

		'crystal whelk': {
			level: 16,

			regular: {
				drops: {
					rolls: 1,
					noRandom: true,
					alsoRandom: true,
					blueprints: [{
						chance: 35,
						name: 'Digested Crystal',
						quality: 0,
						quest: true,
						sprite: [1, 1]
					}]
				}
			},

			spells: [{
				type: 'melee'
			}, {
				type: 'smokeBomb',
				radius: 0,
				repeat: 5,
				duration: 7,
				randomPos: true,
				range: 2,
				selfCast: 0.2,
				statMult: 1,
				damage: 0.25,
				element: 'arcane',
				cdMax: 5,
				particles: {
					scale: {
						start: {
							min: 4,
							max: 14
						},
						end: {
							min: 2,
							max: 8
						}
					},
					opacity: {
						start: 0.2,
						end: 0
					},
					lifetime: {
						min: 1,
						max: 2
					},
					speed: {
						start: 2,
						end: 0
					},
					color: {
						start: ['ff6942', 'ffeb38'],
						end: ['953f36', '9a5a3c']
					},
					chance: 0.125,
					randomColor: true,
					randomScale: true,
					blendMode: 'add',
					spawnType: 'rect',
					spawnRect: {
						x: -10,
						y: -10,
						w: 20,
						h: 20
					}
				}
			}]
		},

		radulos: {
			level: 18,
			spawnCd: 1714,

			regular: {
				hpMult: 75,
				dmgMult: 2,

				drops: {
					chance: 100,
					rolls: 5,
					noRandom: true,
					alsoRandom: true,
					magicFind: [2000, 200],
					blueprints: [{
						chance: 100,
						name: 'Digested Crystal',
						quality: 0,
						quest: true,
						sprite: [1, 1]
					}]
				}
			},
			rare: {
				count: 0
			},

			mobile: false,
			spells: [{
				type: 'projectile',
				particles: {
					scale: {
						start: {
							min: 6,
							max: 18
						},
						end: {
							min: 2,
							max: 8
						}
					},
					color: {
						start: ['fc66f7', 'a24eff'],
						end: ['393268', '933159']
					},
					chance: 0.65,
					randomScale: true,
					randomColor: true
				}
			}, {
				type: 'smokeBomb',
				radius: 1,
				repeat: 4,
				duration: 14,
				randomPos: true,
				range: 6,
				selfCast: 0.25,
				statMult: 1,
				damage: 0.05,
				element: 'arcane',
				cdMax: 8,
				particles: {
					scale: {
						start: {
							min: 6,
							max: 18
						},
						end: {
							min: 4,
							max: 10
						}
					},
					opacity: {
						start: 0.01,
						end: 0
					},
					lifetime: {
						min: 1,
						max: 3
					},
					speed: {
						start: 2,
						end: 0
					},
					color: {
						start: ['ff4252', 'd43346'],
						end: ['802343', 'a82841']
					},
					chance: 0.125,
					randomColor: true,
					randomScale: true,
					blendMode: 'add',
					spawnType: 'rect',
					spawnRect: {
						x: -10,
						y: -10,
						w: 20,
						h: 20
					}
				}
			}, {
				type: 'summonConsumableFollower'
			}]
		},

		'akarei scout': {
			level: 20,
			faction: 'akarei',
			attackable: false,
			deathRep: -3
		},
		biorn: {
			level: 20,
			attackable: false,
			walkDistance: 0,
			faction: 'akarei',
			deathRep: -3
		},
		veleif: {
			level: 20,
			attackable: false,
			walkDistance: 0,
			faction: 'akarei',
			deathRep: -3
		},

		'akarei artificer': {
			level: 20,
			attackable: false,
			faction: 'akarei',
			deathRep: -6
		},
		'thaumaturge yala': {
			level: 20,
			attackable: false,
			walkDistance: 0,
			faction: 'akarei',

			deathRep: -15,

			regular: {
				hpMult: 100,
				dmgMult: 2
			},

			rare: {
				count: 0
			},

			properties: {
				cpnTrade: {
					items: {
						min: 2,
						max: 5,
						minLevel: 14,
						maxLevel: 18,
						slot: 'neck',
						extra: []
					},
					faction: {
						id: 'akarei',
						tier: 5
					},
					markup: {
						buy: 0.25,
						sell: 20
					}
				}
			}
		}
	},
	objects: {
		redwall: {
			components: {
				cpnBlocker: {
					init: function () {
						this.obj.instance.physics.setCollision(this.obj.x, this.obj.y, true);
						this.obj.instance.objects.notifyCollisionChange(this.obj.x, this.obj.y, true);
					}
				}
			}
		},
		bigportal: {
			components: {
				cpnAttackAnimation: {
					simplify: function () {
						return {
							type: 'attackAnimation',
							spriteSheet: 'animBigObjects',
							row: 1,
							col: 0,
							frames: 6,
							frameDelay: 7,
							loop: -1,
							noSprite: true,
							hideSprite: true
						};
					}
				}
			}
		},
		pinktile: {
			components: {
				cpnParticles: {
					simplify: function () {
						return {
							type: 'particles',
							blueprint: {
								color: {
									start: ['fc66f7', 'a24eff'],
									end: ['933159', '393268']
								},
								scale: {
									start: {
										min: 2,
										max: 10
									},
									end: {
										min: 0,
										max: 2
									}
								},
								speed: {
									start: {
										min: 4,
										max: 16
									},
									end: {
										min: 2,
										max: 8
									}
								},
								lifetime: {
									min: 1,
									max: 4
								},
								randomScale: true,
								randomSpeed: true,
								chance: 0.04,
								randomColor: true,
								spawnType: 'rect',
								spawnRect: {
									x: -20,
									y: -20,
									w: 60,
									h: 60
								}
							}
						};
					}
				}
			}
		},
		walltrigger: {
			components: {
				cpnParticles: {
					simplify: function () {
						return {
							type: 'particles',
							blueprint: {
								color: {
									start: ['fff4252', 'ff6942'],
									end: ['802343', 'f953f36']
								},
								scale: {
									start: {
										min: 2,
										max: 6
									},
									end: {
										min: 0,
										max: 2
									}
								},
								speed: {
									start: {
										min: 0,
										max: 4
									},
									end: {
										min: 0,
										max: 0
									}
								},
								lifetime: {
									min: 1,
									max: 2
								},
								randomScale: true,
								randomSpeed: true,
								chance: 0.2,
								randomColor: true,
								spawnType: 'rect',
								spawnRect: {
									x: -20,
									y: -20,
									w: 40,
									h: 40
								}
							}
						};
					}
				},
				cpnTrigger: {
					init: function () {
						this.obj.instance.triggerPuzzle = {
							activated: []
						};
					},
					collisionEnter: function (o) {
						if (!o.player)
							return;

						let order = this.obj.order;
						let triggerPuzzle = this.obj.instance.triggerPuzzle;
						let activated = triggerPuzzle.activated;

						if (this.obj.forceOpen) {
							triggerPuzzle.activated = [];
							this.activate();
							return;
						}

						activated.push(order);
						let valid = true;
						for (let i = 0; i < activated.length; i++) {
							if (~~activated[i] !== i) {
								valid = false;
								break;
							}
						}

						if (!valid) {
							triggerPuzzle.activated = [];

							process.send({
								method: 'events',
								data: {
									onGetAnnouncement: [{
										obj: {
											msg: 'nothing happens'
										},
										to: [o.serverId]
									}]
								}
							});

							return;
						} else if (activated.length === 4) {
							triggerPuzzle.activated = [];
							this.activate();
						}

						process.send({
							method: 'events',
							data: {
								onGetAnnouncement: [{
									obj: {
										msg: this.obj.message
									},
									to: [o.serverId]
								}]
							}
						});
					},
					activate: function () {
						let syncer = this.obj.instance.syncer;
						let physics = this.obj.instance.physics;
						let walls = this.obj.instance.objects.objects.filter(o => (o.objZoneName === 'redWall'));
						walls.forEach(function (w) {
							w.destroyed = true;
							physics.setCollision(w.x, w.y, false);
							this.obj.instance.objects.notifyCollisionChange(w.x, w.y, false);

							syncer.queue('onGetObject', {
								x: w.x,
								y: w.y,
								components: [{
									type: 'attackAnimation',
									row: 0,
									col: 4
								}]
							}, -1);
						}, this);
					}
				}
			}
		},
		gas: {
			components: {
				cpnParticles: {
					simplify: function () {
						return {
							type: 'particles',
							blueprint: {
								color: {
									start: ['c0c3cf', '929398'],
									end: ['69696e', '69696e']
								},
								scale: {
									start: {
										min: 32,
										max: 18
									},
									end: {
										min: 16,
										max: 8
									}
								},
								speed: {
									start: {
										min: 2,
										max: 6
									},
									end: {
										min: 0,
										max: 4
									}
								},
								lifetime: {
									min: 4,
									max: 16
								},
								alpha: {
									start: 0.2,
									end: 0
								},
								randomScale: true,
								randomSpeed: true,
								chance: 0.02,
								randomColor: true,
								spawnType: 'rect',
								blendMode: 'screen',
								spawnRect: {
									x: -80,
									y: -80,
									w: 160,
									h: 160
								}
							}
						};
					}
				}
			}
		},
		bubbles: {
			components: {
				cpnParticles: {
					simplify: function () {
						return {
							type: 'particles',
							blueprint: {
								color: {
									start: ['48edff', '3fa7dd'],
									end: ['69696e', '42548d']
								},
								scale: {
									start: {
										min: 2,
										max: 8
									},
									end: {
										min: 2,
										max: 4
									}
								},
								speed: {
									start: {
										min: 2,
										max: 6
									},
									end: {
										min: 0,
										max: 4
									}
								},
								lifetime: {
									min: 1,
									max: 3
								},
								alpha: {
									start: 0.5,
									end: 0
								},
								randomScale: true,
								randomSpeed: true,
								chance: 0.2,
								randomColor: true,
								spawnType: 'rect',
								blendMode: 'screen',
								spawnRect: {
									x: -20,
									y: -20,
									w: 60,
									h: 60
								}
							}
						};
					}
				}
			}
		},

		shopyala: {
			properties: {
				cpnNotice: {
					actions: {
						enter: {
							cpn: 'dialogue',
							method: 'talk',
							args: [{
								targetName: 'thaumaturge yala'
							}]
						},
						exit: {
							cpn: 'dialogue',
							method: 'stopTalk'
						}
					}
				}
			}
		}
	}
};
