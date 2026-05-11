import { createApp } from 'vue'
import App from './App.vue'
import router from './router/main.ts'
import '@/assets/scss/global.scss'
    
createApp(App).use(router).mount('#app')


