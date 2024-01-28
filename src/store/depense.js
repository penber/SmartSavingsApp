import axios from 'axios';

export const depenses = {
  namespaced: true,
  state: () => ({
    depenses: [],
    loading: false,
    error: null
  }),
  mutations: {
    SET_DEPENSES(state, depenses) {
      state.depenses = depenses;
    },
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    ADD_EXPENSE(state, expense) {
      state.depenses.push(expense);
    },
    UPDATE_EXPENSE(state, updatedExpense) {
      const index = state.depenses.findIndex(expense => expense._id === updatedExpense._id);
      if (index !== -1) {
        state.depenses.splice(index, 1, updatedExpense);
      }
    },
    DELETE_EXPENSE(state, expenseId) {
      state.depenses = state.depenses.filter(expense => expense._id !== expenseId);
    }
  },
  actions: {

    async fetchAllExpenses({ commit }) {
      commit('SET_LOADING', true);
      try {
        const response = await axios.get('/api/expenses');
        commit('SET_DEPENSES', response.data);
      } catch (error) {
        commit('SET_ERROR', error.response?.data|| 'Erreur lors de la récupération des dépenses');
      } finally {
        commit('SET_LOADING', false);
      }
    },
 
    async fetchExpenseById({ commit }, expenseId) { 
      try {
        const response = await axios.get(`/api/expenses/${expenseId}`);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', 'Erreur lors de la récupération de la dépense');
        if (error.response.data) {
          throw error.response.data;
        } else {
          throw new Error('Erreur lors de la récupération de la dépense');
        }          }
    },


    async addExpense({ commit }, expenseData) {
      try {
        const response = await axios.post('/api/expenses', expenseData);
          // if (expenseData.location && expenseData.location.coordinates) {
        //   commit('ADD_EXPENSE_WITH_LOCATION', response.data);
        // }
        commit('ADD_EXPENSE', response.data);
      } catch (error) {
        commit('SET_ERROR', error.response?.data || 'Erreur lors de la création de la dépense');
        throw new Error(error.response?.data?.message || 'Erreur lors de la création de la dépense');
      }
    },
    


    async updateExpense({ commit }, { expenseId, expenseData }) {
      try {
        const response = await axios.put(`/api/expenses/${expenseId}`, expenseData);
        commit('UPDATE_EXPENSE', response.data);
      } catch (error) {
        const errorMessage = error.response?.data || 'Erreur lors de la mise à jour de la dépense';
        commit('SET_ERROR', errorMessage);
        throw new Error(errorMessage);
      }
    },


    async deleteExpenseFromStore({ commit }, expenseId) {
      try {
        const response = await axios.delete(`/api/expenses/${expenseId}`);
        commit('DELETE_EXPENSE', expenseId);
        return response.data; // Au cas où vous auriez besoin des données renvoyées
      } catch (error) {
        const errorMessage = error.response?.data || 'Erreur lors de la suppression de la dépense';
        commit('SET_ERROR', errorMessage);
        throw new Error(errorMessage);
      }
    },
    async fetchExpenseById({ commit }, expenseId) { 
      try {
        const response = await axios.get(`/api/expenses/${expenseId}`);
        return response.data;
      } catch (error) {
        const errorMessage = error.response?.data || 'Erreur lors de la récupération de la dépense';
        commit('SET_ERROR', errorMessage);
        throw new Error(errorMessage);
      
      }
    }

  },
  getters: {
    depenses: state =>  state.depenses,
    totalExpensesAmount: state => {
      return state.depenses.reduce((total, expense) => total + expense.amount, 0);
    },

    depensesChronoRecentAncien: state => {
      return [...state.depenses].sort((a, b) => new Date(b.date) - new Date(a.date));
    },
    depensesChronoAncienRecent: state => {
      return [...state.depenses].sort((a, b) => new Date(a.date) - new Date(b.date));
    },
    depensesMontantDecroissant: state => {
      return [...state.depenses].sort((a, b) => b.amount - a.amount);
    },
    depensesMontantCroissant: state => {
      return [...state.depenses].sort((a, b) => a.amount - b.amount);
    },
    // Dans votre store Vuex (dans la section getters)
    depensesAvecLocalisation: state => {
      const avecLocalisation = state.depenses.filter(d => d.location && d.location.coordinates);
      console.log('Depenses avec localisation:', avecLocalisation);
      return avecLocalisation;
    },
    

  }
};
