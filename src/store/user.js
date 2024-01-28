import axios from 'axios';

export const user = {
  namespaced: true,
  state: () => ({
    user: null,
    userId: localStorage.getItem('userId') || null, 
  }),
  mutations: {
    SET_USER(state, user) {
        state.user = user;
      },
  },
  actions: {
    async fetchUserProfile({ commit, state }) {
        try {
          console.log(state.userId);
          const response = await axios.get(`/api/users/${state.userId}`);
          commit('SET_USER', response.data);
        } catch (error) {
          console.error('fetchUserProfile error', error);
          if (error.response.data.message) {
            throw error.response.data;
          } else {
            throw new Error('Erreur lors de la récupération du profil');
          }           }
      },
      
    async updateUserProfile({ commit, state }, userData) {
      try {
        console.log(userData);
        const response = await axios.put(`/api/users/${state.userId}`, userData, );
        console.log(response.data);
        commit('SET_USER', response.data);
      } catch (error) {
        console.error('updateUserProfile error', error);
        if (error.response.data.message) {
          throw error.response.data;
        } else {
          throw new Error('Erreur lors de la mise à jour du profil');
        }        }
    },

    async deleteUserProfile({ commit, state }) {
      try {
        const response = await axios.delete(`/api/users/${state.userId}`);
        commit('SET_USER', response.data);
      } catch (error) {
        console.error('deleteUserProfile error', error);
        if (error.response.data.message) {
          throw error.response.data;
        } else {
          throw new Error('Erreur lors de la suppression du profil ');
        }           }
    },
},
  getters: {
    user: state => state.user,
  }
};
