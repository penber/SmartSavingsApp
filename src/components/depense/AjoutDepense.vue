<template>
  <ion-page >
  <ion-content>

    <div id="content">


    <h2 id="titreform">Ajouter une dépense</h2>

    <form @submit.prevent="handleSubmit" class="expense-form">

      <input v-model="expense.amount" type="number" placeholder="Montant" />
      <input v-model="expense.description" type="text" placeholder="Description" />
      <input v-model="expense.date" type="date" placeholder="Date" />
      <div id="budgetselect" v-if="budgets">
      <p>Choisir un budget</p>
      <select v-model="expense.budgetId" style="width: 80%;" class="selectbudget">
        <option value="">Aucun</option>
        <option v-for="budget in budgets" :key="budget._id" :value="budget._id">{{ budget.category }}</option>
      </select>
      </div>
      <div id="btnlocalisation">
        <input v-model="expense.location" type="text" placeholder="Localisation" @blur="geocodeAddress" v-show="showLocationField"/>
        <button type="button" @click="getUserLocation" :class="{ 'location-set': isLocationSet }">Position actuelle</button>
        <button type="button" @click="displayMap" :class="{ 'map-location-set': isMapLocationSet }">Carte</button>      </div>
    <div id="map">

      
    <div v-if="showMap" ref="mapContainer" class="map-container"></div>

  </div>
      <button type="submit">Ajouter</button>
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
    
    props: {
    budgets: Array,
    currentBudgetId: {
      type: String,
      default: null
    },
    },
    components: {
      IonPage,
      IonContent,
      IonAlert
    },
    data() {
      return {
        expense: {
        amount: 0,
        description: '',
        date: '',
        budgetId: this.currentBudgetId,
        location: ''
      },
      geocoder: null,
      showGeocoderResults: true,
      showMap: false,
      showLocationField: false,
      isMapDisplayed: false,
      isLocationSet: false,
      isMapLocationSet: false,
      showAlert: false,
      alertMessage: '',
      alertButtons: ['OK'],
      shouldEmitCloseOnDismiss: false,
      currentMarker: null,


      };
    },
    mounted() {
      if (this.currentBudgetId) {
      this.expense.budgetId = this.currentBudgetId;
    };
   this.$nextTick(() => {
    this.initMap();});
},

computed:{
  ...mapGetters('depenses', ['totalExpensesAmount']),
},
    methods: {
      ...mapActions('depenses', [
        'addExpense',]),
      ...mapActions('budget', ['fetchAndCalculateTotalExpenses']),

            async handleSubmit() {
        if (!this.isValidExpense(this.expense)) {
          this.triggerAlert('Veuillez renseigner un montant, une description et une date correcte.', false);
          return;
        }

        const expenseData = this.prepareExpenseData(this.expense);


        if (this.budgets && this.expense) {
          const budget = this.budgets.find(b => b._id === this.expense.budgetId);
          if (budget) {
            try {
              const totalExpenses = await this.fetchAndCalculateTotalExpenses(budget._id);
              const newTotalExpenses = totalExpenses + expenseData.amount;
              
              if (expenseData.budgetId !== '') {
                console.log(budget._id);

                this.triggerAlert('Dépense ajoutée avec succès', true);

                if (newTotalExpenses > budget.allocatedAmount) {
                  const overAmount = newTotalExpenses - budget.allocatedAmount;
                  this.triggerAlert(`Le budget a été dépassé de ${overAmount} €. `, false);
                }
              }
            } catch (error) {
              console.error('Erreur lors du calcul ou de la récupération des dépenses:', error);
            }
          } else {
            console.error('Budget correspondant non trouvé');
          }
      }

        try {
       

          await this.addExpense(expenseData);
        this.triggerAlert('Dépense ajoutée avec succès', true);

          this.$emit('close');
        } catch (error) {
          const errorMessage = error.message || "Une erreur s'est produite lors de l'ajout de la dépense.";
        console.error(errorMessage);
        this.triggerAlert(errorMessage,false);
        }
      },

      isValidExpense(expense) {
        return (
          expense.amount > 0 &&
          !isNaN(parseFloat(expense.amount)) &&
          expense.description &&
          expense.date
        );
      },

      prepareExpenseData(expense) {
        const expenseData = { ...expense, amount: parseFloat(expense.amount) };
        if (expense.location) {
          const [lat, lon] = expense.location.split(',').map(coord => parseFloat(coord.trim()));
          expenseData.location = { type: 'Point', coordinates: [lon, lat] };
        }
        expenseData.date = this.convertDateToYYYYMMDD(expense.date);
        return expenseData;
      },

      convertDateToYYYYMMDD(dateString) {
        const date = new Date(dateString);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${date.getFullYear()}-${month}-${day}`;
      },

    triggerAlert(errorMessage, shouldEmitClose) {
      this.alertMessage = errorMessage;
      this.showAlert = true;
      this.shouldEmitCloseOnDismiss = shouldEmitClose;
    },

    handleAlertDismiss() {
      this.showAlert = false;
      if (this.shouldEmitCloseOnDismiss) {
        this.$emit('close');
      }
    },

    displayMap() {
    // Bascule l'affichage de la carte
    this.showMap = !this.showMap;
    
    // Initialise la carte si elle est affichée
    if (this.showMap) {
      this.$nextTick(() => {
        this.initMap();
        this.isLocationSet = false;

      });
    }
  },

    initMap() {
      if (this.$refs.mapContainer) {
        this.map = L.map(this.$refs.mapContainer).setView([46.5196, 6.6323], 10);      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        this.isMapDisplayed = true;
        this.map.on('click', this.handleMapClick); 
        
      this.geocoder = new Geocoder({ defaultMarkGeocode: false });
      this.geocoder.on('markgeocode', (e) => {
        const latlng = e.geocode.center;
        L.marker(latlng).addTo(this.map);
        this.map.setView(latlng, this.map.getZoom());
        this.expense.location = `${latlng.lng},${latlng.lat}`;
        this.isMapLocationSet = true;

            });

      this.geocoder.addTo(this.map);
          }
  
      },

      handleMapClick(e) {
        if (this.currentMarker) {
      this.map.removeLayer(this.currentMarker);
    }
          const { lat, lng } = e.latlng;
          this.expense.location = `${lng},${lat}`;
          this.currentMarker = L.marker([lat, lng]).addTo(this.map); // Stockez la référence du nouveau marqueur
          this.isLocationSet = true;
        },

     
      async geocodeAddress() {
        this.showGeocoderResults = true;

        try {
          const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${this.expense.location}`);
          if (response.data.length === 0) {
            // Cachez ou supprimez la div "Nothing found"
            const noResultDiv = this.map.getContainer().querySelector('.leaflet-control-geocoder-form-no-error');
            if (noResultDiv) {
              noResultDiv.style.display = 'none';
            }
          }
          } catch (error) {
            console.error("Erreur de géocodage", error);
          }
      },

        getUserLocation() {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(this.showPosition, this.showError);
          } else {
            alert("La géolocalisation n'est pas prise en charge par ce navigateur.");
          }
        },
    showPosition(position) {
      if (this.currentMarker) {
      this.map.removeLayer(this.currentMarker);
    }
      this.expense.location =  position.coords.longitude + ',' + position.coords.latitude;
      this.isLocationSet = true;
      if (this.map) {
    const userLocation = [position.coords.latitude, position.coords.longitude];

    // Créer un marqueur à la position de l'utilisateur
    this.currentMarker = L.marker(userLocation).addTo(this.map); // Stockez la référence du nouveau marqueur

  
    // Centrer la carte sur la position de l'utilisateur
    this.map.setView(userLocation, this.map.getZoom());
  }    },
    showError(error) {
      switch(error.code) {
        case error.PERMISSION_DENIED:
          alert("L'utilisateur a refusé la demande de géolocalisation.");
          break;
        // Gérez les autres cas d'erreur
      }
    }
    }
}
  </script>
  
  <style scoped>
 
 ion-content {
  display: flex;
  flex-direction: column;
  align-content: center;
  /* --background: #000000; mettre un dégradé de bleu foncé a noir a la place */
padding: 0;
margin: 0;
}

