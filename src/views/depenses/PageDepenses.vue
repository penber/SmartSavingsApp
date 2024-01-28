<template>
  <ion-page>
    <ion-content>
      <div id="Pagedepenses">
        <div id="hautpagedepense">
          <h1 class="titre-page">Gestion des Dépenses</h1>
          <div id="depensestotal">
            <h3>Total des Dépenses : </h3>  
            <p class="montant-total"> {{ totalExpensesAmount }} €</p>
          </div>
          <div id="btncreerettri">
            <button id="btn-creer-depense" class="bouton-header" @click="showAddExpenseOverlay">
              Nouvelle Dépense
            </button>
          </div>
       
        </div>

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



        <div v-if="isAddExpenseOverlayVisible" class="overlay">
          <AjoutDepense :budgets="budgets" @close="hideAddExpenseOverlay" />
        </div>

        <div v-if="isEditMode" class="overlay">
          <div class="modifier-depense-container">
            <ModifierDepense 
            :expense="currentExpense" 
            :budgets="budgets" 
            @close="closeEditModal" 
            @updateSuccess="onUpdateSuccess" />
          </div>
        </div>

        <div id="conteneurdepenses">
          <div v-for="expense in formattedDepenses" :key="expense._id" class=" expenses-items ">
            <ViewDepense 
            :expense="expense" 
            :budgets="budgets" 
            @editExpense="editExpense" 
            />
          </div>
        </div>
      </div>

      
  <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
      <ion-refresher-content></ion-refresher-content>
    </ion-refresher>


    <IonAlert
      :is-open="showAlert"
      :message="alertMessage"
      :buttons="['OK']"
      @ionAlertDidDismiss="handleAlertDismiss"
    />


    </ion-content>
  </ion-page>
</template>


<script>

import { mapActions, mapGetters } from 'vuex';
import ModifierDepense from '@/components/depense/ModifierDepense.vue';
import AjoutDepense from '@/components/depense/AjoutDepense.vue';
import ViewDepense from '@/components/depense/ViewDepense.vue';
import { IonPage, IonContent, IonRefresher, IonRefresherContent
, IonAlert} from '@ionic/vue';
export default {
  components: {
    ModifierDepense,
    AjoutDepense,
    ViewDepense,
    IonPage,
    IonContent,
    IonRefresher,
    IonRefresherContent,
    IonAlert
  },
  data() {
    return {
      isAddExpenseOverlayVisible: false,
      isEditMode: false,
      currentExpense: null, // Modifié pour stocker l'objet dépense entier
      triSelectionne: 'chronoRecentAncien',
      montantMin: 0,
      montantMax: Infinity,
      showAlert: false,
      alertMessage: '',
        };
  },
  computed: {
    ...mapGetters('depenses', [
      'depenses',
      'depensesChronoRecentAncien',
      'depensesChronoAncienRecent',
      'depensesMontantDecroissant',
      'depensesMontantCroissant',
    ]),
    ...mapGetters('budget', ['budgets']),  
    ...mapGetters('depenses', ['totalExpensesAmount']),

    formattedDepenses() {
      switch(this.triSelectionne) {
        case 'chronoRecentAncien':
          return this.depensesChronoRecentAncien;
        case 'chronoAncienRecent':
          return this.depensesChronoAncienRecent;
        case 'montantDecroissant':
          return this.depensesMontantDecroissant;
        case 'montantCroissant':
          return this.depensesMontantCroissant;
          case 'dernierMois':
          return this.depensesDernierMois;
        case 'derniereSemaine':
          return this.depensesDerniereSemaine;
        case 'margeMontant':
          return this.depensesParMargeMontant;
        default:
          return this.depenses;
      }
    },

  
    depensesDernierMois() {
      const unMoisAgo = new Date();
      unMoisAgo.setMonth(unMoisAgo.getMonth() - 1);
      return this.depenses.filter(depense =>
        new Date(depense.date) >= unMoisAgo
      );
    },

    depensesDerniereSemaine() {
      const uneSemaineAgo = new Date();
      uneSemaineAgo.setDate(uneSemaineAgo.getDate() - 7);
      return this.depenses.filter(depense =>
        new Date(depense.date) >= uneSemaineAgo
      );
    },

    depensesParMargeMontant() {
      return this.depenses.filter(depense =>
        depense.amount >= this.montantMin && depense.amount <= this.montantMax
      );
    },


  },
  methods: {
    ...mapActions('depenses', ['fetchAllExpenses', 'deleteExpenseFromStore']),
    ...mapActions('budget', ['fetchBudgets']),

    closeEditModal() {
      this.isEditMode = false;
    },
    async onUpdateSuccess() {
      try {
        await this.fetchAllExpenses();
        this.closeEditModal();
      } catch (error) {
        console.error('Erreur lors de la mise à jour des dépenses', error);
        this.alertMessage = 'Une erreur est survenue lors de la mise à jour des dépenses.';
        this.showAlert = true;
      }
    },
    editExpense(expense) {
    this.currentExpense = expense;
    this.isEditMode = true;
  },

    showAddExpenseOverlay() {
      this.isAddExpenseOverlayVisible = true;
    },
    hideAddExpenseOverlay() {
      this.isAddExpenseOverlayVisible = false;
    },

    closeEditModal() {
      this.isEditMode = false;
    },
    // Méthode pour trier les dépenses
    changerTri(selection) {
      this.triSelectionne = selection;
    },

    async handleRefresh(event) {
      try{
        await this.fetchAllExpenses();
      } catch(error) {
        console.error('Erreur lors du rafraîchissement', error);
        this.alertMessage = 'Une erreur est survenue lors du rafraîchissement des données.';
        this.showAlert = true;
      }
      event.target.complete();
    },
    handleAlertDismiss() {
      this.showAlert = false;
    },
  },
  mounted() {

      Promise.all([this.fetchAllExpenses(), this.fetchBudgets()]).then(() => {
      console.log('Données chargées', this.depenses, this.budgets);
    })
    .catch(error => {
      console.error('Erreur lors du chargement des données', error);
      alert('Une erreur est survenue lors du chargement des données.');
    });
  }
};
</script>
<style>
/* Couleurs et Gradients */
:root {
  --primary-color: rgb(76, 76, 211);
  --secondary-color: #ececec;
}

