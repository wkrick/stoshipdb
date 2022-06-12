<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import AbilityFilterInterface from './types/AbilityFilter.interface'
import AbilitySlotInterface from './types/AbilitySlot.interface'
import AttributeFilterInterface from './types/AttributeFilter.interface'
import BoffAbilityInterface from './types/BoffAbility.interface'
import ColumnFilterInterface from './types/ColumnFilter.interface'
import SeatInterface from './types/Seat.interface'
import ShipInterface from './types/Ship.interface'
import ShipAttributeInterface from './types/ShipAttribute.interface'
import ShipSeatsInterface from './types/ShipSeats.interface'

// data source: https://docs.google.com/spreadsheets/d/1-5Nmp_vycD2VpLbuqWnnQL1Lvx-nPy-cGYLPIckGRLk/edit?usp=sharing
// created by Reddit user u/Fleffle
// last updated 09 Jun 2022
import allShipsJSON from './assets/shipdata.json'
import allSeatsJSON from './assets/seatdata.json'
import allAttributesJSON from './assets/attributedata.json'
// data source: https://sto.fandom.com/wiki/Bridge_officer_and_kit_abilities
import allAbilitiesJSON from './assets/abilitydata.json'

const allShips = allShipsJSON as ShipInterface[]
const allSeats = allSeatsJSON as ShipSeatsInterface[]
const allAttributes = allAttributesJSON as ShipAttributeInterface[]
const allAbilities = allAbilitiesJSON as BoffAbilityInterface[]

const openURL = (url: string) => {
      window.open(url);
}

//***********************************************************************//
// ATTRIBUTES
//***********************************************************************//

const attributes = ref<AttributeFilterInterface[]>([])
const nextAttributeId = ref(1)
const newAttributeName = ref()
const newAttributeKey = ref()
const newAttributeOperator = ref("=")
const newAttributeValue = ref()

const addNewAttribute = () => {
	let value: string[] = []
	if (!Array.isArray(newAttributeValue.value)) {
		value = [newAttributeValue.value];
	} else {
		value = newAttributeValue.value;
	}
	attributes.value.push({
		id: nextAttributeId.value++,
		name: newAttributeName.value,
		key: newAttributeKey.value,
		operator: newAttributeOperator.value,
		value: value
	})
	newAttributeName.value = undefined
	newAttributeOperator.value = "="
	newAttributeValue.value = undefined
}

const isNumeric = (n: any) => {
	if (!n || Array.isArray(n)) {
		return false
	}
	return !isNaN(parseFloat(String(n)))
}

const hasValue = (n: string|number|null) => {
	if (n === undefined || n === null || n === '') {
		return false
	}
	return true
}

const getOpts = (key: keyof ShipInterface) => {
	let result: (string|number|null|SeatInterface[])[] = [...new Set(allShips.map(item => item[key]))].sort((a, b) => {
		if (a === b) {
			return 0
		} else if (a === null) {
			return 1
		} else if (b === null) {
			return -1
		} else {
			return a < b ? -1 : 1
		}
	})

	// PrimeVue handles "0" strangely when the options are numbers
	// so make sure result is always an array of strings
	// TODO: revisit this later
	result = result.map(String);

	//return opts
	return result
}

const attributeNameOptions = computed(() => {
	return [...new Set(allAttributes.map(a => a.label))];
})

const attributeOperatorOptions1 = ["=", "!=", "<=", ">="]
const attributeOperatorOptions2 = ["=", "!="]

const attributeValueOptions = computed(() => {
	if (!newAttributeName.value) {
		return []
	}
	return getOpts(newAttributeKey.value)
})

watch(newAttributeName, (selection, prevSelection) => {
	// update the key whenever the name changes
	if (selection)  {
		newAttributeKey.value = allAttributes.filter(a => a.label === selection)[0].key
	} else {
		newAttributeKey.value = undefined
	}
   	newAttributeOperator.value = "="
	newAttributeValue.value = undefined
})

watch(newAttributeOperator, (selection, prevSelection) => { 
	newAttributeValue.value = undefined
})

//***********************************************************************//
// ABILITIES
//***********************************************************************//

