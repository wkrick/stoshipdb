import { createApp } from 'vue'
import App from './App.vue'

// PrimeVue
import PrimeVue from 'primevue/config'
import MultiSelect from 'primevue/multiselect'
import Select from 'primevue/select'
import Button from 'primevue/button'
import Chip from 'primevue/chip'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import BlockUI from 'primevue/blockui'
import ProgressSpinner from 'primevue/progressspinner'
import InputGroup from 'primevue/inputgroup';

import { definePreset } from '@primeuix/themes';

//import Aura from '@primeuix/themes/aura'
//import Lara from '@primeuix/themes/lara'
import Nora from '@primeuix/themes/nora'
//import Material from '@primeuix/themes/material'

import "primeicons/primeicons.css"

import './assets/global.css'

const MyPreset = definePreset(Nora, {
    semantic: {
        primary: {
            50: '{blue.50}',
            100: '{blue.100}',
            200: '{blue.200}',
            300: '{blue.300}',
            400: '{blue.400}',
            500: '{blue.500}',
            600: '{blue.600}',
            700: '{blue.700}',
            800: '{blue.800}',
            900: '{blue.900}',
            950: '{blue.950}'
        }
    }
});

const app = createApp(App);
app.use(PrimeVue, {
    //unstyled: true
    theme: {
        preset: MyPreset,
        options: {
            //darkModeSelector: false || 'none',
            darkModeSelector: 'system'
        }
    }
});

app.component('MultiSelect', MultiSelect)
app.component('Select', Select)
app.component('Button', Button)
app.component('Chip', Chip)
app.component('DataTable', DataTable)
app.component('Column', Column)
app.component('BlockUI', BlockUI)
app.component('ProgressSpinner', ProgressSpinner)
app.component('InputGroup', InputGroup)
app.mount('#app')