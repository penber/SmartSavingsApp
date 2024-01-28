import { createRouter, createWebHistory } from '@ionic/vue-router';
import store from '../store'; 
import Connexion from '../views/Connexion.vue';
import Accueil from '../views/Accueil.vue';
import budgets from '../views/budget/budgets.vue';
import PageDepenses from '../views/depenses/PageDepenses.vue';
import MonCompte from '../views/user/MonCompte.vue';
import MapPage from '../views/CarteDepenses.vue';
import DepenseBudget from '../views/budget/DepenseBudget.vue';
import DetailDepense from '../views/depenses/DetailDepense.vue';

const routes = [
  { path: '/', 
  redirect: '/connexion'},
{ path: '/connexion', component: Connexion, name: 'connexion'  },

{ path: '/accueil', component: Accueil,
 name: 'accueil',
 meta: { requiresAuth: true },
},

{ path: '/budgets', 
component: budgets,
name: 'budgets',
meta: { requiresAuth: true },
},

{ path: '/depenses', 
component: PageDepenses,
name: 'PageDepenses',
meta: { requiresAuth: true },
},

{ 
  path: '/moncompte', 
  component: MonCompte,
  name: 'MonCompte',
  meta: { requiresAuth: true },
},
  
  { 
    path: '/map', 
    component: MapPage,
    name: 'MapPage',
    meta: { requiresAuth: true },
  },
  {
    path: '/depense-budget/:budgetId',
    component: DepenseBudget,
    name: 'DepenseBudget',
    meta: { requiresAuth: true },
    props: true
  },

  {
    path: '/depenses/:id',
    name: 'DetailDepense',
    meta: { requiresAuth: true },
    component: DetailDepense
  }
];


const router = createRouter({
  history: createWebHistory(),
  routes
})


router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const isAuthenticated = store.getters['auth/isAuthenticated'];

  if (requiresAuth && !isAuthenticated) {
    alert('Vous devez être connecté pour accéder à cette page'); // Afficher une alerte
    next({ name: 'connexion' }); // Rediriger vers la page de connexion
  } else {
    next(); // Sinon continuer
  }
});

export default router
