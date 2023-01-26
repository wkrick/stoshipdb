<script setup lang="ts">
import { ref } from 'vue'
import ShipInterface from '../types/Ship.interface';
import ShipAttributeInterface from '../types/ShipAttribute.interface'

const props = defineProps<{
	allAttributes: ShipAttributeInterface[]
}>()

const emit = defineEmits<{
	(e: 'addColumns', columns: Array<keyof ShipInterface>): void
}>()

const columns = ref()

</script>

<template>
    <div>
        <div>
            <MultiSelect
                v-model="columns"
                :options="allAttributes"
                optionLabel="label"
                optionValue="key"
                placeholder="Select Attribute"
                scrollHeight="400px"
            />
            <Button
                @click="emit('addColumns', columns); columns = undefined"
                :disabled="!columns"
                icon="pi pi-plus-circle"
            />
        </div>
    </div>
</template>

<style scoped>
</style>