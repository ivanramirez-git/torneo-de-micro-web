import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const routes = [
  {
    path: '/',
    component: () => import('../views/Home.vue'),
    meta: { public: true }
  },
  {
    path: '/login',
    component: () => import('../views/Login.vue'),
    meta: { public: true }
  },
  // Match Management Routes
  {
    path: '/matches',
    component: () => import('../views/matches/MatchTable.vue'),
    meta: { public: true }
  },
  {
    path: '/matches/scoresheet',
    component: () => import('../views/matches/MatchList.vue'),
    meta: { public: true }
  },
  {
    path: '/match/:id',
    component: () => import('../views/MatchScoresheet.vue'),
    meta: { public: true }
  },
  {
    path: '/admin',
    component: () => import('../views/admin/Dashboard.vue'),
    meta: { requiresAuth: true },
    children: [
      // Tournament Management
      {
        path: 'tournaments',
        component: () => import('../views/admin/Tournaments.vue')
      },
      {
        path: 'tournament-phases',
        component: () => import('../views/admin/TournamentPhases.vue')
      },
      {
        path: 'groups',
        component: () => import('../views/admin/Groups.vue')
      },

      // Team Management
      {
        path: 'teams',
        component: () => import('../views/admin/Teams.vue')
      },
      {
        path: 'players',
        component: () => import('../views/admin/Players.vue')
      },
      {
        path: 'team-groups',
        component: () => import('../views/admin/TeamGroups.vue')
      },

      // Match Management
      {
        path: 'matches',
        component: () => import('../views/admin/Matches.vue')
      },
      {
        path: 'match-stats',
        component: () => import('../views/admin/MatchStats.vue')
      },
      {
        path: 'time-requests',
        component: () => import('../views/admin/TimeRequests.vue')
      },
      {
        path: 'penalties',
        component: () => import('../views/admin/Penalties.vue')
      },

      // Configuration
      {
        path: 'venues',
        component: () => import('../views/admin/Venues.vue')
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login');
  } else {
    next();
  }
});

export default router;