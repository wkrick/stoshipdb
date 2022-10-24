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
import AbilityType from './types/AbilityType.enum'

// data source: https://docs.google.com/spreadsheets/d/1-5Nmp_vycD2VpLbuqWnnQL1Lvx-nPy-cGYLPIckGRLk/edit?usp=sharing
// created by Reddit user u/Fleffle
import lastUpdated from './assets/lastupdated.json'
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
	
	// TODO:
	// check if we already have a filter on this key
	// if yes...
	//    if the operators match (= or !=) merge, (<= or >=) replace
	//    if the operators don't match...
	//        if equals - remove any !=, <=, >=, then add it
	//        if not-equals - remove any !=, <=, >=, then add it
	//        if less-than-equals - remove any =, !=
	//        if greater-than-equals - remove any =, !=
	
	// check if we already have a filter for this attribute/operator combination
	var matchingAttribute = attributes.value.find(a => a.key === newAttributeKey.value && a.operator === newAttributeOperator.value)
	if (matchingAttribute) {

		// if operator is equals or not equals merge it.
		// if less-than equals or greater-than equals replace it.
		if (newAttributeOperator.value === "=" || newAttributeOperator.value === "!=") {
			matchingAttribute.value = [...new Set([...matchingAttribute.value ,...value])].sort()
		} else if (newAttributeOperator.value === "<=" || newAttributeOperator.value === ">=") {
			matchingAttribute.value = value
		}

	} else {
		attributes.value.push({
			id: nextAttributeId.value++,
			name: newAttributeName.value,
			key: newAttributeKey.value,
			operator: newAttributeOperator.value,
			value: value
		})
	}	

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
	let opts: String[] = result.map(String);

	return opts
}

const attributeNameOptions = computed(() => {
	return [...new Set(allAttributes.map(a => a.label))];
})

const attributeOperatorOptions = computed(() => {
	if (attributeValueOptions.value[0] && isNumeric(attributeValueOptions.value[0]) ) {
		return ["=", "!=", "<=", ">="]
	} else {
		return ["=", "!="]
	}
})

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

	let slots: AbilitySlotInterface[] = []
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

