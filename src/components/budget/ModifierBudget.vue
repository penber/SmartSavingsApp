<template>
  <section>
    <header>
      <h1>Modification de <strong>{{ localBudget.category }}</strong></h1>
    </header>
    <form @submit.prevent="handleSubmit">
      <div>
        <label for="budgetCategory">Catégorie</label>
        <input id="budgetCategory" v-model="localBudget.category" placeholder="Catégorie" />
      </div>
      <div>
        <label for="allocatedAmount">Montant alloué</label>
        <input id="allocatedAmount" v-model="localBudget.allocatedAmount" type="number" placeholder="Montant alloué" />
      </div>

      
      <label for="color" style="color: black;">Choisir une couleur</label>
      <div id="selectiondecouleur" :style="{ backgroundColor: localBudget.color }">
        <input v-model="localBudget.color" type="color" />
        <!-- boutton pour annuler la coulleur-->
        <button v-if="localBudget.color" @click="localBudget.color = ''">Smart</button>
      </div>

      <div id="buttonssubmit">
        <button type="submit">Valider</button>
        <button type="button" @click="handleCancel">Annuler</button>
      </div>
    </form>
  </section>
  <IonAlert
  :is-open="showAlert"
  :message="alertMessage"
  :buttons="['OK']"
  @ionAlertDidDismiss="handleAlertDismiss"
/>

<IonAlert
    :is-open="showConfirm"
    message="Êtes-vous sûr de vouloir modifier le budget ?"
    :buttons="[
      {
        text: 'Annuler',
        role: 'cancel',
        handler: () => { this.showConfirm = false; }
      },
      {
        text: 'Confirmer',
        handler: () => { this.handleFormSubmit(this.localBudget); }
      }
    ]"
  />

</template>

  
  <script>
  import { IonAlert } from '@ionic/vue';
  import { mapActions } from 'vuex';
  export default {
    components: {
      IonAlert
    },
    props: {
      budget: {
        type: Object,
        default: () => ({ category: '', allocatedAmount: 0, color: '#06145d'})
      },
      isEdit: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        localBudget: JSON.parse(JSON.stringify(this.budget)),
        showAlert: false,
      alertMessage: '',
      showConfirm: false,

      };
    },
    emits: ['update-success', 'create-success', 'cancel'],

    methods: {
      ...mapActions('budget', ['updateBudget', 'createBudget']),

    handleSubmit() {
      this.showConfirm = true;

    },

    handleFormSubmit(budget) {
      const budgetData = {
        allocatedAmount: budget.allocatedAmount,
        category: budget.category,
        color: budget.color

      };

      if (this.isEdit) {
        //verifier que les champs ne sont pas vides
        if (!this.localBudget.category || !this.localBudget.allocatedAmount || this.localBudget.allocatedAmount <= 0) {
          this.triggerAlert('Veuillez remplir tous les champs.');
          return;
        }
    
        this.updateBudget({ budgetId: budget._id, budgetData })
          .then(() => {
            this.$emit('update-success');
            this.localBudget = { category: '', allocatedAmount: 0 };
            this.handleCancel();
          })
          .catch(error => {
            console.error('Erreur lors de la mise à jour du budget', error);
            const errorMessage = error.message || 'Une erreur est survenue lors de la mise à jour du budget'; 
            this.triggerAlert(errorMessage);
          });
      }
    },

    triggerAlert(errorMessage) {
    this.alertMessage = errorMessage;
    this.showAlert = true;
  },

  handleAlertDismiss() {
      this.showAlert = false;
    },
      handleCancel() {
      this.$emit('cancel');
    }
    }
  };
  </script>
  

<style scoped>
/* Style général pour la page */
section {
    font-family: 'Roboto', 'Open Sans', 'Lato', sans-serif;
    color: #333;
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    background-color: #f4f4f4;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* En-tête de section */
header h1 {
    font-size: 1.6rem;
    color: #003366; /* Bleu foncé */
}

header h1 strong {
    color: #0066cc; /* Bleu complémentaire */
}

/* Style des labels */
label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
}


#selectiondecouleur {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-evenly;
  padding: 10px;
  background-color: white;
  border-radius: 5px;
  border: 1px solid #ccc;
  margin-bottom: 15px;
}
#selectiondecouleur div{
  width: auto;
  max-width: 50px;
  margin: 0;
}
#selectiondecouleur input{
margin :0;
max-width: 50px;
}
#selectiondecouleur button {

  max-width: 30%;
  background-color: #6c757d;
  padding: 10px;
  border: none;
  border-radius: 5px;
  color: white;
  font-weight: bold;
  margin: 0;
  margin-right: 0;
  cursor: pointer;

}


#buttonssubmit {
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
}

button {


border-radius: 5px;
color: white;
font-weight: 500;
margin: 0;
margin-right: 0;
cursor: pointer;

}
/* Style des champs de saisie */
input {
  color:rgb(0, 0, 0);
    width: 100%;
    padding: 10px;
    margin-bottom: 20px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
    line-height: 1.5;
    transition: border-color 0.3s;
}

input:focus {
    outline: none;
    border-color: #0066cc; /* Bleu complémentaire */
}

/* Style des boutons */
button {
    padding: 10px 15px;
    margin-right: 10px;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s, box-shadow 0.3s;
}

button:hover {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* Bouton Valider */
button[type="submit"] {
    background-color: #003366; /* Bleu foncé */
    color: white;
}

button[type="submit"]:hover {
    background-color: #0055cc; /* Bleu plus clair */
}

/* Bouton Annuler */
button[type="button"] {
    background-color: #666;
    color: white;
}

button[type="button"]:hover {
    background-color: #777;
}

/* Animations et micro-interactions */
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

section {
    animation: fadeIn 0.5s ease-in-out;
}

input:focus {
    animation: pulse 1s infinite;
}

@keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(0, 102, 204, 0.7); }
    70% { box-shadow: 0 0 0 10px rgba(0, 102, 204, 0); }
    100% { box-shadow: 0 0 0 0 rgba(0, 102, 204, 0); }
}


</style>