const app = Vue.createApp({
	data() {
		return {
			newAbilityType: null,
			newAbilityName: null,
			newAbilityLevel: null,
			newAbilityRank: null,
			abilities: [],
			nextAbilityId: 1,
			newAttributeName: null,
			newAttributeValue: null,
			attributes: [],
			nextAttributeId: 1,
			filteredShipCount: null,
			allShips: shipdata,
			allAbilities: abilitydata,
			allAttributes: attributedata
		}
	},
	computed: {
		rows() { // All the rows to be shown
			
			let ships = this.allShips;
			
			this.allAttributes.forEach( attribute => {

				let filter = new Set(this.attributes.filter(a => a.name==attribute.text).map(a => a.value));
				if (filter.size) {
					ships = ships.filter(ship => filter.has(ship[attribute.value]));
				}

			});

			
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
				
					if (matches === abilities.length) {
						filteredShips.push(ships[i]);	
					}
			
				} // end for ships
			
				ships = filteredShips;
			
			} // end if abilities > 0
			
			//console.log("ships.length: " + ships.length);
			
			this.filteredShipCount = ships.length;
			
			return ships;
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
		},
		attributeNameOptions() {
			return new Set(this.allAttributes.map(a => a.text));
		},
		attributeValueOptions() {
			if (this.newAttributeName === null) {
				return [];
			}
			let key = this.allAttributes.filter(a => a.text === this.newAttributeName)[0].value;
			return this.getOpts(key);
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
		clearAttributeValue() {
			this.newAttributeValue = null;
		},
		getOpts(key) {
			result = Array.from(new Set(this.allShips.map(item => item[key]))).sort();
			
			let opts = [];
			result.forEach(item => {
				let obj = {};
				obj.value = item;
				obj.text = item;
				opts.push(obj);
			});

			return opts;
		},
		getAbilitySlots(ship) {
			
			let slots = [];
			let index = 0;
					
			// seat 1
			if (ship.boff1rank) {
				for (let i = ship.boff1rank; i > 0; i--) {
					let obj = {};
					obj.id = index++;
					obj.shipseatid = 1;
					obj.rank = i;
					obj.type = ship.boff1type;
					obj.spec = ship.boff1spec;
					slots.push(obj);
				}
			}
			
			// seat 2
			if (ship.boff2rank) {
				for (let i = ship.boff2rank; i > 0; i--) {
					let obj = {};
					obj.id = index++;
					obj.shipseatid = 2;
					obj.rank = i;
					obj.type = ship.boff2type;
					obj.spec = ship.boff2spec;
					slots.push(obj);
				}
			}
			
			// seat 3
			if (ship.boff3rank) {
				for (let i = ship.boff3rank; i > 0; i--) {
					let obj = {};
					obj.id = index++;
					obj.shipseatid = 3;
					obj.rank = i;
					obj.type = ship.boff3type;
					obj.spec = ship.boff3spec;
					slots.push(obj);
				}
			}
			
			// seat 4
			if (ship.boff4rank) {
				for (let i = ship.boff4rank; i > 0; i--) {
					let obj = {};
					obj.id = index++;
					obj.shipseatid = 4;
					obj.rank = i;
					obj.type = ship.boff4type;
					obj.spec = ship.boff4spec;
					slots.push(obj);
				}
			}
			
			// seat 5
			if (ship.boff5rank) {
				for (let i = ship.boff5rank; i > 0; i--) {
					let obj = {};
					obj.id = index++;
					obj.shipseatid = 5;
					obj.rank = i;
					obj.type = ship.boff5type;
					obj.spec = ship.boff5spec;
					slots.push(obj);
				}
			}
			
			// seat 6
			if (ship.boff6rank) {
				for (let i = ship.boff6rank; i > 0; i--) {
					let obj = {};
					obj.id = index++;
					obj.shipseatid = 6;
					obj.rank = i;
					obj.type = ship.boff6type;
					obj.spec = ship.boff6spec;
					slots.push(obj);
				}
			}
			
			// sort the ability slots by spec first (nulls at end), then by type ascending so "uni" is last, then by rank descending
			slots.sort((a, b) => {

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
			abilities.sort((a, b) => {
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
		},
		addNewAttribute() {
			this.attributes.push({
				id: this.nextAttributeId++,
				name: this.newAttributeName,
				value: this.newAttributeValue
			})
			this.newAttributeName = null;
			this.newAttributeValue = null;
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

app.component('attribute', {
	template: `
	<div class="field has-addons">
		<div class="control">
			<label class="input">{{ name }} - {{ value }}</label>
		</div>
		<div class="control">
			<button @click="$emit('remove')" class="button is-info"><span class="material-icons">&#xe888;</span></button>
		</div>
	</div>
	`,
	props: ['name', 'value'],
	emits: ['remove']
})

app.mount('#app')

