<template>


    <div>
      <h3> Créer un nouveau budget</h3>
    <form @submit.prevent="handlecreationform">
      <label for="budgetCategory">Catégorie</label>

      <input v-model="localBudget.category" placeholder="Catégorie" />
      <label for="allocatedAmount">Montant alloué</label>

      <input v-model="localBudget.allocatedAmount" type="text" placeholder="Montant alloué" />

      <label for="color" style="color: black;">Choisir une couleur</label>
      <div id="selectiondecouleur" :style="{ backgroundColor: localBudget.color }">
        <input v-model="localBudget.color" type="color" />
        <button v-if="localBudget.color" @click="localBudget.color = ''">Smart</button>
      </div>

      <button type="submit">Créer</button>
      <button type="button" @click="handleCancel">Annuler</button>
    </form>

    <IonAlert
      :is-open="showAlert"
      :message="errormsg"
      :buttons="['OK']"
      @ionAlertDidDismiss="handleAlertDismiss"
    />


  </div>

</template>

<script>

import { mapActions } from 'vuex';
import { IonPage, IonContent,IonAlert, IonButton  } from '@ionic/vue';
import { ref } from 'vue';


export default {
  components: {
    IonPage,
    IonContent,
    IonAlert,
  },
  
  data() {
    return {
      localBudget: { category: '', allocatedAmount: '', color: '#06145d'}, 
      showAlert: false,
      errormsg: 'message de test',

    };
  },
  emits: ['update-success', 'create-success', 'cancel'],

  methods: {
    ...mapActions('budget', ['createBudget']),

    handlecreationform() {
      if (!this.localBudget.category || !this.localBudget.allocatedAmount || this.localBudget.allocatedAmount <= 0) {
        this.triggerAlert('Veuillez remplir tous les champs');
        return;
      }

      if (this.localBudget.allocatedAmount.includes(',')) {
        this.localBudget.allocatedAmount = this.localBudget.allocatedAmount.replace(',', '.');
      }

      this.createBudget(this.localBudget)
          .then(() => {
              this.triggerAlert('Budget créé avec succès');
              this.$emit('create-success');
            this.localBudget = { category: '', allocatedAmount: 0 };
            this.handleCancel();
          })
          .catch(error => {
            console.error('Erreur lors de la création du budget', error);
            const message = error.message  || 'Erreur lors de la création du budget';
            this.triggerAlert(message);
          });
    },


    triggerAlert(message) {
      this.errormsg = message;
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


<style scoped>/* Styles pour le composant de création de budget */
div {
  max-width: 400px;
  margin: auto;
  padding: 20px;
  background-color: #06145d;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

h3 {
  font-family: 'Roboto', sans-serif;
  color: #f9fcff; /* Bleu foncé */
  text-align: center;
  margin-bottom: 20px;
}

form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

input {
  color: black;
  background-color: white;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
  font-family: 'Open Sans', sans-serif;
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
}
#selectiondecouleur div{
  width: auto;
  max-width: 50px;
  margin: 0;
}

#selectiondecouleur button {

  max-width: 30%;
  background-color: #6c757d;
  padding: 10px;
  border: none;
  border-radius: 5px;
  color: white;
  font-weight: bold;
  cursor: pointer;

}

button {
  padding: 10px;
  border: none;
  border-radius: 5px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button[type="submit"] {
  background-color: #0056b3; /* Bleu complémentaire */
}

button[type="submit"]:hover {
  background-color: #003d82; /* Variation de bleu au survol */
}

button[type="button"] {
  background-color: #6c757d; /* Gris neutre */
}

button[type="button"]:hover {
  background-color: #5a6268; /* Variation de gris au survol */
}


</style>