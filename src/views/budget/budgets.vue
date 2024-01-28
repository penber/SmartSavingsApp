<template>
  <ion-page>
    <ion-content>
      <main id="pageBudget">
        <header>
          <h1>Vos Budgets</h1>
        </header>

        <section id="budgettotal">
          <h4>Total Budget Alloué </h4>
          <p class="montant-total">{{ totalAllocatedAmount }} €</p>
        </section>

        <!-- <div id="graphique">
          <graph-barre></graph-barre>
        </div> -->


        <section v-if="showBudgetForm" class="overlay">
          <div id="formulairenvbudget">
            <AjoutBudget id="Ajoutbudgetdiv"
            @cancel="handleCancel"/>
          </div>
        </section>

        <!-- ... conteneur modifier ... -->
        <section v-if="isEdit" class="overlay">
          <div class="modifier-budget-container">
            <ModifierBudget 
    @update-success="handlesuccess" 
    @create-success="fetchBudgets"
    @cancel="handleCancel"
    :isEdit="isEdit"
    :budget="selectedBudget" />
          </div>
        </section>
      



       
          
    <section class="listebudget">     
      <h4 style="font-size: 24px; font-weight: bolder;">Liste de budgets</h4>

      <div style="width:95%; display: flex; flex-direction: row; justify-content: space-between; align-items: center; ">

        <select v-model="triSelectionne" class="filtresdetri">
          <option value="chronoRecentAncien">Récent -> Ancien</option>
          <option value="chronoAncienRecent">Ancien -> Récent</option>
          <option value="montantDecroissant">Décroissant</option>
          <option value="montantCroissant">Croissant</option>
        </select>
        <button @click="showBudgetForm = true" style="width: auto; margin:0px;font-size: 14px;">Nouveau budget</button>

      </div>


    


          <div v-for="budget in sortedBudgets" :key="budget._id" class="budget-items">
            <ViewBudget 
          :budget="budget" 
          @edit-budget="editBudget" />
          </div>
        </section>
      </main>

      <IonAlert
      :is-open="showAlert"
      :message="alertMessage"
      :buttons="['OK']"
      @ionAlertDidDismiss="handleAlertDismiss"
    />


    
  <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
      <ion-refresher-content></ion-refresher-content>
    </ion-refresher>


    </ion-content>
  </ion-page>
</template>


<script>
import AjoutBudget from '@/components/budget/AjoutBudget.vue'
import ModifierBudget from '@/components/budget/ModifierBudget.vue'
import ViewBudget from '@/components/budget/ViewBudget.vue';
import { mapActions, mapGetters } from 'vuex';
import { IonPage, IonContent , IonAlert, IonButton, IonRefresher, IonRefresherContent} from '@ionic/vue';


export default {
  components: {
    AjoutBudget,
    ModifierBudget,
    ViewBudget,
    IonPage,
    IonContent,
    IonAlert,
    IonButton,
    IonRefresher,
    IonRefresherContent



  },
  data() {
    return {
      selectedBudget: { category: '', allocatedAmount: 0 },
      isEdit: false,
      triSelectionne: 'chronoRecentAncien',
      showBudgetForm: false,
      showAlert: false,
      alertMessage: '',
    };
  },

  methods: {
    ...mapActions('budget', [
      'fetchBudgets', 
      'deleteBudgetWithExpenses', 
      'detachExpensesFromBudget',
      'fetchExpensesByBudget']),

    async handlesuccess() {
      this.showBudgetForm = false;
      this.isEdit = false;
      this.triggerAlert('Budget modifié avec succès !');
      try {await this.fetchBudgets();}
      catch (error) {
        console.error('Erreur lors du chargement des budgets', error);
        this.triggerAlert('Une erreur est survenue lors du chargement des budgets.', error.message);
      }
    },

    editBudget(budget) {
      this.selectedBudget = JSON.parse(JSON.stringify(budget));
      this.isEdit = true;
      try {this.fetchBudgets();}
      catch (error) {
      const errorMessage = error.message || "Une erreurn'est survenue lors du chargement des budgets";
      console.error(errorMessage);
      this.triggerAlert(errorMessage);
      }
    },

    handleCancel() {
      this.showBudgetForm = false;
      this.isEdit = false;
    },
    triggerAlert(errorMessage) {
    this.alertMessage = errorMessage;
    this.showAlert = true;
  },
  handleAlertDismiss() {
      this.showAlert = false;
    },

    async handleRefresh(event) {
      try {
        await this.fetchBudgets();
        for (const budget of this.budgets) {
          await this.fetchExpensesByBudget(budget._id);
        }
      } catch (error) {
        const errorMessage = error.message || "Une erreur est survenue lors du chargement des budgets";
        console.error(errorMessage);
        this.triggerAlert(errorMessage);
      }
      event.target.complete();
    },

  },
  async mounted() {
          try {
        await this.fetchBudgets();
        for (const budget of this.budgets) {
          await this.fetchExpensesByBudget(budget._id);
        }
      } catch (error) {
        const errorMessage = error.message || "Une erreur est survenue lors du chargement des budgets";
        console.error(errorMessage);
        this.triggerAlert(errorMessage);
      }

  },
  computed: {
    ...mapGetters('budget', [
      'budgets',
      'budgetsChronoRecentAncien',
      'budgetsChronoAncienRecent',
      'budgetsMontantDecroissant',
      'budgetsMontantCroissant',
      'totalAllocatedAmount',
    ]),
    sortedBudgets() {
      switch (this.triSelectionne) {
        case 'chronoRecentAncien':
          return this.budgetsChronoRecentAncien;
        case 'chronoAncienRecent':
          return this.budgetsChronoAncienRecent;
        case 'montantDecroissant':
          return this.budgetsMontantDecroissant;
        case 'montantCroissant':
          return this.budgetsMontantCroissant;
        default:
          return this.budgets;
      }
    },


  }
};


