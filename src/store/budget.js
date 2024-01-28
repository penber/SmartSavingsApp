import axios from 'axios';

export const budget = {
  namespaced: true,
  state: () => ({
    budgets: [],
    loading: false,
    error: null,
    expensesByBudget: [],

  }),
  mutations: {
    SET_BUDGETS(state, budgets) {
      state.budgets = budgets;
    },
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    ADD_BUDGET(state, budget) {
      state.budgets.push(budget);
    },
    UPDATE_BUDGET(state, { budgetId, budgetData }) {
      const index = state.budgets.findIndex(budget => budget._id === budgetId);
      if (index !== -1) {
        state.budgets[index] = { ...state.budgets[index], ...budgetData };
      }
    },
    DELETE_BUDGET(state, budgetId) {
      state.budgets = state.budgets.filter(budget => budget._id !== budgetId);
    },

    SET_EXPENSES_BY_BUDGET(state, expenses) {
      state.expensesByBudget = expenses;
    },
  },
  actions: {
    async fetchBudgets({ commit }) {
      commit('SET_LOADING', true);
      try {
        const response = await axios.get('/api/budgets');
        commit('SET_BUDGETS', response.data);
        commit('SET_LOADING', false);
      } catch (error) {
        const errorMsg = error.response?.data?.message || 'Erreur lors de la récupération des budgets';
    commit('SET_ERROR', errorMsg);
    commit('SET_LOADING', false);
    throw new Error(errorMsg);
          }
    },
    async createBudget({ commit }, budget) {
      try {
        const response = await axios.post('/api/budgets', budget);
        commit('ADD_BUDGET', response.data);
      } catch (error) {
        const errorMsg = error.response?.data?.message || 'Erreur lors de la création du budget';
          commit('SET_ERROR', errorMsg);
          if (error.response?.data?.message) {
            throw error.response.data;
          } else {
            throw new Error(errorMsg);
          }
        }
    },
    async updateBudget({ commit }, { budgetId, budgetData }) {
      try {
        const response = await axios.put(`/api/budgets/${budgetId}`, budgetData);
        commit('UPDATE_BUDGET', { budgetId, budgetData: response.data });
      } catch (error) {
        console.error('updateBudget error', error.response.data.message);
        commit('SET_ERROR', error.response.data|| 'Erreur lors de la mise à jour du budget');
        if (error.response.data.message) {
          throw error.response.data;
        } else {
          throw new Error('Erreur lors de la mise à jour du budget');
        }          }
    },

    
      async fetchBudgetById({ commit }, budgetId) {
        commit('SET_LOADING', true);
        try {
          const response = await axios.get(`/api/budgets/${budgetId}`);
          commit('SET_LOADING', false);
          return response.data;  
        } catch (error) {
          commit('SET_ERROR', error.response.data || 'Erreur lors de la récupération du budget');
          commit('SET_LOADING', false);
          if (error.response.data.message) {
            throw error.response.data;
          } else {
            throw new Error('Erreur inconnue lors de la récupération du budget');
          }            }
      },
    

      async fetchExpensesByBudget({ commit }, budgetId) {
        try {
          const response = await axios.get(`/api/budgets/by-budget/${budgetId}`);
          commit('SET_EXPENSES_BY_BUDGET', response.data);
          return response.data; 
        } catch (error) {
          console.error('Erreur lors de la récupération des dépenses pour le budget:', error);
          if (error.response.data.message) {
            throw error.response.data;
          } else {
            throw new Error('Erreur inconnue lors de la récupération des dépenses pour le budget');
          }            }
      },

          
      async fetchAndCalculateTotalExpenses({ dispatch, commit }, budgetId) {
        try {
          const expenses = await dispatch('fetchExpensesByBudget', budgetId);
          const totalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);
          return totalExpenses;
        } catch (error) {
          console.error('Erreur lors du calcul du total des dépenses:', error);
          commit('SET_ERROR', error.message || 'Erreur inconnue lors du calcul des dépenses');
          if (error.response.data.message) {
            throw error.response.data;
          } else {
            throw new Error('Erreur inconnue lors du calcul des dépenses');
          }            }
      },
    
    
    async deleteBudgetWithExpenses({ dispatch }, budgetId) {
      try {
        const expensesResponse = await axios.get(`/api/budgets/by-budget/${budgetId}`);
        
        if (expensesResponse.status === 200 && expensesResponse.data.length > 0) {
          const expenses = expensesResponse.data;
        
          for (const expense of expenses) {
            await axios.delete(`/api/expenses/${expense._id}`);
          }
        }
        
        await axios.delete(`/api/budgets/${budgetId}`);
        dispatch('fetchBudgets');
      } catch (error) {
        console.error('Error in deleteBudgetWithExpenses', error.response?.data?.message || 'Une erreur est survenue');
        if (error.response.data.message) {
          throw error.response.data;
        } else {
          throw new Error('Erreur lors de la suppression du budget');
        }          }
    },
    
    async detachExpensesFromBudget({ dispatch }, budgetId) {
      try {
        const expensesResponse = await axios.get(`/api/budgets/by-budget/${budgetId}`);
        
        if (expensesResponse.status === 200 && expensesResponse.data.length > 0) {
          const expenses = expensesResponse.data;
        
          for (const expense of expenses) {
            await axios.put(`/api/expenses/${expense._id}`, { ...expense, budgetId: null });
          }
        }
        
        await axios.delete(`/api/budgets/${budgetId}`);
        dispatch('fetchBudgets');
      } catch (error) {
        console.error('Error in detachExpensesFromBudget', error.response?.data?.message || 'Une erreur est survenue');
        if (error.response.data.message) {
          throw error.response.data;
        } else {
          throw new Error('Erreur lors de la suppression du budget');
        }          }
    },    
    

  },
  getters: {
    budgets: state => state.budgets,
    totalAllocatedAmount: state => {
      return state.budgets.reduce((total, budget) => total + budget.allocatedAmount, 0);
    },
  
    budgetsChronoRecentAncien: state => {
      return [...state.budgets].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
  
    budgetsChronoAncienRecent: state => {
      return [...state.budgets].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    },
  
    budgetsMontantDecroissant: state => {
      return [...state.budgets].sort((a, b) => b.allocatedAmount - a.allocatedAmount);
    },
  
    budgetsMontantCroissant: state => {
      return [...state.budgets].sort((a, b) => a.allocatedAmount - b.allocatedAmount);
    },

    expensesByBudget: state => state.expensesByBudget,

  }
};
