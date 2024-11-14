<script setup lang="ts">
import { ref, watch } from 'vue'
import AbilityPickerInterface from '../types/AbilityPicker.interface'

const props = defineProps<{
	allAbilities: any
}>()

const emit = defineEmits<{
	(e: 'addAbility', ability: AbilityPickerInterface): void
}>()

const typeSpecs = Object.keys(props.allAbilities)
const typeSpec = ref()
let names: string[] = []
const name = ref()
let levels: string[] = []
const level = ref()
let rank = 0

watch(typeSpec, () => {
	names = []
	name.value = undefined
	if (typeSpec.value) {
		names = Object.keys(props.allAbilities[typeSpec.value]).sort()
	}
})

watch(name, () => {
	levels = []
	level.value = undefined
	if (name.value) {
		const firstRank = props.allAbilities[typeSpec.value][name.value]
		switch (firstRank) {
			case 1: 
			case 2: levels = ["I","II","III","Any"]; break
			case 3: levels = ["I","II/III","Any"]; break
		}
	}
})

watch(level, () => {
	rank = 0
	if (level.value) {
		const firstRank = props.allAbilities[typeSpec.value][name.value]
		if (level.value === "I") {
			rank = firstRank
		} else if (level.value === "II" || level.value === "II/III") {
			rank = firstRank + 1
		} else if (level.value === "III") {
			rank = firstRank + 2
		} else {
			// for an "Any" ability, encode the possible ranks for later expansion
			switch (firstRank) {
				case 1: rank = 123; break
				case 2: rank = 234; break
				case 3: rank = 34; break
			}
		}
	}
})

</script>

<template>
	<div class="fit-content">
		<div>
			<Select
				v-model="typeSpec"
				:options="typeSpecs"
				placeholder="Select Type"
				scrollHeight="400px"
			/>
		</div>
		<div>
			<Select
				v-model="name"
				:options="names"
				placeholder="Select Name"
				:disabled="!typeSpec"
				scrollHeight="400px"
			/>
		</div>
		<InputGroup>
			<Select
				v-model="level"
				:options="levels"
				placeholder="Select Level"
				:disabled="!name"
				scrollHeight="400px"
			/>
			<Button
				@click="emit('addAbility', {
					typespec: typeSpec,
					name: name,
					level: level,
					rank: rank
					}); typeSpec = undefined"
				:disabled="!level"
				icon="pi pi-plus-circle"
			/>
		</InputGroup>
	</div>
</template>

<style scoped>
.fit-content {
	width: fit-content;
}
</style>
