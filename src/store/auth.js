import axios from 'axios';

export const auth = {
  namespaced: true,

  state: () => ({
    token: localStorage.getItem('token') || null,
    userId: localStorage.getItem('userId') || null,
  }),
  mutations: {
    SET_TOKEN(state, token) {
      state.token = token;
    },
    CLEAR_TOKEN(state) {
      state.token = null;
      state.userId = null;
    },
    SET_USER_DATA(state, { token, userId }) {
      state.userId = userId;
      localStorage.setItem('userId', userId);
    },
  },
  actions: {


    async register({ commit }, userData) {
      try {
        const response = await axios.post('/api/users/register', userData);
        const { token, userId } = response.data;
        commit('SET_TOKEN', token);
        commit('SET_USER_DATA', { token, userId });
        localStorage.setItem('token', token);
      } catch (error) {
        console.error('Register error:', error.response);
        if (error.response && error.response.status === 400 && error.response.data.errors) {
          throw new Error(error.response.data.errors.map(e => e.msg).join(', '));
        } else if (error.response && error.response.data && error.response.data.message) {
          throw new Error(error.response.data);
        } else {
          throw new Error('Erreur inconnue lors de l\'inscription');
        }
      }
    },
    
async login({ commit }, credentials) {
  try {
    const response = await axios.post('/api/users/login', credentials);
    const { token, userId } = response.data;
    commit('SET_TOKEN', token);
    commit('SET_USER_DATA', { token, userId });
    localStorage.setItem('token', token);
  } catch (error) {
    console.error('Login error:', error.response);
    // Vérifier si la réponse contient un message d'erreur spécifique
    if (error.response && error.response.data && typeof error.response.data === 'string') {
      throw new Error(error.response.data);
    } else if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data);
    } else {
      throw new Error('Erreur lors de la connexion');
    }
  }
},
    logout({ commit }) {
      commit('CLEAR_TOKEN');
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
    }
  },
  getters: {
    isAuthenticated(state) {
      return !!state.token;
    }
  }
};
