<template>
  <ion-page>
    <ion-content>
      <section>

        <!-- Section Inscription -->
        <div v-if="!inscriptionouconection" id="inscription">
          <h2>Inscription</h2>
          <form @submit.prevent="register" aria-label="Formulaire d'inscription">
            <div>
              <label for="name">Nom d'utilisateur</label>
              <input v-model="registerForm.username" id="name" type="text" placeholder="Nom d'utilisateur">
            </div>
            <div>
              <label for="email">Email</label>
              <input v-model="registerForm.email" id="email" type="email" placeholder="Email">
            </div>
            <div>
              <label for="password">Mot de passe</label>
              <input v-model="registerForm.password" id="password" type="password" placeholder="Mot de passe">
            </div>
            <button type="submit" v-if="!loading">S'inscrire</button>
          </form>
        </div>

        <!-- Section Connexion -->
        <div v-if="inscriptionouconection" id="connexion">
          <h2>Connexion</h2>
          <form @submit.prevent="login" aria-label="Formulaire de connexion">
            <div>
              <label for="login-email">Email</label>
              <input v-model="loginForm.email" id="login-email" type="email" placeholder="Email">
            </div>
            <div>
              <label for="login-password">Mot de passe</label>
              <input v-model="loginForm.password" id="login-password" type="password" placeholder="Mot de passe">
            </div>
            <button type="submit" v-if="!loading">Connexion</button>
          </form>
        </div>

        <!-- Toggle entre Inscription et Connexion -->
        <div class="divbtndeconnect"> 
          <button v-if="inscriptionouconection" @click="innscriptionouuneconection" class="btndeconnect">
            Pas encore inscrit ? Inscrivez-vous !
          </button>
          <button v-if="!inscriptionouconection" @click="innscriptionouuneconection" class="btndeconnect">
            Déjà inscrit ? Connectez-vous !
          </button>
        </div>
      </section>

      
  <IonAlert
      :is-open="showAlert"
      :message="errormsg"
      :buttons="['OK']"
      @ionAlertDidDismiss="handleAlertDismiss"
    />


    </ion-content>
  </ion-page>
</template>

<script>

import { mapActions } from 'vuex';
import { IonPage, IonContent, IonAlert } from '@ionic/vue';
import { useRouter } from 'vue-router';


export default {
  components: {
    IonPage,
    IonContent,
    IonAlert,
  },
  data() {
    return {
      registerForm: {
        username: '',
        email: '',
        password: '',
      },
      loginForm: {
        email: '',
        password: '',
      },
      inscriptionouconection: true,
      router: useRouter(),
      showAlert: false,
      errormsg: 'message de test',
      loading: false,
    };
  },
  methods: {
    ...mapActions('auth', {
      vuexRegister: 'register', // Ajout de l'action register
      vuexLogin: 'login',
      vuexLogout: 'logout'
    }),

    async register() {
  try {
    this.loading = true;
    console.log(this.registerForm);
    await this.vuexRegister(this.registerForm);
    this.triggerAlert('Vous êtes inscrit !');
    this.$router.push({ name: 'accueil' });
  } catch (error) {
    this.triggerAlert(error.message || 'Erreur lors de l\'inscription');
  } finally {
    this.loading = false;
  }
},

async login() {
  try {
    this.loading = true;
    console.log(this.loginForm);
    await this.vuexLogin(this.loginForm);
    this.triggerAlert('Vous êtes connecté !');
    this.$router.push({ name: 'accueil' });
  } catch (error) {
    this.triggerAlert(error.message || 'Erreur lors de la connexion');
  } finally {
    this.loading = false;
  }
},


    innscriptionouuneconection() {
      this.inscriptionouconection = !this.inscriptionouconection;
    },

    triggerAlert(message) {
      this.errormsg = message;
      this.showAlert = true;
    },

    handleAlertDismiss() {
      this.showAlert = false;
    },
  },
};
</script>


<style scoped>

/* Styles généraux */
body {
  font-family: 'Roboto', 'Open Sans', 'Lato', sans-serif;
  color: #333;
  background-color: #f4f4f4;
  line-height: 1.6;
}

ion-content {
  padding: 20px;
}

h2 {
  color: #102a43; /* Bleu foncé */
  margin-bottom: 1rem;
}

/* Styles des formulaires */
form {
  background: #ffffff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

form div {
  margin-bottom: 15px;
}

form label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

form input[type="text"],
form input[type="email"],
form input[type="password"] {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-sizing: border-box;
  transition: border-color 0.3s;
}

form input[type="text"]:focus,
form input[type="email"]:focus,
form input[type="password"]:focus {
  border-color: #2279d6; /* Bleu complémentaire */
  outline: none;
}

/* Styles des boutons */
button {
  display: block;
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 5px;
  background-color: #3582d4; /* Bleu principal */
  color: white;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btndeconnect{

  background-color: #414e6b; /* Rouge bordeaux */
  border-radius: 0;

}

.divbtndeconnect {
  margin-top:30px;
}

#inscription , #connexion{
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}


#inscription h2 , #connexion h2{
font-size: 24px;
font-weight: bold;
color: #50648f;
margin-bottom: 20px;
}

section{
/* gradient color in modern style for a connexion page */

  background: -webkit-linear-gradient(to right, #f6f9fc, #e9eef4);
  background: linear-gradient(to right, #f6f9fc, #e9eef4);
  min-height: 100vh;
 
}

.inner-scroll{
  background-color: royalblue;
}
button:hover {
  background-color: #0056b3; /* Bleu plus foncé */
}

/* Styles spécifiques pour le bouton de suppression */
.delete-button {
  background-color: #8b0000; /* Rouge bordeaux */
}

.delete-button:hover {
  background-color: #660000;
}

/* Animations et micro-interactions */
button:focus,
input[type="text"]:focus,
input[type="email"]:focus,
input[type="password"]:focus {
  animation: pulse 1s;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(0, 123, 255, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(0, 123, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(0, 123, 255, 0);
  }
}

</style>