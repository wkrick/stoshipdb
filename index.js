const app = Vue.createApp({
	data() {
		return {
			newAbilityType: "",
			newAbilityName: "",
			newAbilityLevel: "",
			newAbilityRank: "",
			abilities: [],
			nextAbilityId: 1,
			newAttributeName: "",
			newAttributeComparison: "=",
			newAttributeValue: "",
			attributes: [],
			nextAttributeId: 1,
			newColumnName: "",
			columns: [],
			nextColumnId: 1,
			filteredShipCount: null,
			allShips: shipdata,
			allAbilities: abilitydata,
			allAttributes: attributedata
		}
	},
	computed: {
		rows() { // All the rows to be shown
			
			let ships = this.allShips;
			
			this.attributes.forEach( a => {
				
				let key = this.allAttributes.filter(aa => aa.text === a.name)[0].key;
						
					if (a.comparison === ">=") {
						ships = ships.filter(ship => ship[key] >= a.value);
					} else if (a.comparison === "<=") {
						ships = ships.filter(ship => ship[key] <= a.value);
					} else {
						ships = ships.filter(ship => ship[key] === a.value);
					}
				
			})

			
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
			
			this.filteredShipCount = ships.length;
			
			return ships;
		},
		abilitytypeOptions() {
			return [...new Set(this.allAbilities.map(a => a.type))];
		},
		abilitynameOptions() {
			if (!this.newAbilityType) {
				return [];
			}
			return [...new Set(this.allAbilities.filter(a => a.type === this.newAbilityType).map(a => a.name))];
		},
		abilitylevelOptions() {
			if (!this.newAbilityType || !this.newAbilityName) {
				return [];
			}
			return this.allAbilities.filter(a => a.type === this.newAbilityType && a.name === this.newAbilityName).map(a => a.level);
		},
		attributeNameOptions() {
			return this.allAttributes.map(a => a.text);
		},
		attributeValueOptions() {
			if (!this.newAttributeName) {
				return [];
			}
			let key = this.allAttributes.filter(a => a.text === this.newAttributeName)[0].key;
			return this.getOpts(key);
		},
		columnNameOptions() {
			return this.allAttributes.map(a => a.text);
		},
		filteredColumns() {
			let selectedColumns = new Set(this.columns.map(a => a.name));
			let cols = [];
			
			this.allAttributes.forEach(aa => {
				if (selectedColumns.has(aa.text)) {
					let obj = {};
					obj.text = aa.text;
					obj.key = aa.key;
					cols.push(obj);
				}
				
			});

			return cols;
		}
	},
	watch: {
		newAttributeName() {
			this.newAttributeComparison = "=";
			this.newAttributeValue = "";
		},
		newAbilityType() {
			this.newAbilityName = ""; 
		},
		newAbilityName() {
			this.newAbilityLevel = "";	
		},
		newAbilityLevel(val) {
			if (val) {
				this.newAbilityRank = this.allAbilities.filter(a => a.type === this.newAbilityType && a.name === this.newAbilityName && a.level === val)[0].rank;
			} else {
				this.newAbilityRank = "";
			}
		}
	},
	methods:{
		getOpts(key) {
			let result = [...new Set(this.allShips.map(item => item[key]))].sort((a, b) => {
				if (a === b) {
					return 0;
				}
				else if (a === null) {
					return 1;
				}
				else if (b === null) {
					return -1;
				}
				else {
					return a < b ? -1 : 1;
				}
			});
			
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
					obj.seatrank = ship.boff1rank;
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
					obj.seatrank = ship.boff2rank;
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
					obj.seatrank = ship.boff3rank;
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
					obj.seatrank = ship.boff4rank;
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
					obj.seatrank = ship.boff5rank;
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
					obj.seatrank = ship.boff6rank;
					slots.push(obj);
				}
			}
			
			// sort the ability slots by spec first (nulls at end), then by type ascending so "uni" is last, then by rank descending, then by seatrank (size) ascending
			slots.sort((a, b) => {

				if (a.spec === null && b.spec === null) {
					return (a.type.localeCompare(b.type) || b.rank - a.rank || a.seatrank - b.seatrank);
				} else if (a.spec !== null && b.spec === null) {
					return -1;
				} else if (a.spec === null && b.spec !== null) {
					return 1;
				}
				return (a.spec.localeCompare(b.spec) || a.type.localeCompare(b.type) || b.rank - a.rank || a.seatrank - b.seatrank);
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
			this.newAbilityType = "";
			this.newAbilityName = "";
			this.newAbilityLevel = "";
			this.newAbilityRank = "";
		},
		addNewAttribute() {
			this.attributes.push({
				id: this.nextAttributeId++,
				name: this.newAttributeName,
				comparison: this.newAttributeComparison,
				value: this.newAttributeValue
			})
			this.newAttributeName = "";
			this.newAttributeComparison = "eq";
			this.newAttributeValue = "";
		},
		addNewColumn() {
			this.columns.push({
				id: this.nextColumnId++,
				name: this.newColumnName,
			})
			this.newColumnName = "";
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
			<button class="button is-info" @click="$emit('remove')">
				<span class="icon is-small">
					<svg style="width:24px;height:24px" viewBox="0 0 24 24">
						<path fill="currentColor" d="M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2C6.47,2 2,6.47 2,12C2,17.53 6.47,22 12,22C17.53,22 22,17.53 22,12C22,6.47 17.53,2 12,2M14.59,8L12,10.59L9.41,8L8,9.41L10.59,12L8,14.59L9.41,16L12,13.41L14.59,16L16,14.59L13.41,12L16,9.41L14.59,8Z" />
					</svg>
				</span>
			</button>
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
			<label class="input">{{ name }} {{ comparison }} {{ value }}</label>
		</div>
		<div class="control">
			<button class="button is-info" @click="$emit('remove')">
				<span class="icon is-small">
					<svg style="width:24px;height:24px" viewBox="0 0 24 24">
						<path fill="currentColor" d="M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2C6.47,2 2,6.47 2,12C2,17.53 6.47,22 12,22C17.53,22 22,17.53 22,12C22,6.47 17.53,2 12,2M14.59,8L12,10.59L9.41,8L8,9.41L10.59,12L8,14.59L9.41,16L12,13.41L14.59,16L16,14.59L13.41,12L16,9.41L14.59,8Z" />
					</svg>
				</span>
			</button>
		</div>
	</div>
	`,
	props: ['name', 'comparison', 'value'],
	emits: ['remove']
})

app.component('column', {
	template: `
	<div class="field has-addons">
		<div class="control">
			<label class="input">{{ name }}</label>
		</div>
		<div class="control">
			<button class="button is-info" @click="$emit('remove')">
				<span class="icon is-small">
					<svg style="width:24px;height:24px" viewBox="0 0 24 24">
						<path fill="currentColor" d="M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2C6.47,2 2,6.47 2,12C2,17.53 6.47,22 12,22C17.53,22 22,17.53 22,12C22,6.47 17.53,2 12,2M14.59,8L12,10.59L9.41,8L8,9.41L10.59,12L8,14.59L9.41,16L12,13.41L14.59,16L16,14.59L13.41,12L16,9.41L14.59,8Z" />
					</svg>
				</span>
			</button>
		</div>
	</div>
	`,
	props: ['name'],
	emits: ['remove']
})

app.mount('#app')

