<template>
  <v-container class="container-background">
    <h1 class="text-center">Radio</h1>
    <v-row>
      <!-- Utilizzo v-for per creare righe con tre card ciascuna -->
      <v-col v-for="(radio, index) in radios" :key="index" cols="12" sm="4" md="4" lg="4">
        <v-card class="radio-card punk-card">
          <!-- Icona del cuore in alto a destra -->
          <div class="favorite-icon">
            <v-icon @click="toggleFavorite(radio)" color="red">{{ isFavorite(radio) ? 'mdi-heart' : 'mdi-heart-outline' }}</v-icon>
          </div>

          <!-- Foto della radio -->
          <v-row justify="center">
            <v-col cols="10">
              <v-img :src="radio.favicon ? radio.favicon : require('@/assets/no immage.jpg')" height="150"></v-img>
            </v-col>
          </v-row>

          <!-- Titolo della radio e pulsante di riproduzione -->
          <v-card-title class="text-center">{{ radio.name }}</v-card-title>
          <v-card-actions class="d-flex justify-center">
            <!-- Tasto di riproduzione della radio -->
            <v-btn v-if="!isPlaying(radio)" @click="playRadio(radio)" color="primary" class="ma-2">
              <v-icon>mdi-play</v-icon>
            </v-btn>
            <!-- GIF di caricamento -->
            <img v-if="isPlaying(radio)" src="@/assets/soundwave.gif" class="loading-gif" alt="Caricamento GIF">
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import Hls from 'hls.js';

export default {
  name: 'RadioView',
  data() {
    return {
      radios: [],
      favorites: JSON.parse(localStorage.getItem('favorites') || '{}'),
      currentPlayingRadio: null,
      audio: new Audio(),
      isAudioReady: false,
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
          this.radios = data.map(radio => ({
            ...radio,
          }));
        })
        .catch(error => {
          console.error('Si è verificato un errore durante il recupero dei dati:', error);
        });
    },
    playRadio(radio) {
      if (!this.audio) {
        console.error('L\'oggetto audio non è stato inizializzato correttamente.');
        return;
      }
      if (this.currentPlayingRadio && this.currentPlayingRadio !== radio) {
        if (this.audio.hls) {
          this.audio.hls.destroy();
        }
        this.audio.pause();
      }
      if (radio.url.endsWith('.m3u8')) {
        if (Hls.isSupported()) {
          this.audio.hls = new Hls();
          this.audio.hls.loadSource(radio.url);
          this.audio.hls.attachMedia(this.audio);
          this.audio.addEventListener('canplaythrough', () => {
            this.audio.play();
            this.currentPlayingRadio = radio;
          }, false);
        } else if (this.audio.canPlayType('application/x-mpegURL')) {
          this.audio.src = radio.url;
          this.audio.addEventListener('canplaythrough', () => {
            this.audio.play();
            this.currentPlayingRadio = radio;
          }, false);
        } else {
          console.error('Il browser non supporta la riproduzione di file m3u8.');
        }
      } else {
        this.audio.src = radio.url;
        this.audio.addEventListener('canplaythrough', () => {
          this.audio.play();
          this.currentPlayingRadio = radio;
        }, false);
      }
    },
    toggleFavorite(radio) {
      const favoriteKey = radio.name;
      if (this.favorites[favoriteKey]) {
        delete this.favorites[favoriteKey];
      } else {
        this.favorites[favoriteKey] = true;
      }
      localStorage.setItem('favorites', JSON.stringify(this.favorites));
    },
    isFavorite(radio) {
      const favoriteKey = radio.name;
      return this.favorites[favoriteKey] || false;
    },
    isPlaying(radio) {
      return this.currentPlayingRadio === radio;
    },
  },
  created() {
    this.getRadios();
  },
}
</script>

<style scoped>
/* Aggiornamento dello stile per rendere le card quadrate */
.radio-card {
  margin-bottom: 20px;
  position: relative;
  border: 2px solid #1976D2; /* Colore blu per il bordo */
  border-radius: 10px; /* Arrotonda i bordi */
  display: flex;
  flex-direction: column; /* Allineamento verticale dei contenuti */
  justify-content: space-between; /* Spazio tra i contenuti */
  height: 300px; /* Altezza fissa per rendere le card quadrate */
}

.favorite-icon {
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
}

.punk-card {
  background: linear-gradient(45deg, #8a2be2, #ff69b4); /* Viola e Rosa */
}

.loading-gif {
  width: 100px; /* Imposta la larghezza della GIF */
  height: auto; /* Imposta l'altezza automaticamente */
}
</style>
