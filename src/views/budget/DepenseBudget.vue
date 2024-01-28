<template>
  <ion-page>
    <ion-content>
      <section id="budgetExpenseSection">
        <header>
          <h1>Dépenses de <span id="budgetnamespan" :style="budgetNameStyle">{{ budgetName }} </span></h1>
        </header>
        <div id="data" style="width: 100%; display: flex; justify-content: flex-start; position: relative; align-items: center;">
          <p style="font-weight: 800; margin-right: 8px;">{{  Allocatedamout  }}</p>

      <div class="progress-bar-container">
        <div class="progress-bar">
          <div class="progress" :style="[progressBarStyle, { width: progressBarWidth }]"></div>
        </div>
      </div>
      <div class="progress-value" :style="progressValueStyle">{{ totalExpenses }}.-</div>
    </div>

          
        <!-- Bouton pour ajouter une dépense -->
        <div class="add-expense">
              <button @click="showAddExpenseOverlay" class="bouttonaclooe">Créer Dépense</button>
                <div v-if="isAddExpenseOverlayVisible" class="overlay">
                  <AjoutDepense 
                  :budgets="budgets" 
                  :currentBudgetId="budgetId" 
                  @close="hideAddExpenseOverlay" 
                />
                </div>
                </div>

        <div id="filtrededepense">

            <div class="expense-controls"  style="display: flex; flex-direction: row ; justify-content: space-around;">
                <select v-model="triSelectionne" @change="changerTri(triSelectionne)" class="expense-sort-select">
                  <option value="dernierMois">Dernier Mois</option>
                  <option value="derniereSemaine">Dernière Semaine</option>
                  <option value="margeMontant">Marge de Montant</option>
                  <option value="chronoRecentAncien">Récent -> Ancien</option>
                  <option value="chronoAncienRecent">Ancien -> Récent</option>
                  <option value="montantDecroissant">Décroissant</option>
                  <option value="montantCroissant">Croissant</option>
           
                </select>
              </div>

              <div v-if="triSelectionne === 'margeMontant'" id="montantlimite">
              <input type="number" v-model="montantMin" placeholder="Montant Min" />
              <input type="number" v-model="montantMax" placeholder="Montant Max" />
            </div>


             

        </div>


        <!-- Liste des dépenses pour le budget spécifique -->
        <article class="expenses-list" v-if="filteredDepenses.length > 0">
        <div v-for="expense in filteredDepenses" :key="expense._id" class="expense-item">
              <ViewDepense 
              :expense="expense" 
              :budgets="budgets"
              @editExpense="editmode" />
            </div>
        </article>

        <div v-if="modifyexpense" class="overlay">
          <ModifierDepense 
          :expense="currentExpense" 
          :budgets="budgets" 
          @updateSuccess="endeditmode"
          @close="endeditmode" />
        </div>

        <div v-if="!filteredDepenses" class="no-expenses">
          <p>Aucune dépense trouvée pour ce budget.</p>
        </div>


      </section>

      <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <ion-alert
        :is-open="showAlert"
        :message="alertMessage"
        :buttons="['OK']"
        @ionAlertDidDismiss="handleAlertDismiss"
      />

    </ion-content>
  </ion-page>
</template>
<script>
import ViewDepense from '@/components/depense/ViewDepense.vue';
import AjoutDepense from '@/components/depense/AjoutDepense.vue';
import ModifierDepense from '@/components/depense/ModifierDepense.vue';
import { mapGetters, mapActions } from 'vuex';
import { IonPage, IonContent, IonRefresher, IonRefresherContent, IonAlert } from '@ionic/vue';

