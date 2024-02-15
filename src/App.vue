<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import AttributePicker from './components/AttributePicker.vue'
import AttributeFilterInterface from './types/AttributeFilter.interface'
import AttributePickerInterface from './types/AttributePicker.interface'
import AbilityPicker from './components/AbilityPicker.vue'
import AbilityFilterInterface from './types/AbilityFilter.interface'
import AbilityPickerInterface from './types/AbilityPicker.interface'
import ColumnPicker from './components/ColumnPicker.vue'
import ColumnFilterInterface from './types/ColumnFilter.interface'

import AttributeInterface from './types/Attribute.interface'
import AbilityType from './types/AbilityType.enum'

// data source: https://docs.google.com/spreadsheets/d/1-5Nmp_vycD2VpLbuqWnnQL1Lvx-nPy-cGYLPIckGRLk/edit?usp=sharing
// created by Reddit user u/Fleffle
import allShipsJSON from './assets/shipdata.json'
import allAttributesJSON from './assets/attributedata.json'
import lastUpdated from './assets/lastupdated.json'

// data source: https://sto.fandom.com/wiki/Bridge_officer_and_kit_abilities
import allAbilitiesJSON from './assets/abilitydata.json'

const allShips = allShipsJSON
const allAttributes = allAttributesJSON as AttributeInterface[]
const allAbilities: any = allAbilitiesJSON

const worker = new Worker(new URL('./workers/worker.ts', import.meta.url))

worker.addEventListener("message", (e) => {
	const filteredShipIds = e.data as number[]
	const filteredShips = allShips.filter((ship, index) => filteredShipIds.includes(index))
	shipsFilteredByAbilities.value = filteredShips
	isLoading.value = false
})

function openURL(url: string) {
	window.open(url)
}

// initial state is all ships
const shipsFilteredByAbilities = ref(allShips)

const isLoading = ref(false)

//***********************************************************************//
// ATTRIBUTES
//***********************************************************************//

const attributes = ref<AttributeFilterInterface[]>([])
let nextAttributeId = 1

function addAttribute(a: AttributePickerInterface) {

	const {name, idx, operator, value} = a

	let values: string[] = []
	if (!Array.isArray(value)) {
		values = [value]
	} else {
		values = value
	}

	// format the attribute as a string for display in a chip later
	let displayString = `${name} ${operator} ${values.join(', ')}`

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
	var match = attributes.value.find(a => a.idx === idx && a.operator === operator)
	if (match) {

		// if operator is equals or not equals merge it.
		// if less-than equals or greater-than equals replace it.
		if (operator === "=" || operator === "!=") {
			match.value = [...new Set([...match.value ,...values])].sort()
		} else if (operator === "<=" || operator === ">=") {
			match.value = values
		}

		match.displayString = `${match.name} ${match.operator} ${match.value.join(', ')}`

	} else {
		attributes.value.push({
			id: nextAttributeId++,
			name: name,
			idx: idx,
			operator: operator,
			value: values,
			displayString: displayString
		})
	}
}

//***********************************************************************//
// ABILITIES
//***********************************************************************//

const abilities = ref<AbilityFilterInterface[]>([])
let nextAbilityId = 1
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

function addNewAbility(a: AbilityPickerInterface) {

	const { typespec, name, level, rank } = a

	// format the ability as a string for display in a chip later
	let displayString = `${typespec} - ${name} ${ rank > 4 ? `(Any)` : `${level} (${rank})`}`

	abilities.value.push({
		id: nextAbilityId++,
		typespec: typespec,
		name: name,
		level: level,
		rank: rank,
		typeorspec: typeLookup.get(typespec) as AbilityType,
		displayString: displayString
	})
}

// when abilities change, have the web worker re-filter the list of ships
watch(abilities, () => {
	if (abilities.value.length === 0) {
		shipsFilteredByAbilities.value = allShips
	} else {
		isLoading.value = true
		worker.postMessage( JSON.parse(JSON.stringify(abilities.value)) )
	}
},{ deep: true })

//***********************************************************************//
// Columns
//***********************************************************************//

const IDCOL = 0
const NAMECOL = 1
const URLCOL = 58
const SEATSCOL = 61
const columns = ref<ColumnFilterInterface[]>([])
let nextColumnId = 1

function addNewColumn(indexes: Array<number>) {

	// make a deep copy of the list of columns
	let cols: ColumnFilterInterface[] = JSON.parse(JSON.stringify(columns.value))

	// loop over the column keys and add any new ones we find
	indexes.forEach(idx => {
		// check for duplicates
		let result = cols.filter(c => c.idx === idx)
		if (result.length === 0) {
			// look up column name
			let label = allAttributes.filter(a => a.idx === idx)[0].label
			cols.push({
				id: nextColumnId++,
				label: label,
				idx: idx
			})
		}
	})
	columns.value = cols
}

