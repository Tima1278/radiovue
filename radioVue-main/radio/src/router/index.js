import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },

  {
    path: '/favorite',
    name: 'contattpreferiti',
    component: () => import(/* webpackChunkName: "about" */ '../views/FavoriteRadio.vue')
    
  },
  {
    path: '/posizione_radio',
    name: 'Posizione Radio',
    component: () => import(/* webpackChunkName: "about" */ '../views/PosizioneRadio.vue')
    
  },
  
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
