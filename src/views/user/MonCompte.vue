<template>

  <ion-page>

    <ion-content>
  
  <div class="account-container">
    <header>
      <h1>Mon compte</h1>
    </header>
    
    <section class="account-details">
      <div v-if="user">
        <div class="account-field">
          <div>
          <span class="field-label">Nom : </span>
          <span class="field-value">{{ user.username || 'Non spécifié' }}</span>
        </div>

  
        </div>
      
        <div class="account-field">
          <div>
          <span class="field-label">Email : </span>
          <span class="field-value">{{ user.email }}</span>
        </div>


        </div>

        
        <div>
          <button @click="editProfile">Modifier</button>
        </div>
      </div>
    </section>
    
    <section class="account-actions">
      <button class="delete-account-btn" @click="deleteProfile">Supprimer compte</button>
    </section>
    
    <!-- Overlay pour la modification -->
    <div v-if="isEditing" class="overlay">
      <MonCompteEdit :user="user" @close="handleEditClose" />
    </div>
  </div>

  
  <section v-if="errorMessage" class="error-message">
    {{ errorMessage }}
  </section>

  <section v-if="successMessage" class="success-message">
    {{ successMessage }}
  </section>

  
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
  import MonCompteEdit from './MonCompteEdit.vue';
  import router from '@/router';
  import { IonPage, 
    IonContent,
     IonRefresher,
      IonRefresherContent,
    IonAlert } from '@ionic/vue';
  export default {
    components: {
      MonCompteEdit,
      IonPage,
      IonContent,
      IonRefresher,
      IonRefresherContent,
      IonAlert
    },
    data() {
      return {
        isEditing: false,
        errorMessage: '',
      successMessage: '',
      userdata: null,
      showAlert: false,
      alertMessage: '',
      };
    },
    computed: {
      ...mapGetters('user', ['user']),

      userdataset() {
         this.userdata = this.user;
      },
    },
    methods: {
      ...mapActions('user', ['fetchUserProfile', 'deleteUser']),

      editProfile() {
        this.isEditing = true;
      },
     
    async deleteProfile() {
      try {
        await this.deleteUser({ id: this.user.id });
        this.triggerAlert('Compte supprimé avec succès.');
        this.successMessage = 'Compte supprimé avec succès.';
        router.push({ name: 'connexion' });

      } catch (error) {
        this.triggerAlert('Erreur lors de la suppression du compte.');
        this.errorMessage = 'Erreur lors de la suppression du compte.';
      }
    },

    triggerAlert(message) {
      this.alertMessage = message;
      this.showAlert = true;
    },

    handleAlertDismiss() {
      this.showAlert = false;
    },
   async handleEditClose() {
    this.isEditing = false;
    try {
      await this.fetchUserProfile();
    } catch (error) {
      console.error(error);
      alert(error.message)
    }
        },

      async handleRefresh(event) {
        try{
        await this.fetchUserProfile();
        } catch (error) {
          console.error(error);
          alert(error.message)
        }
        event.target.complete();
        }
    },
    mounted() {
      this.fetchUserProfile();
    }
  };
  </script>
  

  <style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');
  
  .ion-page {
    font-family: 'Roboto', sans-serif;
  }
  
  .account-container {
    max-width: 600px;
    margin: auto;
    padding: 20px;
    text-align: center;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border-radius: 10px;
  }
  
  .account-details, .account-actions {
    background-color: #d8effc;
    padding: 20px;
    margin-bottom: 20px;
    border-radius: 8px;
  }
  
  .account-field {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }
  
  .field-label {
    font-weight: bold;
    color: #333;
  }
  
  .field-value {
    flex-grow: 1;
    text-align: left;
    margin-left: 10px;
  }
  
  button {
    background-color: #007bff;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 25px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  
  button:hover {
    background-color: #0056b3;
  }
  
  .delete-account-btn {
    background-color: #a12f31;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 25px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  
  .delete-account-btn:hover {
    background-color: #7a1c21;
  }
  
  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .error-message, .success-message {
    padding: 10px;
    margin: 10px 0;
    text-align: center;
    border-radius: 5px;
    font-size: 16px;
  }
  
  .error-message {
    background-color: #ffdddd;
    border: 1px solid #ff5c5c;
    color: #d8000c;
  }
  
  .success-message {
    background-color: #ddffdd;
    border: 1px solid #4caf50;
    color: #4caf50;
  }
  
  @media screen and (max-width: 600px) {
    .account-container {
      padding: 10px;
    }
  
  
  
    .field-value {
      margin-left: 0;
      margin-top: 5px;
    }
  }
  </style>