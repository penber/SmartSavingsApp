<template>
  <ion-page>
    <ion-content>
      <div class="page-total">
        <div class="conteneur-map">
          <h3>Carte des dépenses</h3>
          <div class="filtre-budget">
            <label for="tri">Trier par Budget</label>
            <select id="tri" v-model="selectedBudgetId" @change="handleBudgetChange">
              <option value="all">Tout</option>
              <option v-for="budget in budgets" :key="budget._id" :value="budget._id">{{ budget.category }}</option>
            </select>
          </div>

          <div id="map-container" ref="mapContainer" ></div>

        </div>
      </div>
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>


    </ion-content>
  </ion-page>
</template>


<script>
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import L from 'leaflet';
import { mapGetters, mapActions } from 'vuex';
import MarkerClusterGroup from 'leaflet.markercluster';
import { IonPage, IonContent, IonRefresher, IonRefresherContent} from '@ionic/vue';

export default {
  name: 'MapPage',
  components: { 
    IonPage, 
    IonContent,
  
    IonRefresher,
    IonRefresherContent},
  data() {
    return {
      selectedBudgetId: 'all',
      map: null,
    };
  },
  computed: {
    ...mapGetters('depenses', ['depensesAvecLocalisation']),
    ...mapGetters('budget', ['budgets', 'expensesByBudget']),
    filteredDepenses() {
      return this.selectedBudgetId === 'all' ? this.depensesAvecLocalisation : this.expensesByBudget;
    }
  },
      async mounted() {
      try {
        await this.fetchBudgets();
        await this.fetchAllExpenses();
        this.$nextTick(() => {
          this.initMap();
        });
      } catch (error) {
        console.error("Erreur lors du chargement des données: ", error);
      }
    },

  methods: {
    ...mapActions('depenses', ['fetchAllExpenses', 'addExpense', 'updateExpense', 'deleteExpenseFromStore']),
    ...mapActions('budget', ['fetchBudgets', 'fetchExpensesByBudget']),
    async handleBudgetChange() {
      try {
        if (this.selectedBudgetId === 'all') {
          await this.fetchAllExpenses();
        } else {
          await this.fetchExpensesByBudget(this.selectedBudgetId);
        }
      } catch (error) {
        console.error("Erreur lors du changement de budget: ", error);
      }
      this.updateMap();
    },
    updateMap() {
    if (this.map) {
      this.$nextTick(() => {
        this.map.eachLayer((layer) => {
          if (layer instanceof L.Marker || layer instanceof L.Circle) {
            this.map.removeLayer(layer);
          }
        });
        this.addMarkersToMap();
      });
    }
  },

    initMap() {
      if (!this.map && this.$refs.mapContainer) {
        this.map = L.map(this.$refs.mapContainer).setView([46.5196, 6.6323], 10);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(this.map);
        this.addMarkersToMap();
      }
    },

    addMarkersToMap() {
      if (this.map && this.filteredDepenses) {
      const markers = L.markerClusterGroup();
        this.filteredDepenses.forEach(depense => {
          if (depense.location && depense.location.coordinates) {
            const { coordinates } = depense.location;
            const circleSize = Math.max(depense.amount * 0.6, 10); // Ajustement de la taille minimale du cercle
            const circle = L.circle([coordinates[0], coordinates[1]], {
              color: 'red',
              fillColor: '#f03',
              fillOpacity: 0.5,
              radius: circleSize
            });
            let popup = null;
            circle.on('click', (e) => {
              if (popup) {
                this.map.closePopup(popup);
                popup = null;
              } else {
                popup = L.popup()
                  .setLatLng(e.latlng)
                  .setContent(`<p>Montant: ${depense.amount}</p><p>Description: ${depense.description}</p>`)
                  .openOn(this.map);
              }
            });
            markers.addLayer(circle);
          }
        });
        this.map.addLayer(markers);
      }
    },
    async handleRefresh(event) { 
      try {
        await this.fetchAllExpenses();
        await this.fetchBudgets();
        this.updateMap();
      } catch (error) {
        console.error("Erreur lors du rafraîchissement des données: ", error);
      }
      event.target.complete();
    }
  },
  watch: {
    selectedBudgetId() {
      this.updateMap();
    }
  },

  beforeDestroy() {
    if (this.map) {
    this.map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Circle) {
        layer.off(); // Retirer les écouteurs d'événements
        this.map.removeLayer(layer);
      }
    });
    this.map.off(); 
    this.map.remove(); 
    this.map = null;
  }
}

};
</script>

  
<style scoped>
.page-total {
  width: 100%;
  height: 100%;
  background-color: #001a7d; /* Updated for a modern blue tone */
  color: #f0f0f0; /* Slightly off-white for better readability */
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 20px;
}

h3 {
  font-size: 26px; /* Slightly larger */
  font-weight: bold; /* Cleaner look */
  text-align: center; /* Centering the title */
  margin-bottom: 20px;
  color : #001a7d;
}

.filtre-budget {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-bottom: 20px;
}

.filtre-budget label {
  color: #e99595; /* Matched with page color */
  margin-right: 10px;
  font-size: 18px;
  font-weight: 600;
}

.filtre-budget #tri {
  background-color: #ffffff;
  padding: 10px; /* More padding for better touch */
  border: rgb(228, 228, 228) solid 3px; /* Removing default border */
  border-radius: 5px; /* Rounded corners */
  color: #001a7d; /* Matching the page background color */
  width: 180px; /* Fixed width for consistency */
  cursor: pointer; /* Cursor indication for interactivity */
}

.conteneur-map {
  width: 90%; /* Slight reduction for better margins */
  height: 100%; /* Adjusted for better visibility */
  padding: 20px;
  border-radius: 15px; /* Rounded corners */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Subtle shadow for depth */
  background-color: #ffffff; /* White background for contrast */
}

#map-container {
  height: 72vh;

  width: 100%;
  border-radius: 10px;
}
</style>