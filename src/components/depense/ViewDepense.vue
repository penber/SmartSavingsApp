<template>
  <div class="expense-item">

    <section >
      <header :style="headerStyle">
        <h2 class="expense-amount">{{ expense.amount }} CHF</h2>
        <p>{{ expense.description }}</p>
        <ion-toggle @ionChange="toggleContent" :checked="isContentVisible" label-placement="end" style="color: rgb(255, 254, 254) ; font-size: 13px;">Plus</ion-toggle>

      </header>
      <div id="contenu" v-if="isContentVisible">
        <article class="expense-info">
          <p v-if="expense.budget"> <span>Budget</span>  :  {{ getBudgetName(expense.budget) }} </p>
        </article>
      </div>
      <footer class="expense-actions" v-if="isContentVisible">
        <button class="button-modify" @click="redirectToDetailPage(expense._id)">Détails</button>
        <button class="button-modify" @click="emitcurrentExpense()">Modifier</button>
        <button class="button-delete" @click="promptDeleteExpense(expense._id)">Supprimer</button>
      </footer>
    </section>
  </div>

  
      
  <IonAlert
      :is-open="showAlert"
      :message="alertMessage"
      :buttons="['OK']"
      @ionAlertDidDismiss="handleAlertDismiss"
    />


    <IonAlert
    :is-open="showDeleteConfirm"
    message="Êtes-vous sûr de vouloir supprimer cette dépense ?"
    :buttons="deleteConfirmButtons"
  />
</template>

<script>
import { IonToggle } from '@ionic/vue';
import { defineComponent } from 'vue';


import { mapActions, mapGetters } from 'vuex';

import { IonPage, IonContent, IonAlert} from '@ionic/vue';

export default {
    components: { IonToggle,
    IonAlert },
  
  props: {
    expense: Object,
    budgets: Array,
  },
  emits: ['editExpense'],

  data() {
    return {
      currentExpense: null,
      showDetails: false,
      isContentVisible: false, // Par défaut, le contenu est masqué
      showAlert: false,
      alertMessage: '',
      alertButtons: ['OK'],
      showDeleteConfirm: false,
      deleteExpenseId: null
    };

  
  },

  computed: {
    deleteConfirmButtons() {
      return [
        {
          text: 'Annuler',
          role: 'cancel',
          handler: () => {
            this.showDeleteConfirm = false;
          }
        },
        {
          text: 'Confirmer',
          handler: () => {
            this.showDeleteConfirm = false;
            this.confirmDeleteExpense(this.deleteExpenseId);
          }
        }
      ];
    },

    headerStyle() {
      const budget = this.budgets.find(b => b._id === this.expense.budget);
      const backgroundColor = budget && budget.color ? budget.color : 'darkblue';
      return {
        backgroundColor: backgroundColor,
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: 'white',
        padding: '10px 20px 10px 10px',
        borderRadius: '5px',
        maxHeight: '50px',
      };
    },


  },

  methods: {
    ...mapActions('depenses', ['fetchAllExpenses', 'addExpense', 'updateExpense', 'deleteExpenseFromStore']),
    ...mapActions('budget', ['fetchBudgets']),
  
    redirectToDetailPage(expenseId) {
      this.$router.push({ name: 'DetailDepense', params: { id: expenseId } });
    },
    getBudgetName(budgetId) {
      const budget = this.budgets.find(b => b._id === budgetId);
      return budget ? budget.category : '';
    },

  toggleContent() {
      this.isContentVisible = !this.isContentVisible;
    },


    confirmDeleteExpense(expenseId) {
      try {
        this.deleteExpenseFromStore(expenseId);
        this.triggerAlert('La dépense a été supprimée avec succès');
      } catch (error) {
    const errorMessage = error.message || "Une erreur inconnue est survenue";
    console.error(errorMessage);
    this.triggerAlert(errorMessage);
      }
    },

    promptDeleteExpense(expenseId) {
      this.deleteExpenseId = expenseId;
      this.showDeleteConfirm = true;
    },

    triggerAlert(errorMessage) {
    this.alertMessage = errorMessage;
    this.showAlert = true;
  },
    handleAlertDismiss() {
      this.showAlert = false;
    },

   emitcurrentExpense() {
    this.currentExpense = this.expense;
      this.$emit('editExpense', this.currentExpense);
    },
  }
};


</script>
<style scoped>
.expense-item {
  background-color: #f4f4f8; /* Light background */
  border-radius: 10px;
  border: #b9c1c9 2px solid;
  margin: 10px 0;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.25);
  transition: transform 0.3s ease;
}

.expense-item:hover {
  transform: translateY(-5px); /* subtle hover effect */
}


#header p {
  font-family: 'Open Sans', sans-serif;
  font-size: 0.85em;
}

.expense-amount {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  font-family: 'Roboto', sans-serif;
  font-size: 1.2em;
  font-weight: bold;
  line-height: 1.4;
  margin:0px;
}
.expense-info p span{
  font-family: 'Open Sans', sans-serif;
  color: #000000;
  margin: 0;
  font-weight: bold;
}

.expense-info p {
  font-family: 'Open Sans', sans-serif;
  color: #000000;
  margin: 0;
}

#contenu {
  padding-top: 8px;
  padding-left: 10px;
  padding-bottom: 9px;
  background-color: #f4fcff;
}

.expense-actions {
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  width:100%;
  padding: 5px 10px 10px 10px;
  padding-bottom: 10px;
  background-color: #f1fbff;
  border-radius: 10px;

}


.button-modify, .button-delete {
  padding: 8px 15px;
  font-size: 16px;
  border: none;
  border-radius: 6px;
  font-family: 'Lato', sans-serif;
  cursor: pointer;
  transition: background-color 0.3s, box-shadow 0.3s;
}


.button-modify {
  background-color: #76879a; /* Bootstrap primary color */
  color: white;
}

.button-modify:hover {
  background-color: #0056b3; /* Darker shade for hover effect */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.button-delete {
  background-color: #d98a88; /* Bordeaux */
  color: white;
}

.button-delete:hover {
  background-color: #892d2b; /* Darker shade for hover effect */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

</style>
