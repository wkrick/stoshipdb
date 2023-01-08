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
	window.open(url)
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
		value = [newAttributeValue.value]
	} else {
		value = newAttributeValue.value
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
	let opts: String[] = result.map(String)

	return opts
}

const attributeNameOptions = computed(() => {
	return [...new Set(allAttributes.map(a => a.label))]
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
const newAbilityTypeSpec = ref()
const newAbilityName = ref()
const newAbilityLevel = ref()
const newAbilityRank = ref()

const addNewAbility = () => {

	// convert the ability "typespec" into separate type/spec codes to simplify filtering later
	let type = AbilityType.UNDEFINED
	let spec = AbilityType.UNDEFINED
	switch (newAbilityTypeSpec.value) {
		case "Tactical":       type = AbilityType.TAC; break
		case "Engineering":    type = AbilityType.ENG; break
		case "Science":        type = AbilityType.SCI; break
		case "Intelligence":   spec = AbilityType.INT; break
		case "Command":        spec = AbilityType.CMD; break
		case "Pilot":          spec = AbilityType.PIL; break
		case "Temporal":       spec = AbilityType.TMP; break
		case "Miracle Worker": spec = AbilityType.MWR; break
	}

	abilities.value.push({
		id: nextAbilityId.value++,
		typespec: newAbilityTypeSpec.value,
		name: newAbilityName.value,
		level: newAbilityLevel.value,
		rank: newAbilityRank.value,
		type: type,
		spec: spec
	})
	newAbilityTypeSpec.value = undefined
	newAbilityName.value = undefined
	newAbilityLevel.value = undefined
	newAbilityRank.value = undefined
}

const abilitytypeOptions = computed(() => {
	return [...new Set(allAbilities.map(a => a.typespec))]
})

const abilitynameOptions = computed(() => {
	if (!newAbilityTypeSpec.value) {
		return []
	}
	return [...new Set(allAbilities.filter(a => a.typespec === newAbilityTypeSpec.value).map(a => a.name))]
})

const abilitylevelOptions = computed(() => {
	if (!newAbilityTypeSpec.value || !newAbilityName.value) {
		return []
	}

	let list = allAbilities.filter(a => a.typespec === newAbilityTypeSpec.value && a.name === newAbilityName.value).map(a => a.level)
	list.push("Any")
	return list
})

watch(newAbilityTypeSpec, (selection, prevSelection) => {
	newAbilityName.value = undefined
})

watch(newAbilityName, (selection, prevSelection) => {
	newAbilityLevel.value = undefined
})

watch(newAbilityLevel, (selection, prevSelection) => {
	if (selection && selection !== "Any") {
		newAbilityRank.value = allAbilities.filter(a => a.typespec === newAbilityTypeSpec.value && a.name === newAbilityName.value && a.level === selection)[0].rank
	} else if (selection) {
		newAbilityRank.value = 0
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
	return allAttributes.map(a => a.label)
})

//***********************************************************************//
// Ship filtering helper methods
//***********************************************************************//

// build a map of ability levels to save time later
const getAbilityLevels = (abilities: AbilityFilterInterface[]) => {

	let results = new Map();

	abilities.forEach( ability => {
		let filteredByName = allAbilities.filter(a => a.name === ability.name)
		let levels = filteredByName.map(a => a.level)
		let ranks = filteredByName.map(a => a.rank)
		results.set(ability.name, {levels, ranks})
	})

	return results
}

// the rank of an ability could be "any" so we need to generate all of the possible permutations
const getAbilityPermutations = (abilities: AbilityFilterInterface[]) => {

	let abilityLevels = getAbilityLevels(abilities)

	let permutations: AbilityFilterInterface[][] = []

	// start with a deep copy of original ability array
	permutations.push(JSON.parse(JSON.stringify(abilities)))

	// filter the list to just arrays of abilities that have at least one "Any"
	let anyAbilities = permutations.filter(array => !!array.find(ability => ability.rank === 0))

	while (anyAbilities.length > 0) {
		anyAbilities.forEach(array => {
			const abilityIndex = array.findIndex(ability => ability.rank === 0)

			// look up the levels and associated ranks for this ability
			let {levels, ranks} = abilityLevels.get(array[abilityIndex].name)

			if (levels.length > 0) {
				array[abilityIndex].level = levels[0]
				array[abilityIndex].rank = ranks[0]
			}
			if (levels.length > 1) {
				const arrayCopy1: AbilityFilterInterface[] = JSON.parse(JSON.stringify(array))
				arrayCopy1[abilityIndex].level = levels[1]
				arrayCopy1[abilityIndex].rank = ranks[1]
				permutations.push(arrayCopy1)
			}
			if (levels.length > 2) {
				const arrayCopy2: AbilityFilterInterface[] = JSON.parse(JSON.stringify(array))
				arrayCopy2[abilityIndex].level = levels[2]
				arrayCopy2[abilityIndex].rank = ranks[2]
				permutations.push(arrayCopy2)
			}
		})
		anyAbilities = permutations.filter(array => !!array.find(ability => ability.rank === 0))
	}

	return permutations
}

// the type of a seat can be "Uni" so we need to generate all the possible permutations
const getSeatPermutations = (seats: SeatInterface[], abilityTypes: AbilityType[]) => {

	let permutations: SeatInterface[][] = []

	// start with a deep copy of original seat array
	permutations.push(JSON.parse(JSON.stringify(seats)))

	let universalSeats = permutations.filter(array => !!array.find(seat => seat.type === AbilityType.UNDEFINED))

	while (abilityTypes.length !== 0 && universalSeats.length > 0) {
		universalSeats.forEach(array => {
			const seatIndex = array.findIndex(seat => seat.type === AbilityType.UNDEFINED)

			if (abilityTypes.length > 0) {
				array[seatIndex].type = abilityTypes[0]
			}
			if (abilityTypes.length > 1) {
				const arrayCopy1: SeatInterface[] = JSON.parse(JSON.stringify(array))
				arrayCopy1[seatIndex].type = abilityTypes[1]
				permutations.push(arrayCopy1)
			}
			if (abilityTypes.length > 2) {
				const arrayCopy2: SeatInterface[] = JSON.parse(JSON.stringify(array))
				arrayCopy2[seatIndex].type = abilityTypes[2]
				permutations.push(arrayCopy2)
			}
		})
		universalSeats = permutations.filter(array => !!array.find(seat => seat.type === AbilityType.UNDEFINED))
	}

	return permutations
}

const rows = computed(() => {  // All the rows to be shown

	let ships = allShips

	// filter ships based on the attributes chosen
	attributes.value.forEach( a => {
		if (a.operator === "=") {
			ships = ships.filter(ship => a.value.includes(""+ship[a.key]))
		} else if (a.operator === "!=") {
			ships = ships.filter(ship => !a.value.includes(""+ship[a.key]))
		} else if (a.operator === ">=") {
			ships = ships.filter(ship => ship[a.key] >= a.value[0])
		} else if (a.operator === "<=") {
			ships = ships.filter(ship => ship[a.key] <= a.value[0])
		}
	})

	let abilityCount = abilities.value.length;
	if (ships.length > 0 && abilityCount > 0) {

		let abilitiesclone: AbilityFilterInterface[] = JSON.parse(JSON.stringify(abilities.value))
		let abilitySpecs = [...new Set(abilitiesclone.filter(a => a.spec !== AbilityType.UNDEFINED).map(a => a.spec))]
		let abilityTypes = [...new Set(abilitiesclone.filter(a => a.spec === AbilityType.UNDEFINED).map(a => a.type))]

		// for each ship, test the corresponding array of seats against the list of abilities
		let filteredShips: ShipInterface[] = []
		for (let i = 0; i < ships.length; i++) {

			let ship = ships[i]
			// if the user selected more abilities than this ship can support, then skip it
			if (abilityCount > ship.tab) {
				continue
			}

			let seats = allSeats[ship.id].seats // seats for this ship

			// if this ship doesn't have the desired specs, we can skip over it
			let shipSpecs = [...new Set(seats.map(s => s.spec))]
			let unmatchedSpecs = abilitySpecs.filter( spec => !shipSpecs.includes(spec) )
			if (unmatchedSpecs.length > 0) {
				continue
			}

			// gather stats on the ability slot ranks on this ship for optimization later
			let slotRanks = [0,0,0,0]
			seats.forEach ( seat => {
				switch (seat.rank) {
					case 4: slotRanks[3]++
					case 3: slotRanks[2]++
					case 2: slotRanks[1]++
					case 1: slotRanks[0]++
				}
			})

			// replace "Uni" with the desired ability types to get all the permutations of the ship seats
			let seatPermutations = getSeatPermutations(seats, abilityTypes)

			// replace "any" with each of the possible ability ranks to get all permutations of the desired abilities
			let abilityPermutations = getAbilityPermutations(abilitiesclone)

			// loop over the permutations and test each one.  if at least one matches, add the ship to the output
			let shipmatch = false
			for (let j = 0; shipmatch === false && j < abilityPermutations.length; j++) {

				let abilityPermutation = abilityPermutations[j]

				// see if this permutation will even fit on this ship
				let abilityRanks = [0,0,0,0]
				abilityPermutation.forEach ( ability => {
					switch (ability.rank) {
						case 4: abilityRanks[3]++; break
						case 3: abilityRanks[2]++; break
						case 2: abilityRanks[1]++; break
						case 1: abilityRanks[0]++; break
					}
				})

				// skip this permutation if it can't fit on this ship
				if (abilityRanks[0] > slotRanks[0] ||
					abilityRanks[1] > slotRanks[1] ||
					abilityRanks[2] > slotRanks[2] ||
					abilityRanks[3] > slotRanks[3]) {
					continue
				}

				// sort abilities in descending order
				abilityPermutation.sort((a, b) => (b.rank - a.rank || b.type - a.type || b.spec - a.spec))

				for (let k = 0; shipmatch === false && k < seatPermutations.length; k++) {

					if (testShip(abilityPermutation, seatPermutations[k])) {
						filteredShips.push(ship)
						shipmatch = true
					}
				}
			}
		}

		ships = filteredShips
	}

	return ships
})

const testShip = (abilities: AbilityFilterInterface[], seats: SeatInterface[]) => {

	// partition the abilities into spec and non-spec
	let abilitiesSpec: AbilityFilterInterface[] = []
	let abilitiesNonSpec: AbilityFilterInterface[] = []
	abilities.forEach(ability => {
		if (ability.spec === AbilityType.UNDEFINED) {
			abilitiesNonSpec.push(ability)
		} else {
			abilitiesSpec.push(ability)
		}
	})

	// slice up the seats into ability slots
	let slots: AbilitySlotInterface[] = []
	seats.forEach(seat => {
		switch(seat.rank) {
			case 4: slots.push({rank: 4, type: seat.type, spec: seat.spec, matched: false})
			case 3: slots.push({rank: 3, type: seat.type, spec: seat.spec, matched: false})
			case 2: slots.push({rank: 2, type: seat.type, spec: seat.spec, matched: false})
			case 1: slots.push({rank: 1, type: seat.type, spec: seat.spec, matched: false})
		}
	})

	// go through the list of spec slots and remove the spec from any slot that we definitely don't need
	slots.filter(slot => slot.spec !==AbilityType.UNDEFINED).forEach(slot => {

		// see if the list of desired spec abilities contains something that could match this slot
		// if not found, then we don't need this seat to have a spec
		if (!abilitiesSpec.find(a => a.spec === slot.spec && a.rank === slot.rank)) {
			slot.spec = AbilityType.UNDEFINED
		}
	})

	// NOTE TO SELF: sorting the slots at this point doesn't appear to make any difference at all

	// try to seat all the the non-spec abilities first
	for (const ability of abilitiesNonSpec) {

		// 1: search for specific slot type with no spec
		let target = slots.find( slot => !slot.matched && slot.type === ability.type && slot.spec === AbilityType.UNDEFINED && slot.rank === ability.rank)
		
		if (target) {
			target.matched = true
			continue // skip to the next ability as soon as we find a match
		}

		// 2: search for specific slot type with any (or no) spec
		target = slots.find( slot => !slot.matched && slot.type === ability.type && slot.rank === ability.rank)

		if (target) {
			target.matched = true
			continue // skip to the next ability as soon as we find a match
		}

		return false // we can exit the test entirely as soon as an ability isn't matched to a slot
	}

	// then try to seat the non-spec abilities
	for (const ability of abilitiesSpec) {

		// 3: search for slot with desired spec and any type
		let target = slots.find( slot => !slot.matched && slot.spec === ability.spec && slot.rank === ability.rank)

		if (target) {
			target.matched = true
			continue  // skip to the next ability as soon as we find a match
		}

		return false  // we can exit the test entirely as soon as an ability isn't matched to a slot
	}

	return true
}

// get the seats for a specific ship as a string for display in the table
const getSeats = (shipIndex: number) => {

	let seats = allSeats[shipIndex].seats
	const typeMap = new Map([
		[0, "Uni"],[1, "Tac"],[2, "Eng"],[3, "Sci"],
		[4, "Int"],[5, "Cmd"],[6, "Pil"],[7, "Tmp"],[8, "MW"]
	])

	let result = ""
	let separator = ""
	seats.forEach( s => {
		result += separator + s.rank + " " + typeMap.get(s.type)
		if (s.spec !== 0) {
			result += "/" + typeMap.get(s.spec)
		}
		separator = ", "
	})

	return result
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
						v-model="newAbilityTypeSpec"
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
						:disabled="!newAbilityTypeSpec"
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
				>{{ ability.typespec + " - " + ability.name + " " + (ability.rank > 0 ? ability.level + " (" + ability.rank + ")" : "(Any)") }}</Chip>
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
						class="p-button-link p-link selectable"
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