const abilities = ref<AbilityFilterInterface[]>([])

const nextAbilityId = ref(1)
const newAbilityType = ref()
const newAbilityName = ref()
const newAbilityLevel = ref()
const newAbilityRank = ref()

const addNewAbility = () => {
	abilities.value.push({
		id: nextAbilityId.value++,
		type: newAbilityType.value,
		name: newAbilityName.value,
		level: newAbilityLevel.value,
		rank: newAbilityRank.value
	})
	newAbilityType.value = undefined
	newAbilityName.value = undefined
	newAbilityLevel.value = undefined
	newAbilityRank.value = undefined
}

const abilitytypeOptions = computed(() => {
	return [...new Set(allAbilities.map(a => a.type))];
})

const abilitynameOptions = computed(() => {
	if (!newAbilityType.value) {
		return [];
	}
	return [...new Set(allAbilities.filter(a => a.type === newAbilityType.value).map(a => a.name))];
})

const abilitylevelOptions = computed(() => {
	if (!newAbilityType.value || !newAbilityName.value) {
		return [];
	}
	return allAbilities.filter(a => a.type === newAbilityType.value && a.name === newAbilityName.value).map(a => a.level);
})

watch(newAbilityType, (selection, prevSelection) => { 
	newAbilityName.value = undefined
})

watch(newAbilityName, (selection, prevSelection) => { 
	newAbilityLevel.value = undefined
})

watch(newAbilityLevel, (selection, prevSelection) => { 
	if (selection) {
		newAbilityRank.value = allAbilities.filter(a => a.type === newAbilityType.value && a.name === newAbilityName.value && a.level === selection)[0].rank;
	} else {
		newAbilityRank.value = undefined
	}
})

//***********************************************************************//
// Columns
//***********************************************************************//

const columns = ref<ColumnFilterInterface[]>([])
const newColumnNames = ref<string[]>([])
const nextColumnId = ref(1)

const addNewColumn = () => {
	newColumnNames.value.forEach(n => {

		// check for duplicates
		let result = columns.value.filter(c => c.label === n)
		if (result.length === 0) {
			// look up key
			let key = allAttributes.filter(a => a.label === n)[0].key
			columns.value.push({
				id: nextColumnId.value++,
				label: n,
				key: key
			})
		}
	})
	newColumnNames.value = []
}

const columnNameOptions = computed(() => {
	return allAttributes.map(a => a.label);
})

//***********************************************************************//
// Ability ship filtering methods
//***********************************************************************//

const getAbilitySlots = (seats: SeatInterface[]) => {

	let slots = <AbilitySlotInterface[]>[]
	let id = 0

	for (let i = 0; i < seats.length; i++) {
		let seat = seats[i]
		for (let j = seat.rank; j > 0; j--) {
			slots.push({
				id: id++,
				rank: j,
				type: seat.type,
				spec: seat.spec
			})
		}
	}

	return slots
}

const getSeatArrays = (seats: SeatInterface[], abilityTypes: string[]) => {

	let seatArrays: SeatInterface[][] = []

	// push clone of original seat array onto array
	seatArrays.push(JSON.parse(JSON.stringify(seats)));

	let universalSeats = seatArrays.filter(array => !!array.find(seat => seat.type === "Uni"));
	
	while (abilityTypes.length !== 0 && universalSeats.length > 0) {
  		universalSeats.forEach(array => {
    		const seatIndex = array.findIndex(seat => seat.type === "Uni");

			if (abilityTypes.length > 0) {
				array[seatIndex].type = abilityTypes[0];
			}
			if (abilityTypes.length > 1) {
				const arrayCopy1 = JSON.parse(JSON.stringify(array));
				arrayCopy1[seatIndex].type = abilityTypes[1];
				seatArrays.push(arrayCopy1);
			}
			if (abilityTypes.length > 2) {
				const arrayCopy2 = JSON.parse(JSON.stringify(array));
    			arrayCopy2[seatIndex].type = abilityTypes[2];
    			seatArrays.push(arrayCopy2);
			}
  		});
  		
		universalSeats = seatArrays.filter(array => !!array.find(seat => seat.type === "Uni"));
	}

	return seatArrays
}

