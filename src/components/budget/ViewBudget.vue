<template>
  <div class="budget-item">
    <section @click="navigateToExpenses(budget._id)">
      <header class="budget-header" :style="headerStyle">
        <h2 class="budget-title">{{ budget.category }}</h2>
      </header>
      <div class="progress-bar-container">
      
    <div class="progress-bar" :style="{ width: progressBarWidth, background : progressBarStyle }"></div>
  </div>
      <div class="budget-content">
        <article class="budget-info">
          <p>Montant : <span class="allocated-amount">{{ budget.allocatedAmount }} CHF</span></p>
          <p>Dépensé : <span :style="{ color: expenseColor }">{{ totalExpenses }} CHF</span></p>
        </article>
      </div>
    </section>
    <footer class="budget-actions">
      <button class="button-modify" @click="emitEditEvent">Modifier</button>
      <button class="button-delete" @click="showDeleteConfirmation">Supprimer</button>
    </footer>
    
 
    <IonAlert
      :is-open="showDeleteConfirm"
      message="Êtes-vous sûr de vouloir supprimer ce budget ?"
      :buttons="deleteBudgetButtons"
    />

    <IonAlert
      :is-open="showDetachExpensesConfirm"
      message="Voulez-vous également supprimer toutes les dépenses associées à ce budget ou les détachées du budget ? "
      :buttons="detachExpensesButtons"
    /> 
    
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import { IonAlert } from '@ionic/vue';

export default {
  components: {
    IonAlert
  },
  props: {
    budget: Object,
  },
  data() {
    return {
      alertMessage: '',
      showDeleteConfirm: false,
      showDetachExpensesConfirm: false,
      totalExpenses: 0,
      couleurbudget : ''

    };
  },
  computed: {
    ...mapGetters('budget', ['expensesByBudget']),

    progressBarWidth() {
      const percentage = this.totalExpenses / this.budget.allocatedAmount * 100;
      return `${Math.min(percentage, 100)}%`; // Limite à 100%
    },
    headerStyle() {
      return {
        backgroundColor: this.budget.color ? this.budget.color : 'darkblue',
        color: '#ffffff',
        padding: '15px',
        textAlign: 'center'
      };
    },
    progressBarStyle() {
      const budgetColor = this.budget.color || 'lightblue'; // Utilisez une couleur par défaut si `this.budget.color` n'est pas défini
      return `linear-gradient(to right, ${budgetColor}, darkblue)`; // Utilisation d'un gradient linéaire
    },

    expenseColor() {
      const percentage = this.totalExpenses / this.budget.allocatedAmount;
      if (percentage < 0.17) {
        return 'darkgreen'; // Moins de 17% du budget utilisé
      } else if (percentage < 0.34) {
        return 'green'; // Entre 17% et 34% du budget utilisé
      } else if (percentage < 0.51) {
        return 'yellowgreen'; // Entre 34% et 51% du budget utilisé
      } else if (percentage < 0.68) {
        return 'yellow'; // Entre 51% et 68% du budget utilisé
      } else if (percentage < 0.85) {
        return 'orange'; // Entre 68% et 85% du budget utilisé
      } else {
        return 'red'; // Plus de 85% du budget utilisé
      }
    },


    
    deleteBudgetButtons() {
      return [
        {
          text: 'Annuler',
          role: 'cancel',
          handler: () => {
            this.showDeleteConfirm = false;
          },
        },
        {
          text: 'Confirmer',
          handler: this.handleDeleteBudget,
        },
      ];
    },
    detachExpensesButtons() {
      return [
        {
          text: 'Détacher',
          handler: () => {
            this.finalizeDeleteBudget(false);
          },
        },
        {
          text: 'Supprimer',
          handler: () => {
            this.finalizeDeleteBudget(true);
          },
        },
      ];
    },
  },
  methods: {
    ...mapActions('budget', [
      'fetchBudgets',
      'fetchExpensesByBudget',
      'deleteBudgetWithExpenses',
      'detachExpensesFromBudget',
    ]),

    navigateToExpenses(budgetId) {
      this.$router.push({ name: 'DepenseBudget', params: { budgetId } });
    },

    async finalizeDeleteBudget(deleteExpenses) {
      try {
        if (deleteExpenses) {
          await this.deleteBudgetWithExpenses(this.budget._id);
        } else {
          await this.detachExpensesFromBudget(this.budget._id);
        }
        await this.fetchBudgets();
      } catch (error) {
        const errorMessage = error.message || "Une erreur inconnue est survenue";
        console.error(errorMessage);
        alert(errorMessage);      }
    },

    showDeleteConfirmation() {
      this.showDeleteConfirm = true;
    },

    handleDeleteBudget() {
      this.showDeleteConfirm = false;
      this.showDetachExpensesConfirm = true;
    },

    emitEditEvent() {
      this.$emit('edit-budget', this.budget);
    },

    async updateTotalExpenses() {
     await this.fetchExpensesByBudget(this.budget._id);

      this.totalExpenses = this.expensesByBudget
        .filter(expense => expense.budget === this.budget._id)
        .reduce((total, expense) => total + expense.amount, 0);
    },
  },
  watch: {
    'budget._id': {
    handler(newId, oldId) {
      if (newId !== oldId) {
        this.updateTotalExpenses();
      }
    },
    immediate: true,
  },
},
  mounted() {
    this.fetchExpensesByBudget(this.budget._id);
  },
};
</script>



<style scoped>


/* Styles généraux */
body {
  font-family: 'Roboto', sans-serif;
  background-color: #f4f7f6;
  color: #333;
}

/* Style des items du budget */
.budget-item {
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.25);
  margin: 10px;
  overflow: hidden;
}

.budget-title {
  margin: 0;
  font-size: 1.2em;
}

.budget-content {
  padding: 15px;
  padding-bottom: 0;
}

.budget-info  {
 display: flex;
 width: 100%;
  flex-direction:column;
  justify-content: space-between;
  padding-bottom: 10px;
}
.budget-info p {
  margin: 0px 0;
  font-size: 1.2em;
  line-height: 1.6;
}

.allocated-amount {
  font-weight: bold;
  color: #3a86ff; /* Bleu complémentaire */
}

.progress-bar-container {
  width: 100%;
  background-color: #eeeeee00;
  margin: 0;
  border-radius: 0;
}

.progress-bar {
  height: 10px;
  /* background-image: linear-gradient(to right, #3a86ff, #005f73); */
  transition: width 0.5s ease-in-out;

  border-radius: 0px 6px 6px 0px;

}
/* Style des boutons */
.button-modify, .button-delete {
  border: none;
  border-radius: 10px;
  padding: 10px 15px;
  font-size: 0.9em;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 5px;
}

.budget-actions {

  display:flex;
  flex-direction: row;
  justify-content: space-around;
  padding-bottom: 10px;
}

.budget-actions button {

  width: 40%
}
.button-modify {
  background-color: #3a86ff;
  color: white;
}

.button-delete {
  background-color: #9e2a2b; /* Rouge bordeaux */
  color: white;
}

.button-modify:hover, .button-delete:hover {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  transform: translateY(-2px);
}

/* Animation au survol */
.budget-item:hover {
  transform: scale(1.02);
  transition: transform 0.3s ease;
}

/* Styles pour les champs de formulaire (si applicable) */
input, select, textarea {
  width: 100%;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ddd;
  margin-bottom: 15px;
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: #3a86ff;
  box-shadow: 0 0 5px rgba(58, 134, 255, 0.5);
}



</style>