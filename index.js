const app = Vue.createApp({
	data() {
		return {
			name: "",
			source: "Any",
			bundle: "Any",
			starter: "Any",
			faction: "Any",
			family: "Any",
			masterypackage: "Any",
			int: "Any",
			cmd: "Any",
			pil: "Any",
			tmp: "Any",
			mw: "Any",
			hull: "Any",
			hmod: "Any",
			smod: "Any",
			turn: "Any",
			imp: "Any",
			inrt: "Any",
			wpower: "Any",
			spower: "Any",
			epower: "Any",
			apower: "Any",
			fa: "Any",
			fore: "Any",
			aft: "Any",
			dhc: "Any",
			exp: "Any",
			hangars: "Any",
			dev: "Any",
			fleet: "Any",
			taccons: "Any",
			engcons: "Any",
			scicons: "Any",
			unicons: "Any",
			weapon: "Any",
			shield: "Any",
			engine: "Any",
			threat: "Any",
			secdef: "Any",
			subtargeting: "Any",
			sensoranalysis: "Any",
			singularity: "Any",
			cloak: "Any",
			flanking: "Any",
			newAbilityType: null,
			newAbilityName: null,
			newAbilityLevel: null,
			newAbilityRank: null,
			abilities: [],
			nextAbilityId: 1,
			filteredShipCount: null,
			allShips: shipdata,
			allAbilities: abilitydata
		}
	},
	computed: {
		rows() { // All the rows to be shown
			
			var ships = this.allShips;
			
			if (this.name !== "") {
				ships = ships.filter(ship => ship.name.toLowerCase().includes(this.name.toLowerCase()));
			}

			if (this.source !== "Any") {
				ships = ships.filter(ship => ship.source===this.source);
			}
			
			if (this.bundle !== "Any") {
				ships = ships.filter(ship => ship.bundle===this.bundle);
			}
			
			if (this.starter !== "Any") {
				ships = ships.filter(ship => ship.starter===this.starter);
			}

			if (this.faction !== "Any") {
				ships = ships.filter(ship => ship.faction===this.faction);
			}

			if (this.family !== "Any") {
				ships = ships.filter(ship => ship.family===this.family);
			}

			if (this.masterypackage !== "Any") {
				ships = ships.filter(ship => ship.masterypackage===this.masterypackage);
			}
			
			if (this.int !== "Any") {
				ships = ships.filter(ship => ship.int===this.int);
			}

			if (this.cmd !== "Any") {
				ships = ships.filter(ship => ship.cmd===this.cmd);
			}

			if (this.pil !== "Any") {
				ships = ships.filter(ship => ship.pil===this.pil);
			}

			if (this.tmp !== "Any") {
				ships = ships.filter(ship => ship.tmp===this.tmp);
			}

			if (this.mw !== "Any") {
				ships = ships.filter(ship => ship.mw===this.mw);
			}

			if (this.hull !== "Any") {
				ships = ships.filter(ship => ship.hull===this.hull);
			}

			if (this.hmod !== "Any") {
				ships = ships.filter(ship => ship.hmod===this.hmod);
			}

			if (this.smod !== "Any") {
				ships = ships.filter(ship => ship.smod===this.smod);
			}

			if (this.turn !== "Any") {
				ships = ships.filter(ship => ship.turn===this.turn);
			}

			if (this.imp !== "Any") {
				ships = ships.filter(ship => ship.imp===this.imp);
			}

			if (this.wpower !== "Any") {
				ships = ships.filter(ship => ship.wpower===this.wpower);
			}

			if (this.spower !== "Any") {
				ships = ships.filter(ship => ship.spower===this.spower);
			}

			if (this.epower !== "Any") {
				ships = ships.filter(ship => ship.epower===this.epower);
			}

			if (this.apower !== "Any") {
				ships = ships.filter(ship => ship.apower===this.apower);
			}

			if (this.inrt !== "Any") {
				ships = ships.filter(ship => ship.inrt===this.inrt);
			}

			if (this.fore !== "Any") {
				ships = ships.filter(ship => ship.fore===this.fore);
			}

			if (this.aft !== "Any") {
				ships = ships.filter(ship => ship.aft===this.aft);
			}

			if (this.fa !== "Any") {
				ships = ships.filter(ship => ship.fa===this.fa);
			}

			if (this.dhc !== "Any") {
				ships = ships.filter(ship => ship.dhc===this.dhc);
			}

			if (this.exp !== "Any") {
				ships = ships.filter(ship => ship.exp===this.exp);
			}

			if (this.hangars !== "Any") {
				ships = ships.filter(ship => ship.hangars===this.hangars);
			}

			if (this.dev !== "Any") {
				ships = ships.filter(ship => ship.dev===this.dev);
			}

			if (this.fleet !== "Any") {
				ships = ships.filter(ship => ship.fleet===this.fleet);
			}

			if (this.taccons !== "Any") {
				ships = ships.filter(ship => ship.taccons===this.taccons);
			}

			if (this.engcons !== "Any") {
				ships = ships.filter(ship => ship.engcons===this.engcons);
			}

			if (this.scicons !== "Any") {
				ships = ships.filter(ship => ship.scicons===this.scicons);
			}

			if (this.unicons !== "Any") {
				ships = ships.filter(ship => ship.unicons===this.unicons);
			}

			if (this.weapon !== "Any") {
				ships = ships.filter(ship => ship.weapon===this.weapon);
			}

			if (this.shield !== "Any") {
				ships = ships.filter(ship => ship.shield===this.shield);
			}

			if (this.engine !== "Any") {
				ships = ships.filter(ship => ship.engine===this.engine);
			}

			if (this.threat  !== "Any") {
				ships = ships.filter(ship => ship.threat===this.threat);
			}
			
			if (this.secdef !== "Any") {
				ships = ships.filter(ship => ship.secdef===this.secdef);
			}

			if (this.subtargeting !== "Any") {
				ships = ships.filter(ship => ship.subtargeting===this.subtargeting);
			}

			if (this.sensoranalysis !== "Any") {
				ships = ships.filter(ship => ship.sensoranalysis===this.sensoranalysis);
			}

			if (this.singularity !== "Any") {
				ships = ships.filter(ship => ship.singularity===this.singularity);
			}

			if (this.cloak !== "Any") {
				ships = ships.filter(ship => ship.cloak===this.cloak);
			}

			if (this.flanking !== "Any") {
				ships = ships.filter(ship => ship.flanking===this.flanking);
			}
			
			if (this.abilities.length > 0) {
				
				let abilities = this.getSortedAbilities();

				let filteredShips = [];	
			
				for (let i = 0; i < ships.length; i++) {
				
					let slots = this.getAbilitySlots(ships[i]);
					let matches = 0;
				
					abilities.forEach( ability => {
						
						let found = false;

						if (ability.spec) {
						
							if (!found) {
								// 1: search for non-universal slot with desired spec
								let result = slots.filter(slot => slot.type !== "Uni" && slot.spec === ability.spec && slot.rank === ability.rank);
								if (result.length) {
									found = true;
									matches++;
									slots = slots.filter(slot => slot.id !== result[0].id);
								}
							}
						
							if (!found) {
								// 2: search for universal slot with desired spec
								let result = slots.filter(slot => slot.type === "Uni" && slot.spec === ability.spec && slot.rank === ability.rank);
								if (result.length) {
									found = true;
									matches++;
									slots = slots.filter(slot => slot.id !== result[0].id);
								}
							}

						} else { // not a specialization ability

							if (!found) {
								// 3: search for specific slot type with null spec
								let result = slots.filter(slot => slot.type === ability.type && slot.spec === null && slot.rank === ability.rank);
								if (result.length) {
									found = true;
									matches++;
									slots = slots.filter(slot => slot.id !== result[0].id);
								}
							}
							
							if (!found) {
								// 4: search for specific slot type with non-null spec
								let result = slots.filter(slot => slot.type === ability.type && slot.spec !== null && slot.rank === ability.rank);
								if (result.length) {
									found = true;
									matches++;
									slots = slots.filter(slot => slot.id !== result[0].id);
								}
							}
							
							if (!found) {
								// 5: search for universal slot with null spec
								let result = slots.filter(slot => slot.type === "Uni" && slot.spec === null && slot.rank === ability.rank);
								if (result.length) {

									// when matching a universal slot the first time, we need to change all the slots in that seat to the type for future searches
									slots.filter(slot => slot.shipseatid === result[0].shipseatid).forEach(obj => obj.type = ability.type);
									
									found = true;
									matches++;
									slots = slots.filter(slot => slot.id !== result[0].id);
								}
							}
							
							if (!found) {
								// 6: search for universal slot with non-null spec
								let result = slots.filter(slot => slot.type === "Uni" && slot.spec !== null && slot.rank === ability.rank);
								if (result.length) {
									
									// when matching a universal slot the first time, we need to change all the slots in that seat to the type for future searches
									slots.filter(slot => slot.shipseatid === result[0].shipseatid).forEach(obj => obj.type = ability.type);

									found = true;
									matches++;
									slots = slots.filter(slot => slot.id !== result[0].id);
								}
							}

						} // end else
						
						
					}); // end for abilities
				
					if (matches == abilities.length) {
						filteredShips.push(ships[i]);	
					}
			
				} // end for ships
			
				ships = filteredShips;
			
			} // end if abilities > 0
			
			console.log("ships.length: " + ships.length);
			
			this.filteredShipCount = ships.length;
			
			return ships;
		},
		sourceOptions() {	
			return this.getOpts("source");
		},
		bundleOptions() {	
			return this.getOpts("bundle");
		},
		starterOptions() {	
			return this.getOpts("starter");
		},
		factionOptions() {	
			return this.getOpts("faction");
		},
		familyOptions() {	
			return this.getOpts("family");
		},
		masterypackageOptions() {	
			return this.getOpts("masterypackage");
		},
		intOptions() {	
			return this.getOpts("int");
		},
		cmdOptions() {	
			return this.getOpts("cmd");
		},
		pilOptions() {	
			return this.getOpts("pil");
		},
		tmpOptions() {	
			return this.getOpts("tmp");
		},
		mwOptions() {	
			return this.getOpts("mw");
		},
		hullOptions() {	
			return this.getOpts("hull");
		},
		hmodOptions() {	
			return this.getOpts("hmod");
		},
		smodOptions() {	
			return this.getOpts("smod");
		},
		turnOptions() {	
			return this.getOpts("turn");
		},
		impOptions() {	
			return this.getOpts("imp");
		},
		inrtOptions() {	
			return this.getOpts("inrt");
		},
		wpowerOptions() {	
			return this.getOpts("wpower");
		},
		spowerOptions() {	
			return this.getOpts("spower");
		},
		epowerOptions() {	
			return this.getOpts("epower");
		},
		apowerOptions() {	
			return this.getOpts("apower");
		},
		foreOptions() {
			return this.getOpts("fore");
		},
		aftOptions() {
			return this.getOpts("aft");
		},
		faOptions() {
			return this.getOpts("fa");
		},
		dhcOptions() {
			return this.getOpts("dhc");
		},
		expOptions() {
			return this.getOpts("exp");
		},
		hangarsOptions() {
			return this.getOpts("hangars");
		},
		devOptions() {
			return this.getOpts("dev");
		},
		fleetOptions() {
			return this.getOpts("fleet");
		},
		tacconsOptions() {
			return this.getOpts("taccons");
		},
		engconsOptions() {
			return this.getOpts("engcons");
		},
		sciconsOptions() {
			return this.getOpts("scicons");
		},
		uniconsOptions() {
			return this.getOpts("unicons");
		},
		weaponOptions() {	
			return this.getOpts("weapon");
		},
		shieldOptions() {	
			return this.getOpts("shield");
		},
		engineOptions() {	
			return this.getOpts("engine");
		},
		threatOptions() {	
			return this.getOpts("threat");
		},
		secdefOptions() {
			return this.getOpts("secdef");
		},
		subtargetingOptions() {
			return this.getOpts("subtargeting");
		},
		sensoranalysisOptions() {
			return this.getOpts("sensoranalysis");
		},
		singularityOptions() {
			return this.getOpts("singularity");
		},
		cloakOptions() {
			return this.getOpts("cloak");
		},
		flankingOptions() {
			return this.getOpts("flanking");
		},
		abilitytypeOptions() {
			return new Set(this.allAbilities.map(a => a.type));
		},
		abilitynameOptions() {
			if (this.newAbilityType === null ) {
				return [];
			}
			return new Set(this.allAbilities.filter(a => a.type === this.newAbilityType).map(a => a.name));
		},
		abilitylevelOptions() {
			if (this.newAbilityType === null || this.newAbilityName === null) {
				return [];
			}
			return this.allAbilities.filter(a => a.type === this.newAbilityType && a.name === this.newAbilityName).map(a => a.level);
		}
	},
	methods:{
		clearNameLevelRank() {
			this.newAbilityName = null;
			this.newAbilityLevel = null;
			this.newAbilityRank = null;
		},
		clearLevelRank() {
			this.newAbilityLevel = null;
			this.newAbilityRank = null;
		},
		setRank(event) {
			if (event.target.value) {
				this.newAbilityRank = this.allAbilities.filter(a => a.type === this.newAbilityType && a.name === this.newAbilityName && a.level === event.target.value)[0].rank;
			} else {
				this.newAbilityRank = null;
			}
		},
		getOpts(key) {
			result = Array.from(new Set(this.allShips.map(item => item[key]))).sort();
			result.unshift("Any");
			
			let opts = [];
			result.forEach(item => {
				var obj = {};
				obj.value = item;
				obj.text = item;
				opts.push(obj);
			});
			
			return opts;
		},
		getAbilitySlots(ship) {
			
			let slots = [];
			var i;
			var rank, type, spec;
			let index = 0;
					
			// seat 1
			if (ship.boff1rank) {
				rank = ship.boff1rank;
				type = ship.boff1type;
				spec = ship.boff1spec;
				
				for (i = rank; i > 0; i--) {
					var obj = {};
					obj.id = index++;
					obj.shipseatid = 1;
					obj.rank = i;
					obj.type = type;
					obj.spec = spec;
					slots.push(obj);
				}
			}
			
			// seat 2
			if (ship.boff2rank) {
				rank = ship.boff2rank;
				type = ship.boff2type;
				spec = ship.boff2spec;
				
				for (i = rank; i > 0; i--) {
					var obj = {};
					obj.id = index++;
					obj.shipseatid = 2;
					obj.rank = i;
					obj.type = type;
					obj.spec = spec;
					slots.push(obj);
				}
			}
			
			// seat 3
			if (ship.boff3rank) {
				rank = ship.boff3rank;
				type = ship.boff3type;
				spec = ship.boff3spec;
				
				for (i = rank; i > 0; i--) {
					var obj = {};
					obj.id = index++;
					obj.shipseatid = 3;
					obj.rank = i;
					obj.type = type;
					obj.spec = spec;
					slots.push(obj);
				}
			}
			
			// seat 4
			if (ship.boff4rank) {
				rank = ship.boff4rank;
				type = ship.boff4type;
				spec = ship.boff4spec;
				
				for (i = rank; i > 0; i--) {
					var obj = {};
					obj.id = index++;
					obj.shipseatid = 4;
					obj.rank = i;
					obj.type = type;
					obj.spec = spec;
					slots.push(obj);
				}
			}
			
			// seat 5
			if (ship.boff5rank) {
				rank = ship.boff5rank;
				type = ship.boff5type;
				spec = ship.boff5spec;
				
				for (i = rank; i > 0; i--) {
					var obj = {};
					obj.id = index++;
					obj.shipseatid = 5;
					obj.rank = i;
					obj.type = type;
					obj.spec = spec;
					slots.push(obj);
				}
			}
			
			// seat 6
			if (ship.boff6rank) {
				rank = ship.boff6rank;
				type = ship.boff6type;
				spec = ship.boff6spec;
				
				for (i = rank; i > 0; i--) {
					var obj = {};
					obj.id = index++;
					obj.shipseatid = 6;
					obj.rank = i;
					obj.type = type;
					obj.spec = spec;
					slots.push(obj);
				}
			}
			
			// sort the ability slots by spec first (nulls at end), then by type ascending so "uni" is last, then by rank descending
			slots.sort(function (a, b) {

				if (a.spec === null && b.spec === null) {
					return (a.type.localeCompare(b.type) || b.rank - a.rank);
				} else if (a.spec !== null && b.spec === null) {
					return -1;
				} else if (a.spec === null && b.spec !== null) {
					return 1;
				}
				return (a.spec.localeCompare(b.spec) || a.type.localeCompare(b.type) || b.rank - a.rank);
			});
			
			return slots;
		},
		getSortedAbilities() {
			
			// "translate" abilities to make things easier later.  This is ugly and I need to figure out a better way to handle this...
			let abilities = [];
			this.abilities.forEach(ability => {
					
				let spec = null;
				let type = null;
				
				switch (ability.type) {
					case "Intelligence":		type = null;	spec = "Int";	break;
					case "Command":					type = null;	spec = "Cmd";	break;
					case "Pilot":						type = null;	spec = "Pil";	break;
					case "Temporal":				type = null;	spec = "Tmp";	break;
					case "Miracle Worker":	type = null;	spec = "MW";	break;
					case "Tactical":				type = "Tac";	spec = null;	break;
					case "Engineering":			type = "Eng";	spec = null;	break;
					case "Science":					type = "Sci";	spec = null;	break;
					default:								type = null;	spec = null;
				}
				
				let obj = {};
				obj.id = ability.id;
				obj.rank = ability.rank;
				obj.type = type;
				obj.spec = spec;
				abilities.push(obj);
			});
			
			// sort the abilities by spec first (nulls at end), then by type ascending so "uni" is last, then by rank descending
			abilities.sort(function (a, b) {
				if (a.spec === null && b.spec === null) {
					return (a.type.localeCompare(b.type) || b.rank - a.rank);
				} else if (a.spec !== null && b.spec === null) {
					return -1;
				} else if (a.spec === null && b.spec !== null) {
					return 1;
				}
				return (a.spec.localeCompare(b.spec) || a.type.localeCompare(b.type) || b.rank - a.rank);
			});
			
			return abilities;
		},
		addNewAbility() {
			this.abilities.push({
				id: this.nextAbilityId++,
				type: this.newAbilityType,
				name: this.newAbilityName,
				level: this.newAbilityLevel,
				rank: this.newAbilityRank,
			})
			this.newAbilityType = null;
			this.newAbilityName = null;
			this.newAbilityLevel = null;
			this.newAbilityRank = null;
		}
	}
})

app.component('ability', {
	template: `
	<div class="field has-addons">
		<div class="control">
			<label class="input">{{ type }} - {{ name }} {{ level }} ({{ rank }})</label>
		</div>
		<div class="control">
			<button @click="$emit('remove')" class="button is-info"><span class="material-icons">&#xe888;</span></button>
		</div>
	</div>
	`,
	props: ['type', 'name', 'level', 'rank'],
	emits: ['remove']
})

app.mount('#app')

