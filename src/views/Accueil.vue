<template>
   <ion-page>
    <ion-content>
 
      <section class="budget-overview">

      <!-- Budget Total Section -->
      <section class="budget-total">
        <header>
          <h1>Total Budget Alloué</h1>
        </header>
        <article>
          <p>{{ totalAllocatedAmount }} €</p>
        </article>
      </section>

      <!-- Répartition du Budget Section -->
      <section class="budget-repartition" v-if="this.budgets">
        <header>
          <h2>Aperçu de vos Budgets</h2>
        </header>
        <nav>
          <button @click="goToBudgets">Voir les Budgets</button>
        </nav>
        <article id="conteneurgraphbudget">
          <BudgetPieChart :chartData="pieChartData" />
        </article>
      </section>

      </section>

      <!-- Liste des Dépenses -->
  <section class="expense-list">
    <header class="expense-list-header">
      <h2>Liste de Dépenses</h2>
      <div class="expense-controls">
       
        <button @click="showAddExpenseOverlay" class="btn-create-expense">Créer dépense</button>
        <button @click="goToExpenses" class="btn-view-expenses">Voir dépenses</button>
      </div>
    </header>

    <select v-model="triSelectionne" class="expense-sort-select">
          <option value="chronoRecentAncien">Récent -> Ancien</option>
          <option value="chronoAncienRecent">Ancien -> Récent</option>
          <option value="montantDecroissant">Montant Décroissant</option>
          <option value="montantCroissant">Montant Croissant</option>
        </select>

        <main id="conteneurdepenses">
          <div v-if="isEditMode" class="overlay">
            <ModifierDepense
              :expense="currentExpense"
              :budgets="budgets"
              @updateSuccess="handleUpdate"
              @close="toggleEditMode(false)"
            />
          </div>

               
    <div v-if="isAddExpenseOverlayVisible" class="overlay">
      <AjoutDepense
        :addExpenseAction="addExpense"
        :budgets="budgets"
        @close="hideAddExpenseOverlay"
      />
    </div>


          <div v-if="showdepenses">
        <div v-for="expense in displayedDepenses" :key="expense._id">
          <ViewDepense
            :expense="expense"
            :budgets="budgets"
            @editExpense="editExpense"
          />
        </div>
        <button v-if="sortedDepenses.length > 5 && displayLimit === sortedDepenses.length" @click="resetDisplayLimit">
            Afficher 4 dépenses
          </button>
          <button v-if="sortedDepenses.length > displayLimit" @click="displayAllDepenses">
            Tout Afficher 
          </button>
      </div>
        </main>
  </section>

  <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
      <ion-refresher-content></ion-refresher-content>
    </ion-refresher>

    </ion-content>

    </ion-page>
  </template>



<script>
import AjoutDepense from '@/components/depense/AjoutDepense.vue';
import ViewDepense from '@/components/depense/ViewDepense.vue';
import ModifierDepense from '@/components/depense/ModifierDepense.vue';
import BudgetPieChart from '@/components/graph/BudgetPieChart.vue';
import { IonPage, IonContent,IonRefresher, IonRefresherContent  } from '@ionic/vue';
import { mapActions, mapGetters } from 'vuex';