#content {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-top: 10px;
  --background: linear-gradient(180deg, rgb(21, 9, 98) 0%, rgb(23, 2, 76) 0%, rgba(0,0,0,1) 100%);
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

#titreform {
  color: rgb(19, 34, 103);
 font-weight: bolder;
}


 form {
  width: 95%;
  display: flex;
  flex-direction: column;
  gap: 10px; /* Espacement entre les éléments */
  margin: 0 auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

#budgetselect {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
}

input {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
  color:rgb(6, 1, 1);

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
  border: 2px solid #ccc;
  background-color: white;

}

#btnlocalisation {
  display: flex;
  flex-direction: row;
}

#btnlocalisation button{
  width: 50%;
margin: 10px;
}

button.location-set {
  background-color: #068806; /* Changez ceci à la couleur que vous voulez */
}
button.map-location-set {
  background-color: #068806; /* Changez ceci à la couleur que vous voulez */
}
/* Carte */

#map {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-bottom: 10px;
}

.map-container {

    width: 90%;
    height: 300px; /* ou toute autre hauteur */

}
/* Styliser le conteneur principal du géocodeur */
:deep(.leaflet-control-geocoder) {
    border: 1px solid #ccc; /* Bordure pour le conteneur */
    background-color: white; /* Fond blanc pour le rendre visible */
    border-radius: 4px; /* Coins arrondis */
    box-shadow: 0 2px 4px rgba(0,0,0,0.2); /* Ombre légère pour le relief */
}


:deep(.leaflet-control-zoom) {
  display: none;
}
:deep(.leaflet-control-geocoder .leaflet-control-geocoder-icon) {
  display: none;
}
:deep(.leaflet-control-geocoder-form-no-error){

display: none;
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

/* Styliser le bouton de recherche */
:deep(.leaflet-control-geocoder .leaflet-control-geocoder-icon) {
    border: none; /* Pas de bordure pour le bouton */
    background-color: #f8f8f8; /* Légèrement différent du fond pour la distinction */
    border-radius: 0 4px 4px 0; /* Arrondir les coins à droite */
    cursor: pointer; /* Changer le curseur en pointeur pour indiquer la clicabilité */
}



/* Styliser la liste des suggestions */
:deep(.leaflet-control-geocoder .leaflet-control-geocoder-alternatives) {
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
:deep(.leaflet-control-geocoder .leaflet-control-geocoder-alternatives li){
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

:deep(.leaflet-control-geocoder-alternatives li ) {
    height: auto; /* La hauteur s'adapte automatiquement au contenu */
    overflow: visible; /* Assurez-vous que le contenu n'est pas coupé */
}

:deep(.leaflet-control-attribution){

  display: none;


}


:deep( .leaflet-control-geocoder-alternatives .leaflet-control-geocoder-address-detail) ,
:deep(.leaflet-control-geocoder-alternatives .leaflet-control-geocoder-address-context)  {
    width: auto; /* Permettez aux éléments de prendre la largeur nécessaire */
}

  </style>
  