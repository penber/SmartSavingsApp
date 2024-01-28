<template>
<ion-page>
  <ion-content>
       <div class="modal">
      <form @submit.prevent="handleSubmit">
        <h2>Modifier la dépense</h2>
        <input v-model=" this.formData.amount" type="number" placeholder="Montant" />
        <input v-model=" this.formData.description" type="text" placeholder="Description" />
        <input v-model=" this.formData.date" type="date" placeholder="Date" />
        <div id="budgetselect" v-if="budgets">
      <p style="margin-right: 15px;">Budget</p>
      <select v-model="formData.budgetId" style="width: 80%;" class="selectbudget">
        <option value="">Aucun</option>
        <option v-for="budget in budgets" :key="budget._id" :value="budget._id">{{ budget.category }}</option>
      </select>
      </div>
      <div id="btnlocalisation">
        <input type="text" v-model="foundAddress" readonly v-if="showGeocoderResults"/>
        <button type="button" @click="getUserLocation">Position actuelle</button>
        <div>

          <button type="button" @click="displayMap">Carte</button>
        <button type="button" @click="enableMapClick" v-if="showMap">Pointer</button>

        </div>
      </div>
      <div ref="mapContainer" class="map-container" ></div>


      <button type="submit">Mettre à jour</button>
        <button type="button" @click="$emit('close')">Annuler</button>
      </form>
    </div>

    
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

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import Geocoder from 'leaflet-control-geocoder';
import { mapActions, mapGetters } from 'vuex';
import { IonPage, IonContent, IonAlert} from '@ionic/vue';

  export default {
    components: {
      IonPage,
      IonContent,
      IonAlert
    },
    props: {
      expense: Object,
    budgets: Array
    },

    emits: ['updateSuccess', 'close'],
    data() {
      return {
        formData: {
        amount:  this.expense ? this.expense.amount : 0,
        description: this.expense ? this.expense.description : '',
        date: this.expense ? this.expense.date : '',
        budgetId: null,
        location: { coordinates: [0, 0], type: 'Point' }
      },

      geocoder: null,
      showGeocoderResults: false,
      foundAddress: null,
      showMap: true,
      showLocationField: true,
      isMapDisplayed: false,
      isMapLocationSet: false,
      showAlert: false,
      alertMessage: '',
      alertButtons: ['OK'],
      shouldEmitCloseOnDismiss: false,
      mapClickEnabled: false,
      currentMarker: null,


     };
    },

    mounted() {
      this.$nextTick(() => {
        
        this.formData = {
      amount: this.expense.amount,
      description: this.expense.description,
      date: this.formatDateToInput(this.expense.date),
      budgetId: this.expense.budgetId,
      location: this.expense.location
    };

          this.initMap();
        
      });

},
    methods: {
      ...mapActions('depenses', ['updateExpense']),
        ...mapActions('budget', ['fetchBudgets, fetchAndCalculateTotalExpenses']),

        async handleSubmit() {
          const updatedExpenseData = {
            amount: this.formData.amount,
            description: this.formData.description,
            date: this.formData.date,
            budgetId: this.formData.budgetId, // Assurez-vous que ceci est correct
            location: this.formData.location // Utilisation de la position mise à jour
          };


          //vérifier que les champs ne sont pas vides et que le montant est supérieur à 0
          if (!updatedExpenseData.amount || !updatedExpenseData.description || !updatedExpenseData.date || updatedExpenseData.amount <= 0) {
            this.triggerAlert('Veuillez remplir tous les champs avec des valeurs correct', false);
            return;
          }          


          //vérifier que le budget n'est pas dépassé
          // this.isithigher();
          
          try {

           
                this.updateExpense({ 
                expenseId: this.expense._id, 
                expenseData: updatedExpenseData
              }).then(() => {
                this.triggerAlert('Dépense mise à jour avec succès', true);

               
              }).catch(error => {
                const errorMessage = error.message || "Une erreur inconnue est survenue";
                console.error(errorMessage);
                this.triggerAlert(errorMessage, false); 
              
              });
            } catch (error) {
              console.error(error);
              this.triggerAlert('Erreur lors de la préparation des données', false);
            }
          },


         async isithigher(){
            let budget = null;
          let totalExpenses = 0;
          if (this.budgets && this.expense) {
            budget = this.budgets.find(b => b._id === this.formData.budgetId);
            if (budget) {
            totalExpenses = await this.fetchAndCalculateTotalExpenses(budget._id) + expenseData.amount;
            } else {
              console.error('Budget correspondant non trouvé');
            }
          } else {
            console.error('Budgets ou dépense non défini');
          }
          
          if(budget){
              if (totalExpenses > budget.allocatedAmount) {
                const overAmount = totalExpenses - budget.allocatedAmount;
                this.triggerAlert(`Le budget a été dépassé de ${overAmount} €. `, false);
                } 
            }
          },


        formatDateToInput(date) {
    return date ? new Date(date).toISOString().substring(0, 10) : '';
  },
  triggerAlert(errorMessage, shouldEmitClose) {
      this.alertMessage = errorMessage;
      this.showAlert = true;
      this.shouldEmitCloseOnDismiss = shouldEmitClose;
    },

    handleAlertDismiss() {
      this.showAlert = false;
      if (this.shouldEmitCloseOnDismiss) {
        this.$emit('updateSuccess');
        this.$emit('close');
      }
    },

  //carte

  displayMap() {
  // Afficher la carte ou la cacher avec display: none et display: block et querySelector
  //      <div v-if="showMap" ref="mapContainer" class="map-container" ></div>
    if(this.showMap) {
      this.showMap = false;
      this.isMapDisplayed = false;
      this.map.remove();
      this.$refs.mapContainer.style.display = 'none';
    } else {
      this.showMap = true;
      this.$refs.mapContainer.style.display = 'block';
      this.initMap();
    }
  // querySelector('.map-container').style.display = 'block';
},
    initMap() {
      if (!this.isMapDisplayed && this.$refs.mapContainer) {
        this.isMapDisplayed = true;
        this.map = L.map(this.$refs.mapContainer).setView([46.5196, 6.6323], 10);      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);


      this.geocoder = new Geocoder({ defaultMarkGeocode: false });
      this.geocoder.on('markgeocode', (e) => {
        const latlng = e.geocode.center;
        L.marker(latlng).addTo(this.map);
        this.map.setView(latlng, this.map.getZoom());
        this.expense.location = `${latlng.lng},${latlng.lat}`;
        this.isMapLocationSet = true;

            });

      this.geocoder.addTo(this.map);

      //afficher la position de la dépense
      if (this.expense.location) {
        const [lng, lat] = this.expense.location.coordinates;
        const latlng = L.latLng(lng, lat);
       this.currentMarker = L.marker(latlng).addTo(this.map);
        this.map.setView(latlng, this.map.getZoom());
        this.isMapLocationSet = true;

          } else {
            this.showLocationField = true;
          }

          this.map.on('click', (e) => {
          if (this.currentMarker) {
            this.map.removeLayer(this.currentMarker);
            this.currentMarker = null;
            this.mapClickEnabled = true; // Réactiver le clic sur la carte si nécessaire
          }
        });
  
      }},

      
      onMapClick(e) {
    if (this.mapClickEnabled) {

      if (this.currentMarker) {
        this.map.removeLayer(this.currentMarker);
      }
      const { lat, lng } = e.latlng;
      // Mise à jour de la localisation dans formData
      this.formData.location = {
        coordinates: [lat, lng],
        type: 'Point'
      };
      this.isLocationSet = true;

      // Ajout d'un marqueur et désactivation du clic sur la carte
      this.currentMarker = L.marker([lat, lng]).addTo(this.map); // Stocker la référence du nouveau marqueur
      this.mapClickEnabled = false;
      this.map.off('click', this.onMapClick);
    }
  },

  enableMapClick() {
    // Activation du mode de sélection sur la carte
    this.mapClickEnabled = true;
    this.map.on('click', this.onMapClick);
  },


        
      async geocodeAddress() {

        try {
          const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${this.expense.location}`);
          if (response.data.length === 0) {
            const noResultDiv = this.map.getContainer().querySelector('.leaflet-control-geocoder-form-no-error');
            if (noResultDiv) {
              noResultDiv.style.display = 'none';
            }
            this.triggerAlert('Erreur de géocodage', 'Aucun résultat trouvé.');
          } else {
            this.showGeocoderResults = true;
            this.foundAddress = response.data[0].display_name;
          }
        } catch (error) {
          this.triggerAlert('Erreur de géocodage', error.message);
        }
      },

        getUserLocation() {
          if (navigator.geolocation) {
            // this.showMap = false; 
            navigator.geolocation.getCurrentPosition(this.showPosition, this.showError);

          } else {
            this.triggerAlert('Erreur de géolocalisation', 'La géolocalisation n\'est pas supportée par votre navigateur.');
          }
        },

        showPosition(position) {

          if (this.currentMarker) {
      this.map.removeLayer(this.currentMarker);
    }
          this.formData.location.coordinates = [position.coords.latitude, position.coords.longitude];
            if (this.map) {
          const userLocation = [position.coords.latitude, position.coords.longitude];

          this.currentMarker = L.marker(userLocation).addTo(this.map); 

          this.map.setView(userLocation, this.map.getZoom());
              }   
      },

    showError(error) {
      switch(error.code) {
        case error.PERMISSION_DENIED:
          this.triggerAlert('Erreur de géolocalisation', 'L\'utilisateur a refusé la demande de géolocalisation.');
          break;
        case error.POSITION_UNAVAILABLE:
          this.triggerAlert('Erreur de géolocalisation', 'Les informations de localisation ne sont pas disponibles.');
          break;      }
    }

    }
    }
  </script>
  
  <style scoped>
  
.modal {
  width: 100%;
  min-width: 400px;
  overflow: scroll;
}
form {
  display: flex;
  flex-direction: column;
  gap: 10px; /* Espacement entre les éléments */
  max-width: 100vw;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  
}

input {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
  color:rgb(1, 0, 0);

}

input:focus {
  outline: none;
  border-color: #007BFF;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}


button {
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}



#budgetselect {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
}


button {
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

button[type="submit"] {
  background-color: #28a745;
  color: white;
}

button[type="button"] {
  background-color: #5156ee;
  color: white;
}

button:hover {
  background-color: #218838;
}

button[type="button"]:hover {
  background-color: #dc747e;
}

.selectbudget {
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #ccc;
  background-color: white;

}

#btnlocalisation {
  display: flex;
  width: 100%;
  flex-direction: row;
}

#btnlocalisation button{
  width: 50%;
margin: 10px;
}

#btnlocalisation div {
  display: flex;
  flex-direction: column;
  width: 50%;

}
#btnlocalisation div button{
  width: auto;
margin: 10px;
}
button.location-set {
  background-color: #068806; /* Changez ceci à la couleur que vous voulez */
}
button.map-location-set {
  background-color: #068806; /* Changez ceci à la couleur que vous voulez */
}
/* Carte */
.map-container {
    width: 100%;
    height: 300px; /* ou toute autre hauteur */
}
/* Styliser le conteneur principal du géocodeur */
:deep(.leaflet-control-geocoder) {
    border: 1px solid #ccc; /* Bordure pour le conteneur */
    background-color: white; /* Fond blanc pour le rendre visible */
    border-radius: 4px; /* Coins arrondis */
    box-shadow: 0 2px 4px rgba(0,0,0,0.2); /* Ombre légère pour le relief */
}


/* Styliser le champ de recherche */
:deep(.leaflet-control-geocoder .leaflet-control-geocoder-form input) {
    min-width: 250px; /* Largeur minimum du champ de recherche */
    padding: 5px 8px; /* Espace intérieur pour le texte */
    border: none; /* Pas de bordure pour le champ de saisie */
    box-sizing: border-box; /* Pour inclure padding dans la largeur */
    border-radius: 4px 0 0 4px; /* Arrondir les coins à gauche */
    color:white;

}


:deep(.leaflet-control-zoom ) {
  display: none;
}
:deep(.leaflet-control-geocoder .leaflet-control-geocoder-icon)  {
  display: none;
}
:deep(.leaflet-control-geocoder-form-no-error) {

display: none;
}


/* Styliser le bouton de recherche */
:deep(.leaflet-control-geocoder .leaflet-control-geocoder-icon) {
    border: none; /* Pas de bordure pour le bouton */
    background-color: #f8f8f8; /* Légèrement différent du fond pour la distinction */
    border-radius: 0 4px 4px 0; /* Arrondir les coins à droite */
    cursor: pointer; /* Changer le curseur en pointeur pour indiquer la clicabilité */
}

/* Styliser la liste des suggestions */
:deep(.leaflet-control-geocoder .leaflet-control-geocoder-alternatives ){
    margin-top: 4px; /* Espace au-dessus de la liste pour la séparer du champ */
    border: 1px solid #ccc; /* Bordure pour la liste */
    border-radius: 4px; /* Coins arrondis */
    box-shadow: 0 2px 4px rgba(0,0,0,0.2); /* Ombre pour le relief */
    background-color: white; /* Fond blanc pour la visibilité */
    list-style: none; /* Pas de puces pour les éléments de la liste */
    padding: 0; /* Pas de padding par défaut */
    max-height: 200px; /* Hauteur maximale avant de scroller */
    overflow-y: auto; /* Permettre le défilement vertical */
}

/* Styliser les éléments de la liste des suggestions */
:deep(.leaflet-control-geocoder .leaflet-control-geocoder-alternatives li ){
    padding: 5px 8px; /* Espace intérieur pour chaque élément */
    border-bottom: 1px solid #eee; /* Séparateur entre les éléments */
    cursor: pointer; /* Indiquer la clicabilité */
}

/* Styliser l'élément de la liste lors du survol */
:deep(.leaflet-control-geocoder .leaflet-control-geocoder-alternatives li:hover) {
    background-color: #f0f0f0; /* Changement de couleur au survol */
}


:deep(.leaflet-control-geocoder-alternatives a) {
    display: flex; /* Utilisez flexbox pour aligner les éléments en ligne */
    flex-direction: column; /* Empilez les enfants verticalement */
    justify-content: flex-start; /* Alignez les enfants au début du conteneur */
    align-items: flex-start; /* Alignez les enfants au début de l'axe transversal */
    text-decoration: none; /* Enlevez le soulignement des liens */
    color: inherit; /* Utilisez la couleur de texte héritée */
    width: 100%; /* Permettez au lien de prendre toute la largeur du li */
    padding: 5px; /* Ajoutez un peu d'espace autour du texte */
    overflow: hidden; /* Cachez le débordement de contenu */

}

:deep(.leaflet-control-geocoder-alternatives li ){
    height: auto; /* La hauteur s'adapte automatiquement au contenu */
    overflow: visible; /* Assurez-vous que le contenu n'est pas coupé */
}

:deep(.leaflet-control-attribution){

  display: none;


}


:deep(.leaflet-control-geocoder-alternatives .leaflet-control-geocoder-address-detail),
:deep(.leaflet-control-geocoder-alternatives .leaflet-control-geocoder-address-context) {
    width: auto; /* Permettez aux éléments de prendre la largeur nécessaire */
}

  </style>