const getAbilities = () => {

	// "transform" abilities to make filtering easier later.
	// This is ugly and I need to figure out a better way to handle this...
	let transformedAbilities = <AbilitySlotInterface[]>[];

	abilities.value.forEach(ability => {

		let type = ""
		let spec = ""
		
		switch (ability.type) {
			case "Intelligence":	type = ""; spec = "Int"; break;
			case "Command":			type = ""; spec = "Cmd"; break;
			case "Pilot":			type = ""; spec = "Pil"; break;
			case "Temporal":		type = ""; spec = "Tmp"; break;
			case "Miracle Worker":	type = ""; spec = "MW";  break;
			case "Tactical":		type = "Tac"; spec = ""; break;
			case "Engineering":		type = "Eng"; spec = ""; break;
			case "Science":			type = "Sci"; spec = ""; break;
		}
		
		transformedAbilities.push({
			id: ability.id,
			rank: ability.rank,
			type: type,
			spec: spec
		})
	
	})
	
	return transformedAbilities
}

const getAttributesEqual = () => {

	let resultArray: AttributeFilterInterface[] = []
	let attributesEqual = attributes.value.filter(a => a.operator === "=")
	if (attributesEqual.length > 0) {
		attributesEqual.forEach(a => {
			let exists = resultArray.find(r => r.name === a.name)
			if (exists) {
				// merge the values
				exists.value = [...new Set([...exists.value, ...a.value  ])]
			} else {
				// add it to the resultArray
				resultArray.push({
					id: a.id,
					name: a.name,
					key: a.key,
					operator: a.operator,
					value: a.value
				})

			}
		})
	}

	return resultArray
}

const getAttributesNotEqual = () => {

	let resultArray: AttributeFilterInterface[] = []
	let attributesEqual = attributes.value.filter(a => a.operator === "!=")
	if (attributesEqual.length > 0) {
		attributesEqual.forEach(a => {
			let exists = resultArray.find(r => r.name === a.name)
			if (exists) {
				// merge the values
				exists.value = [...new Set([...exists.value, ...a.value  ])]
			} else {
				// add it to the resultArray
				resultArray.push({
					id: a.id,
					name: a.name,
					key: a.key,
					operator: a.operator,
					value: a.value
				})

			}
		})
	}

	return resultArray
}

const rows = computed(() => {  // All the rows to be shown
			
	let ships = allShips;

	// filter ships based on the "equals" operator
	getAttributesEqual().forEach(a => {
		ships = ships.filter(ship => a.value.includes(""+ship[a.key]))
	})

	// filter ships based on the "not equals" operator
	getAttributesNotEqual().forEach(a => {
		ships = ships.filter(ship => !a.value.includes(""+ship[a.key]))
	})	

	// filter ships based on "less than" and "greater than" operator
	// TODO: factor these out later
	attributes.value.forEach( a => {
		if (a.operator === ">=") {
			ships = ships.filter(ship => ship[a.key] >= a.value[0]);
		} else if (a.operator === "<=") {
			ships = ships.filter(ship => ship[a.key] <= a.value[0]);
		} 
	})

	if (abilities.value.length > 0) {
		let filteredShips = [];	
		for (let i = 0; i < ships.length; i++) {
			// using the ship id, grab the corresponding array of seats
			let seats = allSeats.filter(s => s.id === ships[i].id)[0].seats
			if (testShip(seats)) {
				filteredShips.push(ships[i]);
			}
		}
		ships = filteredShips
	}
	
	return ships;
})

