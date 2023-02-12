<script setup lang="ts">
import { ref, watch } from 'vue'
import AttributePickerInterface from '../types/AttributePicker.interface'
import AttributeInterface from '../types/Attribute.interface'

const props = defineProps<{
	allShips: (string | number)[][]
	allAttributes: AttributeInterface[]
}>()

const emit = defineEmits<{
	(e: 'addAttribute', attribute: AttributePickerInterface): void
}>()

const name = ref()
const idx = ref()
let operators: string[] = ["=", "!="]
const operator = ref("=")
let values: string[]
const value = ref()

function isNumeric(s: string) {
	// match numbers:  1, .1, 1.1, etc... with optional positive/negative prefix
	// Note: does not handle exponents/NaN/Inf
	// source: https://stackoverflow.com/questions/12643009/regular-expression-for-floating-point-numbers
	return /^[+-]?([0-9]*[.])?[0-9]+$/.test(s)
}

function getOpts(idx: number) {
	// PrimeVue handles "0" strangely when the options are numbers
	// so make sure result is always an array of strings
	// TODO: revisit this later

	let values = [...new Set(props.allShips.map(item => item[idx]))]
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

watch(name, () => {
	idx.value = undefined
	operators = ["=", "!="]
	operator.value = "="
	values = []
	value.value = undefined
	if (name.value) {
		// update the idx
		idx.value = props.allAttributes.filter(a => a.label === name.value)[0].idx
		// update the list of values
		values = getOpts(idx.value)
		// update the operators if values are numeric
		if (isNumeric(values[0])) {
			operators = ["=", "!=", "<=", ">="]
		}
	}
})

watch(operator, () => {
	value.value = undefined
})

</script>

<template>
	<div>
		<div>
			<Dropdown
				v-model="name"
				:options="allAttributes"
				optionLabel="label"
				optionValue="label"
				placeholder="Select Attribute"
				scrollHeight="400px"
			/>
		</div>
		<div>
			<Dropdown
				v-model="operator"
				:options="operators"
				:disabled="!name"
				scrollHeight="400px"
			/>
		</div>
		<div>
			<template v-if="operator==='='||operator==='!='">
				<MultiSelect
					v-model="value"
					:options="values"
					placeholder="Select Value"
					:disabled="!name"
					scrollHeight="400px"
				/>
			</template>
			<template v-else>
				<Dropdown
					v-model="value"
					:options="values"
					placeholder="Select Value"
					:disabled="!name"
					scrollHeight="400px"
				/>
			</template>
			<Button
				@click="emit('addAttribute', {
					name: name,
					idx: idx,
					operator: operator,
					value: value
				}); name = undefined"
				:disabled="!value"
				icon="pi pi-plus-circle"
			/>
		</div>
	</div>
</template>

<style scoped>
</style>
