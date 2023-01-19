<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import AbilityFilterInterface from './types/AbilityFilter.interface'
import AttributeFilterInterface from './types/AttributeFilter.interface'
import ColumnFilterInterface from './types/ColumnFilter.interface'
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

const worker = new Worker(new URL('./workers/worker.ts', import.meta.url))

worker.addEventListener("message", (e) => {
	const filteredShipIds = e.data as number[]
	const filteredShips = allShips.filter(ship => filteredShipIds.includes(ship.id))
	shipsFilteredByAbilities.value = filteredShips
	isLoading.value = false
})

const openURL = (url: string) => {
	window.open(url)
}

// initial state is all ships
const shipsFilteredByAbilities = ref(allShips)

const isLoading = ref(false)

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

const isNumeric = (s: string) => {
	// match numbers:  1, .1, 1.1, etc... with optional positive/negative prefix
	// Note: does not handle exponents/NaN/Inf
	// source: https://stackoverflow.com/questions/12643009/regular-expression-for-floating-point-numbers
	return /^[+-]?([0-9]*[.])?[0-9]+$/.test(s)
}

const getOpts = (key: keyof ShipInterface) => {
	// PrimeVue handles "0" strangely when the options are numbers
	// so make sure result is always an array of strings
	// TODO: revisit this later

	let values = [...new Set(allShips.map(item => item[key]))]
	let opts: string[]

	// if the option values are numbers, sort them as numbers, then convert to strings.  Otherwise just sort.
	if (isNumeric(String(values[0]))) {
		const temp = values as number[]
		opts = temp.sort((a, b) => a - b).map(String)
	} else {
		const temp = values as string[]
		opts = temp.sort()
	}
		
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
let nextAbilityId = 1
const allAbilities: any = allAbilitiesJSON
const abilityTypeSpecs = Object.keys(allAbilities)
const newAbilityTypeSpec = ref()
let abilityNames: string[] = []
const newAbilityName = ref()
let abilityLevels: string[] = []
const newAbilityLevel = ref()
let newAbilityRank = 0

const typeLookup = new Map([
	['Tactical', AbilityType.TAC],
	['Engineering', AbilityType.ENG],
	['Science', AbilityType.SCI],
	['Intelligence', AbilityType.INT],
	['Command', AbilityType.CMD],
	['Pilot', AbilityType.PIL],
	['Temporal', AbilityType.TMP],
	['Miracle Worker', AbilityType.MWR]
])

const addNewAbility = () => {
	abilities.value.push({
		id: nextAbilityId++,
		typespec: newAbilityTypeSpec.value,
		name: newAbilityName.value,
		level: newAbilityLevel.value,
		rank: newAbilityRank,
		typeorspec: typeLookup.get(newAbilityTypeSpec.value) as AbilityType
	})
	newAbilityTypeSpec.value = undefined
	newAbilityName.value = undefined
	newAbilityLevel.value = undefined
	newAbilityRank = 0
}

watch(newAbilityTypeSpec, () => {
	abilityNames = []
	newAbilityName.value = undefined
	abilityLevels = []
	newAbilityLevel.value = undefined
	if (newAbilityTypeSpec.value) {
		abilityNames = Object.keys(allAbilities[newAbilityTypeSpec.value])
	}
})

watch(newAbilityName, () => {
	abilityLevels = []
	newAbilityLevel.value = undefined
	if (newAbilityName.value) {
		const opts = Object.keys(allAbilities[newAbilityTypeSpec.value][newAbilityName.value])
		opts.push("Any")
		abilityLevels = opts 
	}
})

watch(newAbilityLevel, () => {
	newAbilityRank = 0
	if (newAbilityLevel.value) {
		if (newAbilityLevel.value !== "Any") {
			newAbilityRank = allAbilities[newAbilityTypeSpec.value][newAbilityName.value][newAbilityLevel.value].rank
		} else {
			// for an "Any" ability, encode the possible ranks for later expansion
			const firstRank = allAbilities[newAbilityTypeSpec.value][newAbilityName.value]["I"].rank
			switch (firstRank) {
				case 1: newAbilityRank = 123; break
				case 2: newAbilityRank = 234; break
				case 3: newAbilityRank = 34; break
			}
		}
	}
})

// when abilities change, have the web worker re-filter the list of ships
watch(abilities, () => {
	isLoading.value = true
	worker.postMessage( JSON.parse(JSON.stringify(abilities.value)) )
},{ deep: true })

// format the ability as a string for display in a chip
const abilityString = (id: number) => {
	let ability = abilities.value[id]
	let string = `${ability.typespec} - ${ability.name}`
	if (ability.rank > 4) {
		string += ` (Any)`
	} else {
		string += ` ${ability.level} (${ability.rank})` 
	}
	return string
}

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

const rows = computed(() => {  // All the rows to be shown

	// rows to display start with the list of ships filtered by chosen abilities
	let ships = shipsFilteredByAbilities.value

	// filter ships based on the attributes chosen
	// a.value is an array of strings so we need to convert ship[a.key] to a string
	// TODO: come up with a less hacky way of handling that
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

	return ships
})

// get the seats for a specific ship as a string for display in the table
const getSeats = (shipIndex: number) => {

	const seats = allSeats[shipIndex].seats
	const typeMap = new Map([
		[0, "Uni"],[1, "Tac"],[2, "Eng"],[3, "Sci"],
		[4, "Int"],[5, "Cmd"],[6, "Pil"],[7, "Tmp"],[8, "MW"]
	])

	let result = ""
	let separator = ""
	seats.forEach( s => {
		if (s.spec === AbilityType.UNDEFINED) {
			result += `${separator}${s.rank} ${typeMap.get(s.type)}`
		} else {
			result += `${separator}${s.rank} ${typeMap.get(s.type)}/${typeMap.get(s.spec)}`
		}
		separator = ", "
	})

	return result
}

</script>

<template>
<div class="p-component">

	<h1>STO Ship DB</h1>
	<BlockUI :blocked="isLoading" :fullScreen="true"></BlockUI>
	<ProgressSpinner v-show="isLoading" class="overlay"/>

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
						:disabled="!newAttributeValue"
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
						:options="abilityTypeSpecs"
						placeholder="Select Type"
						scrollHeight="400px"
					/>
				</div>
				<div>
					<Dropdown
						v-model="newAbilityName"
						:options="abilityNames"
						placeholder="Select Name"
						:disabled="!newAbilityTypeSpec"
						scrollHeight="400px"
					/>
				</div>
				<div>
					<Dropdown
						v-model="newAbilityLevel"
						:options="abilityLevels"
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
				>{{ abilityString(index) }}</Chip>
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


