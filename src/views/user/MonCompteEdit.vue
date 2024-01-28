<template>
  <div class="edit-form">
    <h2>Modifier mon profil</h2>
    <input type="text" v-model="editData.username" placeholder="Nom d'utilisateur" />
    <input type="email" v-model="editData.email" placeholder="Email" />
    <input type="email" v-model="editData.password" placeholder="Nouveau Mot de passe" />

    <!-- Autres champs ici -->
    <button class="save-btn" @click="updateUser">Sauvegarder</button>
    <button class="cancel-btn" @click="$emit('close')">Annuler</button>
  </div>

  <IonAlert
      :is-open="showAlert"
      :message="this.errormsg"
      :buttons="['OK']"
      @ionAlertDidDismiss="handleAlertDismiss"
    />
</template>

  
  <script>
  import { mapActions } from 'vuex';
  import { IonAlert } from '@ionic/vue';
  export default {
    components: {
      IonAlert,
    },
    props: {
      user: Object,
    },
    emits: ['close'],

    data() {
    return {
      editData: {
        username: this.user.username,
        email: this.user.email,
        password: '',
      },
      showAlert: false,
      errormsg: 'message de test',
    };
  },
    methods: {
      ...mapActions('user', ['updateUserProfile']),
      async updateUser() {

        if (this.editData.email !== '' && !this.editData.email.includes('@')) {
          this.triggerAlert('Veuillez entrer un email valide');
          return;
        }

        if(this.editData.password !== '') {
          if(this.editData.password.length < 6) {
            this.triggerAlert('Le mot de passe doit contenir au moins 6 caractères');
            return;
          }
          delete this.editData.password;
        }
        try{
          await this.updateUserProfile(this.editData);
          //envoyer un message de succes
          this.triggerAlert('Votre profil a été mis à jour');

        } catch (error) {
          this.triggerAlert(error.message);

        }
      },


      triggerAlert(msg) {
        this.errormsg = msg;
        this.showAlert = true;
        setTimeout(() => {
          this.$emit('close');
        }, 3000);
      },
      handleAlertDismiss() {
      this.showAlert = false;
    },
    },
  };
  </script>
  

  <style scoped>
.edit-form {
  padding: 20px;
  background: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  text-align: center;
}

.edit-form h2 {
  margin-bottom: 15px;
}

.edit-form input {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  color:rgb(0, 0, 0);
  
}

.save-btn {
  background-color: #4CAF50;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 5px;
}

.cancel-btn {
  background-color: #f44336;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