export default {
  components: { ViewDepense, IonPage, IonContent, AjoutDepense, IonRefresher, IonRefresherContent, ModifierDepense, IonAlert },
  data() {
    return {
      budgetId: this.$route.params.budgetId, isAddExpenseOverlayVisible: false, couleurbudget: '',
      triSelectionne: 'chronoRecentAncien', montantMin: 0, montantMax: Infinity, currentExpense: null, modifyexpense: false, showAlert: false, alertMessage: ''
    };
  },
  computed: {
    ...mapGetters('depenses', ['depenses', 'depensesChronoRecentAncien', 'depensesChronoAncienRecent', 'depensesMontantDecroissant', 'depensesMontantCroissant']),
    ...mapGetters('budget', ['budgets']),
    currentBudget() { return this.budgets.find(b => b._id === this.budgetId); },
    budgetName() { return this.currentBudget ? this.currentBudget.category : 'Inconnu'; },
    filteredDepenses() { return this.formattedDepenses.filter(depense => depense.budget === this.budgetId); },
    formattedDepenses() {
      const filterMap = {
        'chronoRecentAncien': this.depensesChronoRecentAncien, 'chronoAncienRecent': this.depensesChronoAncienRecent,
        'montantDecroissant': this.depensesMontantDecroissant, 'montantCroissant': this.depensesMontantCroissant,
        'dernierMois': this.depensesDernierMois(), 'derniereSemaine': this.depensesDerniereSemaine(), 'margeMontant': this.depensesParMargeMontant()
      };
      return filterMap[this.triSelectionne] || this.depenses;
    },
    totalExpenses() { return this.filteredDepenses.reduce((total, expense) => total + expense.amount, 0); },
    progressBarWidth() {
      if (!this.currentBudget) return '0%';
      const percentage = Math.min((this.totalExpenses / this.currentBudget.allocatedAmount) * 100, 100);
      return `${percentage}%`;
    },
    budgetNameStyle() {
      const color = this.currentBudget && this.currentBudget.color ? this.currentBudget.color : 'darkblue';
      return { color: color, fontWeight: 'bold', fontSize: '32px' };
    },
    Allocatedamout() { return this.currentBudget ? `${this.currentBudget.allocatedAmount} CHF` : '0 CHF'; },
    progressBarStyle() {
      const budgetColor = this.currentBudget && this.currentBudget.color ? this.currentBudget.color : 'lightblue';
      const percentage = Math.min((this.totalExpenses / (this.currentBudget ? this.currentBudget.allocatedAmount : 0)) * 100, 100);
      return { width: `${percentage}%`, backgroundImage: `linear-gradient(to right, ${budgetColor}, darkblue)` };
    },
    progressValueStyle() {
      const leftPosition = Math.min(Math.min((this.totalExpenses / (this.currentBudget ? this.currentBudget.allocatedAmount : 0)) * 100, 100), 90) + '%';
      return { left: leftPosition };
    }
  },
  methods: {
    ...mapActions('depenses', ['fetchAllExpenses']),
    ...mapActions('budget', ['fetchBudgets', 'fetchExpensesByBudget']),
    changerTri(selection) { this.triSelectionne = selection; },
    depensesDernierMois() {
      const unMoisAgo = new Date();
      unMoisAgo.setMonth(unMoisAgo.getMonth() - 1);
      return this.depenses.filter(depense => new Date(depense.date) >= unMoisAgo);
    },
    depensesDerniereSemaine() {
      const uneSemaineAgo = new Date();
      uneSemaineAgo.setDate(uneSemaineAgo.getDate() - 7);
      return this.depenses.filter(depense => new Date(depense.date) >= uneSemaineAgo);
    },
    depensesParMargeMontant() { return this.depenses.filter(depense => depense.amount >= this.montantMin && depense.amount <= this.montantMax); },
    editmode(expense) { this.currentExpense = expense; this.modifyexpense = true; },
    endeditmode() { this.currentExpense = null; this.modifyexpense = false; },
    showAddExpenseOverlay() { this.isAddExpenseOverlayVisible = true; },
    async hideAddExpenseOverlay() {
      await this.reloadExpenses();
      this.isAddExpenseOverlayVisible = false;
    },
    async reloadExpenses() {
      try {
        await this.fetchAllExpenses();
        await this.fetchExpensesByBudget(this.budgetId);
      } catch (error) {
        const errorMessage = error.message || "Une erreur est survenue lors du chargement des dépenses.";
        console.error(errorMessage);
        this.triggerAlert(errorMessage);
      }
    },
    async handleRefresh(event) {
      try {
        await this.fetchAllExpenses();
        await this.fetchExpensesByBudget(this.budgetId);
      } catch (error) {
        const errorMessage = error.message || "Une erreur est survenue lors du chargement des dépenses.";
    console.error(errorMessage);
    this.triggerAlert(errorMessage);
      }
      event.target.complete();
    },

    triggerAlert(errorMessage) {
      this.alertMessage = errorMessage;
      this.showAlert = true;
    },
    handleAlertDismiss() { this.showAlert = false; },
  },
  async created() {
    try {
      await this.fetchBudgets();
      await this.reloadExpenses();
    } catch (error) {
       const errorMessage = error.message || "Une erreur est survenue lors du chargement des dépenses.";
    console.error(errorMessage);
    this.triggerAlert(errorMessage);
    }
  }
};
</script>



