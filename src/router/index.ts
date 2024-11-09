import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Tournaments from '../views/Tournaments.vue'
import Teams from '../views/Teams.vue'
import Players from '../views/Players.vue'
import Schedule from '../views/Schedule.vue'
import Groups from '../views/Groups.vue'
import Matches from '../views/Matches.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/tournaments', component: Tournaments },
    { path: '/teams', component: Teams },
    { path: '/players', component: Players },
    { path: '/schedule', component: Schedule },
    { path: '/groups', component: Groups },
    { path: '/matches', component: Matches }
  ]
})

export default router