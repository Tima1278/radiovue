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
            <!-- Rimuovi il pulsante "Play" -->
            <div v-if="!isPlaying(radio)">
              <v-btn @click="playRadio(radio)" color="primary" class="ma-2">
                <v-icon class="mr-2">mdi-play</v-icon>
              </v-btn>
            </div>
            <!-- Aggiungi la GIF delle onde sonore -->
            <div v-else class="sound-wave">
              <img src="@/assets/download.gif" alt="Sound Wave GIF" />
            </div>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import Hls from 'hls.js'; // Importa HLS.js

export default {
  name: 'HomeView',
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
            gifUrl: '@/assets/download.gif', // Aggiungi il percorso della tua GIF per ogni radio
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
        this.currentPlayingRadio.isPlaying = false;
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
            // Avvia la GIF delle onde sonore
            this.startSoundWaveGif(radio);
          }, false);
        } else if (this.audio.canPlayType('application/x-mpegURL')) {
          this.audio.src = radio.url;
          this.audio.addEventListener('canplaythrough', () => {
            this.audio.play();
            // Avvia la GIF delle onde sonore
            this.startSoundWaveGif(radio);
          }, false);
        } else {
          console.error('Il browser non supporta la riproduzione di file m3u8.');
        }
      } else {
        this.audio.src = radio.url;
        this.audio.addEventListener('canplaythrough', () => {
          this.audio.play();
          // Avvia la GIF delle onde sonore
          this.startSoundWaveGif(radio);
        }, false);
      }
      this.currentPlayingRadio = radio;
    },
    stopRadio() {
      if (this.currentPlayingRadio) {
        console.log('Ferma la riproduzione della stazione radio:', this.currentPlayingRadio);
        this.currentPlayingRadio = null;
        if (this.audio && !this.audio.paused) {
          this.audio.pause();
        }
        // Interrompi la GIF delle onde sonore
        this.stopSoundWaveGif();
      }
    },
    startSoundWaveGif(radio) {
      // Trova l'elemento img della GIF corrispondente alla radio e avvialo
      const gifImg = document.querySelector(`img[src="${radio.gifUrl}"]`);
      if (gifImg) {
        gifImg.style.display = 'block';
      }
    },
    stopSoundWaveGif() {
      // Interrompi tutte le GIF delle onde sonore
      const allGifImgs = document.querySelectorAll('.sound-wave img');
      allGifImgs.forEach(img => {
        img.style.display = 'none';
      });
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
      return this.currentPlayingRadio === radio && !this.audio.paused;
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
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
