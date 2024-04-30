<template>
  <v-container>
    <h1>Radio</h1>
    <v-row>
      <v-col v-for="radio in radios" :key="radio.name" cols="12" sm="6" md="4" lg="3">
        <v-card>
          <v-img :src="radio.favicon" height="200"></v-img>
          <div @click="toggleFavorite(radio)" class="favorite-icon">
            <v-icon v-if="!isFavorite(radio)" color="black">mdi-heart-outline</v-icon>
            <v-icon v-else color="red">mdi-heart</v-icon>
          </div>
          <v-card-title>{{ radio.name }}</v-card-title>
          <v-card-actions class="d-flex justify-center">
            <v-btn @click="playRadio(radio)" color="primary" class="ma-2">
              <v-icon class="mr-2">mdi-play</v-icon>
              Play
            </v-btn>
            <v-btn @click="stopRadio(radio)" color="error" class="ma-2">
              <v-icon class="mr-2">mdi-stop</v-icon>
              Stop
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'HomeView',
  data() {
    return {
      radios: [],
      favorites: JSON.parse(localStorage.getItem('favorites') || '{}'), // Carica i preferiti dal localStorage
    }
  },
  methods: {
    getRadios() {
      return fetch('https://nl1.api.radio-browser.info/json/stations/search?limit=100&countrycode=IT&hidebroken=true&order=clickcount&reverse=true')
        .then(response => {
          if (!response.ok) {
            throw new Error('Errore durante il recupero dei dati delle stazioni radio');
          }
          return response.json();
        })
        .then(data => {
          this.radios = data; // Imposta la lista delle stazioni radio
        })
        .catch(error => {
          console.error('Si è verificato un errore durante il recupero dei dati:', error);
        });
    },
    playRadio(radio) {
      console.log('Avvia la riproduzione della stazione radio:', radio);
    },
    stopRadio(radio) {
      console.log('Ferma la riproduzione della stazione radio:', radio);
    },
    toggleFavorite(radio) {
      const favoriteKey = radio.name; // Utilizza il nome della stazione radio come chiave nei preferiti
      if (this.favorites[favoriteKey]) {
        delete this.favorites[favoriteKey]; // Rimuovi la stazione radio dai preferiti
      } else {
        this.favorites[favoriteKey] = true; // Aggiungi la stazione radio ai preferiti
      }
      localStorage.setItem('favorites', JSON.stringify(this.favorites)); // Salva i preferiti nel localStorage
    },
    isFavorite(radio) {
      const favoriteKey = radio.name; // Utilizza il nome della stazione radio come chiave nei preferiti
      return this.favorites[favoriteKey] || false; // Controlla se la stazione radio è nei preferiti
    },
  },
  created() {
    this.getRadios();
  },
}
</script>

<style scoped>
.favorite-icon {
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
  width: 24px; /* Imposta la larghezza dell'icona */
  height: 24px; /* Imposta l'altezza dell'icona */
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