<style>

/* Styles généraux */
* {
  box-sizing: border-box;
  font-family: 'Roboto', 'Open Sans', 'Lato', sans-serif;
}

body {
  margin: 0;
  padding: 0;
  background-color: #f4f4f4;
  color: #333;
  font-size: 16px;
  line-height: 1.6;
}

/* Header */
header h1 {
  color: #0a2e36; /* Bleu foncé */
  text-align: center;
  margin-bottom: 20px;
}

.progress-bar-container {
  width: 100%;
  background-color: #eee;
  border-radius: 8px;
  margin-top: 10px;
  margin-bottom: 20px;
  overflow: hidden; 
}

.progress-bar {
  width: 100%; 
  height: 20px;
  border-radius: 8px;
  transition: width 0.5s ease-in-out;

}

.progress {
  height: 100%;
  border-radius: 8px;
  transition: width 0.5s ease-in-out;

}

.progress-value {
  position: absolute;
  top: -14px;
  color: rgb(1, 1, 116);
  font-weight: bold ;
}


#filtrededepense {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  margin-bottom: 8px;

}

#montantlimite {
  display: flex;
  flex-direction: row;
  width: 100%;
  margin-bottom: 8px;
}

#montantlimite input {
  width: 50%;
  margin: 0 5px;
}
/* Liste des dépenses */
.expenses-list {
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  padding: 0 15px;
}

.expense-item {
  width: 100%;
  background: #ffffff00;
  margin: 0px;
  border-radius: 10px;
}

.expense-item:last-child {
  margin-bottom: 0;
}

.no-expenses {
  text-align: center;
  color: #777;
}

/* Boutons et Inputs */
button, input, select, textarea {
  font: inherit;
  padding: 10px;
  margin: 0;
  border-radius: 5px;
  border: 1px solid #ddd;
}

button {
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 10px 20px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #0056b3;
}

button.delete {
  background-color: #8B0000; /* Rouge bordeaux */
}

#budgetnamespan {
  color: #7f99f7; /* Bleu foncé */
  font-size: 24px;
  font-weight: bolder;
}

button.delete:hover {
  background-color: #6B0000;
}

/* Animations et Micro-interactions */
button {
  transition: transform 0.2s;
}

button:hover {
  transform: scale(1.05);
}


.bouttonaclooe {
  background-color: rgb(76, 76, 211);
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  transition: background-color 0.3s ease;
  max-height: 80px;
  margin-bottom: 10px;
}


/* Formulaire d'Édition */
form {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

form label {
  display: block;
  margin-bottom: 5px;
}

form input[type="text"],
form input[type="email"],
form input[type="password"] {
  width: 100%;
  padding: 8px;
  margin-bottom: 20px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

form button {
  width: 100%;
  padding: 10px;
  border-radius: 20px;
}

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

/* Amélioration de l'espace */
#budgetExpenseSection {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

@media (max-width: 768px) {
  body {
    padding: 0 10px;
  }

  .expenses-list {
    padding: 0;
  }
}


</style>