</script>

<style scoped>
body {
  background-color: #f5f5f5;
}


#pageBudget {
  display: flex;
  width: 100%;
  flex-direction: column;
  max-width: 100%;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;  
  align-items: center;
}

#pageBudget header {
    background-color: rgb(16, 16, 144);
    border-radius: 10px;
    color: white;
    text-align: center;
    padding: 14px ;
    width: 85%;
}

#pageBudget header h1 {
  color: white;
    margin: 0;
    font-size: 1.2em;
    font-weight: bolder;
}

#pageBudget section {
    background: white;
    border-radius: 13px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

#budgettotal {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 0px;
  margin-top: 10px;
  width: 70%;
  padding: 10px;
  

}
#budgettotal h4 {
    font-weight: normal;
    color: darkblue;
}

#budgettotal p {
    font-weight: bold;
    margin: 0;
    margin-bottom: 5px;
}


/* ... conteneur modifier ... */
.modifier-budget-container {
  position: fixed;
  /* Ou 'absolute' selon votre mise en page */
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
  /* Assure que le conteneur est au-dessus des autres éléments */
  background-color: white;
  /* Ou toute autre couleur de fond */
  border: 1px solid #ddd;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 80%;
  /* Ou une largeur fixe selon vos besoins */
  max-width: 600px;
  /* Limite la largeur maximale */
}


.overlay {
    background-color: rgba(0, 0, 0, 0.5);
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000; 
}


/* ... style généraux ... */


.listebudget {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap:15px;
  padding: 18px;
  padding-top: 0;
  align-items:center;

}

.filtresdetri {
  background-color: white;
  padding: 5px;
  color:rgb(0, 0, 0);
  width: 50%;
}

/* graphique */

#graphique {
  width: 100%;
  height: 300px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  margin-bottom: 20px;
}

.budget-items {
  background-color: 
  #f5f5f500;
  width: 100%;
  max-width: 600px;
}

@media (max-width: 600px) {


  #formulairenvbudget,
  .modifier-budget-container {
    width: 100%;
    /* Utilisation de la totalité de la largeur de l'écran */
  }

  #Ajoutbudgetdiv {
    width: 100%;
    min-width: auto;
    /* Ajustement de la largeur minimum */
  }

  h1 {
    font-size: 1.2em;
    /* Taille de police adaptée */
  }

  .budget-item {
    flex-direction: column;
    /* Empilage vertical sur les petits écrans */
    gap: 10px;
  }

  button {
    width: auto;
  padding: 10px 20px;
  margin-top: 10px;
  margin-right: 10px;
  border: none;
  border-radius: 5px;
  background-color: #425ec1;
  color: white;
  transition: background-color 0.3s, box-shadow 0.3s;
  }
}

/* Styles spécifiques aux composants */
.modifier-budget-container {
  width: 90%;
  max-width: 500px;
}

.budgets-page {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  color: #007BFF;
  text-align: center;
}



#btnconteneur {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;

}

button {
  width: auto;
  padding: 14px;
  margin-top: 10px;
  border: none;
  border-radius: 8px;
  background-color: #425ec1;
  color: white;
  transition: background-color 0.3s, box-shadow 0.3s;
  font-weight: 500;
}

button:hover {
  background-color: #218838;
}


/* ... formulaire de création de budget ... */

#formulairenvbudget {
  display: flex;
  flex-direction: column;
  gap: 10px;
  /* Espacement entre les éléments */
  width: 90%;
  max-width: 400px;
  margin-bottom: 25px;
  background-color: #39020200;

  color: white;
  align-content: center;
  justify-content: center;
  align-items: center;

}

#Ajoutbudgetdiv {

  min-width: 300px;
}

</style>