ion-content {
background: rgba(255, 255, 255, 0);
}

/* Polices et Typographie */
body, button, select {
  font-family: 'Roboto', 'Open Sans', 'Lato', sans-serif;
  font-size: 1.1em;
  line-height: 1.6;
}

.titre-page {
  color: var(--primary-color);
  margin-bottom: 20px;
  font-weight: bolder;
}

.montant-total {
  font-size: 24px;
  font-weight: bold;
  color: darkblue;
}

.expense-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.expense-sort-select {
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #ccc;
  background-color: white;
}

button {
  padding: 10px 15px;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s, box-shadow 0.3s;
}


.btn-creer-expense {
  background-color: #007bff; /* Bleu */
  color: white;
}

/* Boutons et Inputs */
.bouton-header {
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  transition: background-color 0.3s ease;
  max-height: 80px;
  margin-bottom: 10px;
}



#depensestotal {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
  width: 70%;
  padding: 10px;
  border-radius: 13px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}


#depensestotal h4 {
    font-weight: normal;
    color: darkblue;
}

#depensestotal p {
    font-weight: bold;
    margin: 0;
    margin-bottom: 5px;
}



.bouton-header:hover {
  background-color: lightblue;
}

.expenses-items {

  background-color: rgba(255, 255, 255, 0);
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

/* Responsive Design */
@media screen and (max-width: 768px) {
  .bouton-header {
    width: 100%;
    margin-bottom: 10px;
  }

  #btncreerettri {
    flex-direction: column;
  }
}

/* Animations et Micro-interactions */
.bouton-header:hover {
  box-shadow: 0 4px 8px rgba(14, 0, 52, 0.2);
}

/* Card Design pour les détails */
.expense-items {
  background-color: white;
  box-shadow: 0 2px 5px rgba(5, 5, 94, 0.245);
  border-radius: 10px;
  margin: 10px 0;
  transition: box-shadow 0.3s ease;
}

.expense-items:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

#Pagedepenses {
  padding: 20px;
}

#hautpagedepense, #conteneurdepenses {
  display: flex;
  flex-direction: column;
  align-content: center;
  margin-bottom: 20px;
}

#hautpagedepense {
  align-items: center;
}

</style>
