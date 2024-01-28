<template>
  <ion-page>
    <ion-content>

      <div class="detail-depense-container">
        <div class="detail-depense-card" v-if="expense">
          <h2>Détails de la Dépense</h2>
          <div class="detail-field">
            <span class="detail-label">Montant :</span>
            <span class="detail-value">{{ expense.amount }} CHF</span>
          </div>
          <div class="detail-field" v-if="expense.budget">
            <span class="detail-label">Catégorie :</span>
            <span class="detail-value">{{ getBudgetName(expense.budget._id) }}</span>
          </div>
          <div class="detail-field">
            <span class="detail-label">Description :</span>
            <span class="detail-value">{{ expense.description }}</span>
          </div>
          <div class="detail-field">
            <span class="detail-label">Date :</span>
            <span class="detail-value">{{ formatDate(expense.date) }}</span>
         </div>
          
         
         <div style="display: flex; width: 100%; flex-direction: row; justify-content: space-around;">      
          <button @click="showEditModal = true">Modifier </button>
          <button v-if="expense.budget" @click="handleBudgetClick">Voir le budget</button>
          
        </div>
        <div class="overlay" v-if="showEditModal">
        <ModifierDepense
          
          :expense="expense"
          :budgets="budgets"
          @close="showEditModal = false"
          @updateSuccess="handleUpdateSuccess"
        />
      </div>

        </div>

        <button @click="centerMapOnExpenseLocation" style="background-color: rgb(114, 78, 147); border: 2px solid white; margin-bottom: 15px;">Centrer</button>

        <div v-if="expense && expense.location" class="map-container" ref="mapContainer">
        </div>
     
      </div>

      
  <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
      <ion-refresher-content></ion-refresher-content>
    </ion-refresher>

    </ion-content>
  </ion-page>
</template>

  
  <script>

    import { mapActions, mapGetters } from 'vuex';
    import 'leaflet/dist/leaflet.css';
    import L from 'leaflet';
    import { IonPage, IonContent, IonRefresher, IonRefresherContent } from '@ionic/vue';
  import ModifierDepense from '@/components/depense/ModifierDepense.vue';

    export default {
      components: {
        IonPage,
        IonContent,
        ModifierDepense,
        IonRefresher,
        IonRefresherContent
      },
      data() {
        return {
          expense: null,
          expenseId: this.$route.params.id,
          showEditModal: false,
          map: null,

        };
      },
      computed: {
        ...mapGetters('budget', ['budgets']),
        ...mapGetters('depenses', ['depenses']),



      },
      methods: {

        ...mapActions('depenses', ['fetchExpenseById']),
        ...mapActions('budget', ['fetchBudgets']),

        getBudgetName(budgetId) {
          const budget = this.budgets.find(b => b._id === budgetId);
          return budget ? budget.category : '';
        },
        formatDate(date) {
          return new Date(date).toISOString().substring(0, 10);
        },

        async loadExpense() {
      try {
          const response = await this.fetchExpenseById(this.expenseId);
          this.expense = response;
        } catch (error) {
          const errorMessage = error.message || "Une erreur est survenue lors du chargement de la dépense.";
        console.error(errorMessage);
        this.triggerAlert(errorMessage);        }
      },

    async  handleUpdateSuccess() {
      await this.loadExpense(); 
      this.updateMap();

    },

    updateMap() {
      if (this.map) {
        this.map.remove(); // Supprimer la carte existante
      }
      this.initMap(); // Initialiser une nouvelle carte avec les données mises à jour
    },

    // Fonction pour rediriger vers la page budget lié à la dépense  
    async handleBudgetClick() {
      if(this.expense.budget){
        console.log('budgetId', this.expense.budget._id);
        try {
        await this.$router.push({ name: 'DepenseBudget', params: { budgetId: this.expense.budget._id } });
      } catch (error) {
        console.error('Erreur lors de la redirection vers la page budget', error);
      }
      } else {
        alert('Cette dépense n\'est liée à aucun budget');
      }
      
    },


        initMap() {
          if (!this.expense || !this.expense.location || !this.expense.location.coordinates) {
        console.warn("Données de localisation manquantes pour la dépense.");
        return;
      }

      if (!this.$refs.mapContainer) {
        console.warn("Élément DOM de la carte introuvable.");
        return;
      }

      const coordinates = this.expense.location.coordinates;
      this.map = L.map(this.$refs.mapContainer).setView(coordinates, 13);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(this.map);

      const circleSize = this.expense.amount; 
      L.circle(coordinates, {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
        radius: circleSize
      }).addTo(this.map);
    },

    centerMapOnExpenseLocation() {
      if (this.expense && this.expense.location && this.expense.location.coordinates && this.map) {
        const coordinates = this.expense.location.coordinates;
        this.map.setView(coordinates, 13); 
      } else {
        console.warn("Impossible de centrer la carte : données de localisation manquantes.");
      }
    },

    async handleRefresh(event) {
      try {
        await this.loadExpense();
        this.updateMap();
      } catch (error) {
        console.error('Erreur lors du rafraîchissement', error);
        alert('Une erreur est survenue lors du rafraîchissement.');
      }
      event.target.complete();
    }
    
  },
  mounted() {
    this.fetchBudgets();
    this.loadExpense();
  
  },
      
  async created() {
    try {
          await this.fetchBudgets();
          await this.loadExpense();
    } catch (error) {
          console.error(`Une erreur est survenue lors du chargement des données : ${error.message}`);
          }
    this.initMap()
      }
    };
</script>
  


<style scoped>
.detail-depense-container {
  height: 100vh;
  max-height: 101vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  padding-top: 50px;
  background: linear-gradient(to bottom, #6868db, #012462); /* Gradient background */
  overflow: scroll;
}

.detail-depense-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: white;
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Card style */
  padding: 20px;
  max-width: 500px;
  width: 100%;
  margin-bottom: 20px;
}

h2 {
  color: #333;
  font-family: 'Open Sans', sans-serif;
  margin-bottom: 15px;
}

.detail-field {
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.detail-label {
  font-weight: bold;
  color: #555;
  font-family: 'Lato', sans-serif;
}

.detail-value {
  color: #333;
  font-family: 'Roboto', sans-serif;
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
  z-index: 1; 
}

 
button {
    background-color: #007bff;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 25px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    margin: 10px 0 10px 0; 
  }
  
  button:hover {
    background-color: #0056b3;
  }


.map-container {
  height: 250px;
  width: 100%;
  max-width: 500px;
  border-radius: 15px;
  overflow: hidden;
  z-index: 0;
}

@media screen and (max-width: 768px) {
  .detail-depense-card {
    width: 90%;
  }
}
</style>