const testShip = (seats: SeatInterface[]) => {

	let isSuccessful = false

	let abilitiesSpec = getAbilities().filter(a => a.spec !== "")
	let abilitiesNonSpec = getAbilities().filter(a => a.spec === "")

	// if this ship doesn't have the required specs, we can return early
	let abilitySpecs = [...new Set(abilitiesSpec.map(a => a.spec))]
	let shipSpecs = [...new Set(seats.map(s => s.spec))]
	let unmatchedSpecs = abilitySpecs.filter( spec => !shipSpecs.includes(spec) )
	if (unmatchedSpecs.length > 0) {
		return isSuccessful
	}

	// get the list of desired ability types (not specs)
	let abilityTypes = [...new Set(abilitiesNonSpec.map(a => a.type))]

	// build an array of all the possible seat permutations of replacing "Uni" with the above types
	let seatArrays = getSeatArrays(seats, abilityTypes)

	for (let i=0; !isSuccessful && i<seatArrays.length; i++) {

		let slots = getAbilitySlots(seatArrays[i])

		// go through the list of slots and remove the spec from any slot that we definitley don't need
		slots.forEach( slot => {

			// if this slot is a spec slot
			if (slot.spec) {
				// see if the list of desired spec abilities contains something that could match this slot
				let result = abilitiesSpec.filter(a => a.spec === slot.spec && a.rank === slot.rank)

				// if not found, then we don't need this seat to have a spec
				if (result.length === 0) {
					slot.spec = ""
				}
			}
		})

		let matches = 0

		abilitiesNonSpec.forEach( ability => {
			
			let found = false;

			if (!found) {
				// 1: search for specific slot type with no spec
				let result = slots.filter(slot => slot.type === ability.type && slot.spec === "" && slot.rank === ability.rank);
				if (result.length) {
					found = true;
					matches++;
					slots = slots.filter(slot => slot.id !== result[0].id);
				}
			}

			if (!found) {
				// 2: search for specific slot type with any (or no) spec
				let result = slots.filter(slot => slot.type === ability.type && slot.rank === ability.rank);
				if (result.length) {
					found = true;
					matches++;
					slots = slots.filter(slot => slot.id !== result[0].id);
				}
			}
			
		})

		abilitiesSpec.forEach( ability => {

			let found = false;

			if (!found) {
				// 3: search for slot with desired spec and any type
				let result = slots.filter(slot => slot.spec === ability.spec && slot.rank === ability.rank);
				if (result.length) {
					found = true;
					matches++;
					slots = slots.filter(slot => slot.id !== result[0].id);
				}
			}

		})

		isSuccessful =  (matches === abilities.value.length)

	}

	return isSuccessful
}
</script>