const rows = computed(() => {  // All the rows to be shown

	// rows to display start with the list of ships filtered by chosen abilities
	let ships = shipsFilteredByAbilities.value

	// filter ships based on the attributes chosen
	// a.value is an array of strings so we need to convert ship[a.key] to a string
	// TODO: come up with a less hacky way of handling that
	attributes.value.forEach( a => {
		if (a.operator === "=") {
			ships = ships.filter(ship => a.value.includes(""+ship[a.idx]))
		} else if (a.operator === "!=") {
			ships = ships.filter(ship => !a.value.includes(""+ship[a.idx]))
		} else if (a.operator === ">=") {
			ships = ships.filter(ship => ship[a.idx] >= a.value[0])
		} else if (a.operator === "<=") {
			ships = ships.filter(ship => ship[a.idx] <= a.value[0])
		}
	})

	return ships.map(row => Object.assign({},row))
})

</script>

<template>
<div class="p-component">

	<h1>STO Ship DB</h1>
	<BlockUI :blocked="isLoading" :fullScreen="true"></BlockUI>
	<ProgressSpinner v-show="isLoading" class="overlay"/>

	<p>Filter ships by attributes and bridge officer abilities to find your perfect ship in the <Button
			link
			label="Star Trek Online"
			:pt="{ label: { class: 'selectable' } }"
			@click="openURL('https://www.arcgames.com/en/games/star-trek-online')"
		/> game.</p>

	<p>Created by Reddit user <Button
			link
			label="u/wkrick"
			:pt="{ label: { class: 'selectable' } }"
			@click="openURL('https://www.reddit.com/user/wkrick')"
		/> using data from the <Button
			link
			label="Sortable/Filterable T6 Ship List"
			:pt="{ label: { class: 'selectable' } }"
			@click="openURL('https://docs.google.com/spreadsheets/d/1-5Nmp_vycD2VpLbuqWnnQL1Lvx-nPy-cGYLPIckGRLk/edit?usp=sharing')"
		/> by Reddit user <Button
			link
			label="u/Fleffle"
			:pt="{ label: { class: 'selectable' } }"
			@click="openURL('https://www.reddit.com/user/Fleffle')"
		/>.</p>

		<p>Note: The total number of ships in this app is higher than the source data because Science Destroyers with Tactical/Science modes are each treated as two distinct ships for more accurate filtering.</p>

		<p>Last updated {{ lastUpdated.date }}</p>

	<form>

		<fieldset class="fieldset">
			<legend class="legend">Ship Attributes</legend>
			<p>Choose the attributes that you would like your ship to have.</p>
			<AttributePicker :all-ships="allShips" :all-attributes="allAttributes" @add-attribute="addAttribute" />
			<div v-show="attributes.length">
				<hr>
				<div>
					<Chip
						v-for="(attribute, index) in attributes"
						class="mr-2 mb-2"
						:label="attribute.displayString"
						:key="attribute.id"
						removable
						@remove="attributes.splice(index, 1)"
					/>
				</div>
			</div>

		</fieldset>

	</form>

	<form>

		<fieldset class="fieldset">
			<legend class="legend">Bridge Officer Abilities</legend>
			<p>Choose the bridge officer abilities you would like to use on your ship.</p>
			<AbilityPicker :all-abilities="allAbilities" @add-ability="addNewAbility" />
			<div v-show="abilities.length">
				<hr>
				<div>
				<Chip
					v-for="(ability, index) in abilities"
					class="mr-2 mb-2"
					:label="ability.displayString"
					:key="ability.id"
					removable
					@remove="abilities.splice(index, 1)"
				/>
				</div>
			</div>

		</fieldset>

	</form>

	<form>
		<fieldset class="fieldset">
			<legend class="legend">Additional Result Details</legend>
			<p>Choose additional information about each ship to display in the results.</p>
			<ColumnPicker :all-attributes="allAttributes" @add-columns="addNewColumn" />
				<div v-show="columns.length">
					<hr>
					<div>
					<Chip
						v-for="(column, index) in columns"
						class="mr-2 mb-2"
						:label="column.label"
						:key="column.id"
						removable
						@remove="columns.splice(index, 1)"
					/>
				</div>
			</div>
		</fieldset>

	</form>

	<fieldset class="fieldset">
		<legend class="legend">Ships Matched ({{ rows.length }} of {{ allShips.length }})</legend>
		<DataTable :value="rows" :dataKey="String(IDCOL)">
			<template #empty>
				No ships found.
			</template>
			<template #loading>
				Loading ship data....
			</template>
			<Column :field="String(NAMECOL)" header="Name" sortable>
				<template #body="slotProps">
					<Button
						class="table-ship-name" 
						link
						:label="slotProps.data[NAMECOL]"
						:pt="{ label: { class: 'selectable' } }"
						@click="openURL(slotProps.data[URLCOL])"
					/>
				</template>
			</Column>
			<Column :field="String(SEATSCOL)" header="Seats">
				<template #body="slotProps">
					<span class="table-other">{{ slotProps.data[SEATSCOL] }}</span>
				</template>
			</Column>
			<Column v-for="col of columns" :key="col.id" :field="String(col.idx)" :header="col.label" sortable>
				<template #body="slotProps">
					<span class="table-other">{{ slotProps.data[col.idx] }}</span>
				</template>
			</Column>
		</DataTable>
	</fieldset>

</div>
</template>

<style>

</style>