const getSeatArrays = (seats: SeatInterface[], abilityTypes: AbilityType[]) => {

	let seatArrays: SeatInterface[][] = []

	// push clone of original seat array onto array
	seatArrays.push(JSON.parse(JSON.stringify(seats)));

	let universalSeats = seatArrays.filter(array => !!array.find(seat => seat.type === AbilityType.UNDEFINED));
	
	while (abilityTypes.length !== 0 && universalSeats.length > 0) {
  		universalSeats.forEach(array => {
    		const seatIndex = array.findIndex(seat => seat.type === AbilityType.UNDEFINED);

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
  		
		universalSeats = seatArrays.filter(array => !!array.find(seat => seat.type === AbilityType.UNDEFINED));
	}

	return seatArrays
}

const getAbilities = () => {

	// "transform" abilities to make filtering easier later.
	// This is ugly and I need to figure out a better way to handle this...
	let transformedAbilities: AbilitySlotInterface[] = [];

	abilities.value.forEach(ability => {

		let type = AbilityType.UNDEFINED
		let spec = AbilityType.UNDEFINED
		
		switch (ability.type) {
			case "Tactical":		type = AbilityType.TAC; break;
			case "Engineering":		type = AbilityType.ENG; break;
			case "Science":			type = AbilityType.SCI; break;
			case "Intelligence":	spec = AbilityType.INT; break;
			case "Command":			spec = AbilityType.CMD; break;
			case "Pilot":			spec = AbilityType.PIL; break;
			case "Temporal":		spec = AbilityType.TMP; break;
			case "Miracle Worker":	spec = AbilityType.MWR; break;
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

const rows = computed(() => {  // All the rows to be shown
			
	let ships = allShips;

	// filter ships based on the attributes chosen
	attributes.value.forEach( a => {
		if (a.operator === "=") {
			ships = ships.filter(ship => a.value.includes(""+ship[a.key]))
		} else if (a.operator === "!=") {
			ships = ships.filter(ship => !a.value.includes(""+ship[a.key]))
		} else if (a.operator === ">=") {
			ships = ships.filter(ship => ship[a.key] >= a.value[0]);
		} else if (a.operator === "<=") {
			ships = ships.filter(ship => ship[a.key] <= a.value[0]);
		} 
	})

	if (abilities.value.length > 0) {
		let filteredShips = [];	
		for (let i = 0; i < ships.length; i++) {
			// for each ship, test the corresponding array of seats
			if (testShip(allSeats[ships[i].id].seats)) {
				filteredShips.push(ships[i]);
			}
		}
		ships = filteredShips
	}
	
	return ships;
})

const testShip = (seats: SeatInterface[]) => {

	let isSuccessful = false

	let abilitiesSpec = getAbilities().filter(a => a.spec !== AbilityType.UNDEFINED)
	let abilitiesNonSpec = getAbilities().filter(a => a.spec === AbilityType.UNDEFINED)

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
			if (slot.spec !== AbilityType.UNDEFINED) {
				// see if the list of desired spec abilities contains something that could match this slot
				let result = abilitiesSpec.filter(a => a.spec === slot.spec && a.rank === slot.rank)

				// if not found, then we don't need this seat to have a spec
				if (result.length === 0) {
					slot.spec = AbilityType.UNDEFINED
				}
			}
		})

		let matches = 0

		abilitiesNonSpec.forEach( ability => {
			
			let found = false;

			if (!found) {
				// 1: search for specific slot type with no spec
				let result = slots.filter(slot => slot.type === ability.type && slot.spec === AbilityType.UNDEFINED && slot.rank === ability.rank);
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

// get the seats for a specific ship as a string for display in the table
const getSeats = (shipIndex: number) => {

	let seats = allSeats[shipIndex].seats
	const typeMap = new Map([
		[0, "Uni"],[1, "Tac"],[2, "Eng"],[3, "Sci"],
		[4, "Int"],[5, "Cmd"],[6, "Pil"],[7, "Tmp"],[8, "MW"]
	]);

	let result = ""
	let separator = ""
	seats.forEach( s => {
		result += separator + s.rank + " " + typeMap.get(s.type)
		if (s.spec !== 0) {
			result += "/" + typeMap.get(s.spec)
		}
		separator = ", "
	})

	return result;
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

		<p>Note: The total number of ships in this app is higher than the source data because Science Destroyers with Tactical/Science modes are each treated as two distinct ships for more accurate filtering.</p>

		<p>Last updated {{ lastUpdated.date }}</p>

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
						v-model="newAttributeOperator"
						:options="attributeOperatorOptions"
						:disabled="!newAttributeName"
						scrollHeight="400px"
					/>
				</div>
				<div>
					<template v-if="newAttributeOperator==='='||newAttributeOperator==='!='">
						<MultiSelect
							v-model="newAttributeValue"
							:options="attributeValueOptions"
							placeholder="Select Value"
							:disabled="!newAttributeName"
							scrollHeight="400px"
						/>
					</template>
					<template v-else>
						<Dropdown
							v-model="newAttributeValue"
							:options="attributeValueOptions"
							placeholder="Select Value"
							:disabled="!newAttributeName"
							scrollHeight="400px"
						/>
					</template>
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
		<DataTable :value="rows" dataKey="id">
			<template #empty>
				No ships found.
			</template>
			<template #loading>
				Loading ship data....
			</template>	
			<Column field="nm" header="Ship Name" :sortable="true">
				<template #body="slotProps">
					<Button
						:label=slotProps.data.nm
						class="p-button-link p-link"
						@click="openURL(slotProps.data.url)"
					/>
				</template>
			</Column>
			<Column header="Seating" :sortable="false">
				<template #body="slotProps">
					{{ getSeats(slotProps.data.id) }}
				</template>
			</Column>
			<Column v-for="col of columns" :field="col.key" :header="col.label" :key="col.key" :sortable="true"></Column>
		</DataTable>
	</fieldset>

</div>
</template>

<style>

</style>