<template>
<div class="p-component">

	<h1>STO Ship DB</h1>

	<p>Filter ships by attributes and bridge officer abilities to find your perfect ship in the <Button
			label="Star Trek Online"
			class="p-button-link p-link"
			@click="openURL('https://www.arcgames.com/en/games/star-trek-online')"
		/> game.</p>
	
	<p>Created by Reddit user <Button
			label="u/wkrick"
			class="p-button-link p-link"
			@click="openURL('https://www.reddit.com/user/wkrick')"
		/> using data from the <Button
			label="Sortable/Filterable T6 Ship List"
			class="p-button-link p-link"
			@click="openURL('https://docs.google.com/spreadsheets/d/1-5Nmp_vycD2VpLbuqWnnQL1Lvx-nPy-cGYLPIckGRLk/edit?usp=sharing')"
		/> by Reddit user <Button
			label="u/Fleffle"
			class="p-button-link p-link"
			@click="openURL('https://www.reddit.com/user/Fleffle')"
		/>.</p>

		<p>Last updated 2022-06-09</p>

	<form>

		<fieldset class="fieldset">
			<legend class="legend">Ship Attributes</legend>
			<p>Choose the attributes that you would like your ship to have.</p>
			<div>
				<div>
					<Dropdown
						v-model="newAttributeName"
						:options="attributeNameOptions"
						placeholder="Select Attribute"
						scrollHeight="400px"
					/>
				</div>
				<div>
					<Dropdown
						v-if="attributeValueOptions[0] && isNumeric(attributeValueOptions[0])"
						v-model="newAttributeOperator"
						:options="attributeOperatorOptions1"
						:disabled="!attributeValueOptions[0]"
						scrollHeight="400px"
					/>
					<Dropdown
						v-else
						v-model="newAttributeOperator"
						:options="attributeOperatorOptions2"
						:disabled="!attributeValueOptions[0]"
						scrollHeight="400px"
					/>
				</div>
				<div>
					<MultiSelect
						v-if="newAttributeOperator==='='||newAttributeOperator==='!='"
						v-model="newAttributeValue"
						:options="attributeValueOptions"
						placeholder="Select Value"
						:disabled="!newAttributeName"
						scrollHeight="400px"
					/>
					<Dropdown
						v-else
						v-model="newAttributeValue"
						:options="attributeValueOptions"
						placeholder="Select Value"
						:disabled="!newAttributeName"
						scrollHeight="400px"
					/>
					<Button
						@click="addNewAttribute()"
						:disabled="!hasValue(newAttributeValue)"
						icon="pi pi-plus-circle"
					/>
				</div>
			</div>
			<div v-show="attributes.length">
				<hr>
				<div>
					<Chip
						v-for="(attribute, index) in attributes"
						class="mr-2 mb-2"
						:key="attribute.id"
						removable
						@remove="attributes.splice(index, 1)"
					>{{ attribute.name + ' ' + attribute.operator + ' ' + attribute.value?.join(', ') }}</Chip>
				</div>
			</div>
		
		</fieldset>

	</form>

	<form>
		
		<fieldset class="fieldset">
			<legend class="legend">Bridge Officer Abilities</legend>
			<p>Choose which bridge officer abilities you would like to use on your ship.</p>
			<div>
				<div>
					<Dropdown
						v-model="newAbilityType"
						:options="abilitytypeOptions"
						placeholder="Select Type"
						scrollHeight="400px"
					/>
				</div>
				<div>
					<Dropdown
						v-model="newAbilityName"
						:options="abilitynameOptions"
						placeholder="Select Name"
						:disabled="!newAbilityType"
						scrollHeight="400px"
					/>
				</div>
				<div>
					<Dropdown
						v-model="newAbilityLevel"
						:options="abilitylevelOptions"
						placeholder="Select Level"
						:disabled="!newAbilityName"
						scrollHeight="400px"
					/>
					<Button @click="addNewAbility()"
						:disabled="!newAbilityLevel" 
						icon="pi pi-plus-circle"
					/>
				</div>
			</div>
			<div v-show="abilities.length">
				<hr>
				<div>
				<Chip
					v-for="(ability, index) in abilities"
					class="mr-2 mb-2"
					:key="ability.id"
					removable
					@remove="abilities.splice(index, 1)"
				>{{ ability.type + " - " + ability.name + " " + ability.level + " (" + ability.rank + ")" }}</Chip>
				</div>
			</div>

		</fieldset>

	</form>

	<form>
		<fieldset class="fieldset">
			<legend class="legend">Additional Result Details</legend>
			<p>Choose additional information about each ship to display in the results.</p>
			<div>
				<div>
					<MultiSelect
						v-model="newColumnNames"
						:options="columnNameOptions"
						placeholder="Select Attribute"
						scrollHeight="400px"
					/>
					<Button
						@click="addNewColumn()"
						:disabled="!newColumnNames"
						icon="pi pi-plus-circle"
					/>
				</div>

				<div v-show="columns.length">
					<hr>
					<div>
					<Chip
						v-for="(column, index) in columns"
						class="mr-2 mb-2"
						:key="column.id"
						removable
						@remove="columns.splice(index, 1)"
					>{{ column.label }}</Chip>
					</div>
				</div>
			</div>
		</fieldset>
	
	</form>			

	<fieldset class="fieldset">
		<legend class="legend">Ships Matched ({{ rows.length }} of {{ allShips.length }})</legend>
		<DataTable :value="rows">
			<template #empty>
				No ships found.
			</template>
			<template #loading>
				Loading ship data....
			</template>	
			<Column field="name" header="Ship Name" :sortable="true">
				<template #body="slotProps">
					<Button
						:label=slotProps.data.name
						class="p-button-link p-link"
						@click="openURL(slotProps.data.url)"
					/>
				</template>
			</Column>
			<Column v-for="col of columns" :field="col.key" :header="col.label" :key="col.key" :sortable="true"></Column>
		</DataTable>
	</fieldset>

</div>
</template>

<style>

</style>


