import { createApp } from 'vue'
import App from './App.vue'

// PrimeVue
import PrimeVue from 'primevue/config'
import MultiSelect from 'primevue/multiselect'
import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'
import Chip from 'primevue/chip'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import BlockUI from 'primevue/blockui'
import ProgressSpinner from 'primevue/progressspinner'

import"primevue/resources/themes/nova/theme.css"
import "primevue/resources/primevue.min.css"
import "primeflex/primeflex.css"
import "primeicons/primeicons.css"

import './assets/global.css'

const app = createApp(App)
app.use(PrimeVue)
app.component('MultiSelect', MultiSelect)
app.component('Dropdown', Dropdown)
app.component('Button', Button)
app.component('Chip', Chip)
app.component('DataTable', DataTable)
app.component('Column', Column)
app.component('BlockUI', BlockUI)
app.component('ProgressSpinner', ProgressSpinner)
app.mount('#app')