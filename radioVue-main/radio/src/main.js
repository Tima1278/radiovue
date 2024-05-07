import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Importa Font Awesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// Importa Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// Aggiungi icone solide alla libreria Font Awesome
library.add(fas)

// Configura Vuetify
const vuetify = createVuetify({
  components,
  directives,
})

const app = createApp(App)

// Registra il componente Font Awesome globalmente
app.component('font-awesome-icon', FontAwesomeIcon)

// Usa Vuetify e Router
app.use(router).use(vuetify).mount('#app')
