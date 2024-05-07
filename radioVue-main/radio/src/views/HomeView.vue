<template>
  <v-container class="container-background">
    <h1 class="text-center">Radio</h1>
    <v-row>
      <!-- Utilizzo v-for per creare righe con tre card ciascuna -->
      <v-col v-for="(radio, index) in radios" :key="index" cols="12" sm="4" md="4" lg="4">
        <v-card class="radio-card punk-card">
          <!-- Aggiunta del container per il pulsante -->
          <div class="btn-container">
            <!-- Cuore per aggiungere ai preferiti -->
            <v-btn @click="toggleFavorite(radio)" class="ma-2" color="transparent">
              <v-icon :color="radio.isFavorite ? 'red' : 'white'" size="24">mdi-heart</v-icon>
            </v-btn>
          </div>

          <!-- Foto della radio -->
          <v-row justify="center">
            <v-col cols="12" class="text-center">
              <v-img :src="radio.favicon ? radio.favicon : require('@/assets/no immage.png')" height="200" contain></v-img>
            </v-col>
          </v-row>

          <!-- Titolo della radio -->
          <v-card-title class="text-center radio-title">{{ radio.name }}</v-card-title>
          <v-card-actions class="d-flex justify-center">
            <!-- Icona dell'altoparlante per la riproduzione della radio -->
            <v-btn @click="playRadio(radio)" color="transparent" class="ma-2">
              <v-icon color="green" size="48">mdi-volume-high</v-icon>
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
            isFavorite: false // Inizializza la proprietà isFavorite a false per ogni radio
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
    isPlaying(radio) {
      return this.currentPlayingRadio === radio;
    },
    toggleFavorite(radio) {
      radio.isFavorite = !radio.isFavorite;
    }
  },
  created() {
    this.getRadios();
  },
}
</script>

<style scoped>
/* Stili personalizzati */
.radio-card {
  margin-bottom: 20px;
  position: relative;
  border: 2px solid #1976D2; /* Colore blu per il bordo */
  border-radius: 10px; /* Arrotonda i bordi */
  display: flex;
  flex-direction: column; /* Allineamento verticale dei contenuti */
  justify-content: space-between; /* Spazio tra i contenuti */
  height: 320px; /* Altezza fissa per rendere le card quadrate */
}

.loading-gif {
  width: 170px; /* Imposta la larghezza della GIF */
  height: auto; /* Imposta l'altezza automaticamente */
}
.punk-card {
  background: linear-gradient(45deg, #ff69b4, #8a2be2); /* Viola e Rosa */
}

.radio-title {
  font-size: 24px; /* Imposta la dimensione del carattere */
  font-weight: bold; /* Imposta il grassetto */
  color: #333; /* Cambia il colore del testo */
  text-transform: uppercase; /* Trasforma il testo in maiuscolo */
}

.btn-container {
  position: absolute;
  top: 5px; /* Aggiunge spazio in alto */
  right: 5px; /* Aggiunge spazio a destra */
  z-index: 1; /* Imposta l'indice z */
}
</style>
