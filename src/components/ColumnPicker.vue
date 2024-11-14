<script setup lang="ts">
import { ref } from 'vue'
import AttributeInterface from '../types/Attribute.interface'

const props = defineProps<{
	allAttributes: AttributeInterface[]
}>()

const emit = defineEmits<{
	(e: 'addColumns', columns: Array<number>): void
}>()

const columns = ref()

</script>

<template>
    <div class="fit-content">
        <InputGroup>
            <MultiSelect
                v-model="columns"
                :options="allAttributes"
                optionLabel="label"
                optionValue="idx"
                placeholder="Select Attribute"
                scrollHeight="400px"
            />
            <Button
                @click="emit('addColumns', columns); columns = undefined"
                :disabled="!columns"
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