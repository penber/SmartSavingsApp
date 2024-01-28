import { createStore } from 'vuex';
import { auth } from './auth';
import { budget } from './budget.js';
import {depenses} from './depense.js';
import {user} from './user.js';

export default createStore({
  modules: {
    auth,
    budget,
   depenses,
    user
  }
});