export default {

  components: {
    AjoutDepense,
    ViewDepense,
    ModifierDepense,
    BudgetPieChart,
    IonPage,
    IonContent,
    IonRefresher,
    IonRefresherContent,
  },
  data() {
    return {
      isAddExpenseOverlayVisible: false,
      triSelectionne: 'chronoRecentAncien', 
      isEditMode: false,
      currentExpense:  {
        amount: 0,
        description: '',
        date: '',
        budgetId: null,
        location: ''
      },

      showdepenses :false,
      editingExpenseId: null,
      tooltipContent: '',
      activeSlice: null, 
      displayLimit: 4,


    };
  },

   computed: {
    ...mapGetters('depenses', [
      'depensesChronoRecentAncien',
      'depensesChronoAncienRecent',
      'depensesMontantDecroissant',
      'depensesMontantCroissant',
    ]),
    ...mapGetters('budget', ['budgets','totalAllocatedAmount']),

    sortedDepenses() {
      switch (this.triSelectionne) {
        case 'chronoRecentAncien':
          return this.depensesChronoRecentAncien;
        case 'chronoAncienRecent':
          return this.depensesChronoAncienRecent;
        case 'montantDecroissant':
          return this.depensesMontantDecroissant;
        case 'montantCroissant':
          return this.depensesMontantCroissant;
        default:
          return this.depenses; // Utilisez le getter 'depenses' si aucun tri spécifique n'est sélectionné
      }
    },

    displayedDepenses() {
      return this.sortedDepenses.slice(0, this.displayLimit);
    },

    displayTotalExpenses() {
      return this.depenses.reduce((total, expense) => total + expense.amount, 0);
    },
    pieChartData() {
    const topBudgets = this.budgets
      .sort((a, b) => b.allocatedAmount - a.allocatedAmount)
      .slice(0, 5)
      .map(b => ({ name: b.category, value: b.allocatedAmount }));
      return topBudgets;
    },
      },


  methods: {

    ...mapActions('depenses', ['addExpense','fetchAllExpenses','updateExpense', 'deleteExpenseFromStore']),
    ...mapActions('budget', ['fetchBudgets']),


    // fonctions fictives
    goToBudgets() {
      this.$router.push('/budgets');
    },
    goToExpenses() {
      this.$router.push('/depenses');
    },
    //dépenses 
    showAddExpenseOverlay() {
      this.isAddExpenseOverlayVisible = true;
    },
    hideAddExpenseOverlay() {
      this.isAddExpenseOverlayVisible = false;
    },

    handleUpdate(updatedExpense) {
        // Mettez à jour les données de la dépense ici si nécessaire
        this.fetchAllExpenses();
        this.toggleEditMode(false);
      },

      editExpense(expense) {
      this.currentExpense = expense;
      this.isEditMode = true;
    },
 
      toggleEditMode(status) {
              this.isEditMode = status;
              if (!status) {
                this.currentExpense = null;
              }
            },

            displayAllDepenses() {
      this.displayLimit = this.sortedDepenses.length;
        },
        resetDisplayLimit() {
          this.displayLimit = 4;
        },

        async handleRefresh(event) {
          try {
            await this.fetchAllExpenses();
            await this.fetchBudgets();
            event.target.complete();
          } catch (error) {
            console.error('Erreur lors de la mise à jour des données:', error);
            alert('Erreur lors de la mise à jour des données');
          }
        },


        },
  async mounted() {
    
  await  this.fetchBudgets();
  await  this.fetchAllExpenses();
    this.showdepenses = true;
   }

  }


</script>

  

  <style scoped>
/* Polices et Typographie */
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Open+Sans:wght@400;700&family=Lato:wght@400;700&display=swap');

body {
  font-family: 'Roboto', sans-serif;
  color: #333;
  background-color: #f4f4f4;
}




/* Budget Overview Section */
.budget-overview {
  padding: 20px;
  margin:0px
}

.budget-overview h1, .budget-overview h2 {
  color: #1a237e; /* Dark blue color */
  margin: 5px 0 5px 0;
  font-weight: 400;
}

/* Budget Total Section */
.budget-total {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #e3f2fd; /* Light blue background */
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.budget-total header {
  margin-bottom: 10px;
}

.budget-total article p {
  font-size: 1.6em;
  line-height: 1.5;
  color: #0d47a1; /* Darker blue for contrast */
  margin:0;
  font-weight: bolder;
}

/* Budget Repartition Section */
.budget-repartition {
  display:flex;
  flex-direction: column;
  align-items: center;
  background-color: #fff;
  border-radius: 10px;
  padding: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

#conteneurgraphbudget{

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.budget-repartition nav button {
  background-color: #1a237e;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 10px 15px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.budget-repartition nav button:hover {
  background-color: #303f9f; /* Slightly darker blue on hover */
}

/* Section principale */
.expense-list {
  display: flex;
  flex-direction: column;
  padding: 20px;
}

/* En-tête de la liste des dépenses */
.expense-list-header {
  display:flex;
  align-items: center;
  color: #003366; /* Bleu foncé */
  margin-bottom: 0px;
}

.expense-list-header h2 {
  width: 50%;
  font-size: 1.3em;
  margin-bottom: 10px;
  font-weight:700;
  margin-bottom: 20px;
}

/* Contrôles de la liste des dépenses */
.expense-controls {
  width:50%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap:5px;
}

.expense-controls h2 {
  font-size: 1.2em;
  font-weight: 700;
  margin-bottom: 0;

}

/* Sélecteur de tri */
.expense-sort-select {
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #ccc;
  background-color: white;
  margin-top: 15px;
  margin-bottom: 10px;
}

/* Boutons */
button {
  padding: 10px 15px;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s, box-shadow 0.3s;
}

.btn-create-expense {
  background-color: #007bff; /* Bleu */
  color: white;
}

.btn-view-expenses {
  background-color: #28a745; /* Vert */
  color: white;
}

button:hover {
  box-shadow: 0px 2px 5px 0px rgba(0,0,0,0.2);
}

/* Style des éléments de la liste des dépenses */
/* .expense-item {
  background-color: white;
  border-radius: 10px;
  margin-top: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  height: fit-content;
} */

/* Overlay pour les formulaires */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; 
}

/* Formulaire d'édition et d'ajout */
.AjoutDepense, .ModifierDepense {
  background-color: white;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

/* Adaptation pour les petits écrans */
@media (max-width: 600px) {
  .expense-controls {
    flex-direction: column;
  }

  button {
    width: 100%;
    margin-top: 10px;
  }
}

</style>
