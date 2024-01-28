<template>
  <ion-app>
    <ion-menu side="end" content-id="main-content">
      <ion-header>
        <ion-toolbar>
          <ion-title>Menu</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <ion-list style="display: flex; flex-direction: column;">
          
          <ion-menu-toggle>
            <ion-button  
            :class="{ active: isActive('accueil') }"
             router-link="/accueil">Accueil</ion-button>
            </ion-menu-toggle>

          <ion-menu-toggle>

          <ion-button 
          :class="{ active: isActive('budgets') }"
          router-link="/budgets">Budgets</ion-button>
        </ion-menu-toggle>

        <ion-menu-toggle>

          <ion-button  
          :class="{ active: isActive('PageDepenses') }"
          router-link="/depenses">Dépenses</ion-button>

        </ion-menu-toggle>

          <ion-menu-toggle>

          <ion-button
          :class="{ active: isActive('MapPage') }"
           router-link="/map">Map de dépenses</ion-button>
          </ion-menu-toggle>

           <ion-menu-toggle>

          <ion-button  
          :class="{ active: isActive('MonCompte') }"
          router-link="/moncompte">Mon Compte</ion-button>
        </ion-menu-toggle>

          <ion-menu-toggle>

            <ion-button @click="handleLogout" v-if="isAuthenticated" style="color: rgb(0, 0, 0); font-weight: bolder;">Déconnexion</ion-button>
          </ion-menu-toggle>

        </ion-list>

      </ion-content>
    </ion-menu>


    <ion-page id="main-content">
      <ion-header style="display: flex; flex-direction: row; justify-content: space-between; padding: 5px; align-items: center;">
        <img src="/smartsavingsLogo.png" alt="Smart-Savings Logo" style="height: 50px; padding: 5px; margin-left: 10px;" 
        router-link="/moncompte"/>
        <ion-toolbar >
          <ion-title style="width:auto;font-weight: bold; color: rgb(0, 0, 13); font-size:22px; padding-left: 5px;">Smart Savings</ion-title>
          <ion-buttons slot="end">  
            <ion-back-button></ion-back-button>
            <ion-menu-button></ion-menu-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <ion-router-outlet></ion-router-outlet>

 


      </ion-content>
    </ion-page>
  </ion-app>
</template>

<script setup lang="ts">
import {
  IonApp, IonHeader, IonToolbar, IonTitle, IonContent, IonPage,
  IonMenu, IonMenuButton, IonButtons, IonList, IonItem, IonRouterOutlet,
  IonButton,IonBackButton, IonMenuToggle, IonAlert
  
} from '@ionic/vue';


import { computed } from 'vue';
import { useStore } from 'vuex';
import { useRoute, useRouter} from 'vue-router';
const router = useRouter();

const store = useStore();
const route = useRoute();

const isActive = (routeName: string) => {
      return route.name === routeName;
    };

//verifie si l'utilisateur est connecté
const isAuthenticated = computed(() => store.getters['auth/isAuthenticated']);

const handleLogout = () => {
  store.dispatch('auth/logout');
  router.push({ name: 'connexion' });
  
};


</script>


<style scoped>
body,
html {
  overflow: scroll;
}

header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  background-color: #6fa6df;
  color: white;
  padding: 20px;
  text-align: center;
}

nav {
  display: flex;
  width: 60%;
  justify-content: space-evenly;
  align-items: center;
  color: white;
  padding: 10px 0;
  text-align: center;
}

ion-button {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  width: 100%;
  color: #374e77;
}

.active {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;

    color: #ffffff; /* Change to the color you want */
    font-weight: 550;
  }
</style>
