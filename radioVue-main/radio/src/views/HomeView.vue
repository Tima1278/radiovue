<template>
  <v-container class="container-background">
    <h1 class="text-center">Radio</h1>
    <v-row>
      <!-- Utilizzo v-for per creare righe con due card ciascuna -->
      <v-col v-for="(radio, index) in radios" :key="index" cols="12" sm="6" md="6" lg="6">
        <v-card class="radio-card" :class="{ 'punk-card': index % 2 === 0, 'punk-card2': index % 2 !== 0 }">
          <v-row>
            <!-- Foto della radio -->
            <v-col cols="6" v-if="!isPlaying(radio)">
              <v-img :src="radio.favicon ? radio.favicon : require('@/assets/no immage.jpg')" height="200"></v-img>
            </v-col>

            <!-- Creazione del mondo sopra il titolo della radio e il pulsante di riproduzione -->
            <three-d-model v-if="isPlaying(radio)" :radio="radio"></three-d-model>

            <!-- Colonna per la foto della radio (solo quando non è in riproduzione) -->
            <v-col cols="6" v-if="isPlaying(radio)">
              <v-img :src="radio.favicon ? radio.favicon : require('@/assets/no immage.jpg')" height="200"></v-img>
            </v-col>
            <!-- Colonna per il mondo (solo quando è in riproduzione) -->
            <v-col cols="6" v-if="isPlaying(radio)">
              <v-img src="../assets/world.jpg" height="200"></v-img>
            </v-col>
          </v-row>

          <!-- Titolo della radio e pulsante di riproduzione -->
          <v-card-title class="text-center">{{ radio.name }}</v-card-title>
          <v-card-actions class="d-flex justify-center">
            <!-- Onde sonore -->
            <div v-if="isPlaying(radio)" class="sound-wave">
              <div class="bar"></div>
              <div class="bar"></div>
              <div class="bar"></div>
              <div class="bar"></div>
              <div class="bar"></div>
              <div class="bar"></div>
              <div class="bar"></div>
              <div class="bar"></div>
              <div class="bar"></div>
            </div>

            <div @click="toggleFavorite(radio)" class="favorite-icon">
              <v-icon v-if="!isFavorite(radio)" color="black">mdi-heart-outline</v-icon>
              <v-icon v-else color="red">mdi-heart</v-icon>
            </div>
            <!-- Tasto di riproduzione della radio -->
            <v-btn v-if="!isPlaying(radio)" @click="playRadio(radio)" color="primary" class="ma-2">
              <v-icon>mdi-play</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import Hls from 'hls.js';
import ThreeDModel from '@/components/ThreeDModel.vue';

export default {
  name: 'RadioView',
  components: {
    ThreeDModel
  },
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
            gifUrl: '', // Rimuovi il riferimento alla GIF
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
        // Disattiva il modello 3D se è attivo
        if (this.currentPlayingRadio.isPlaying) {
          this.currentPlayingRadio.isPlaying = false;
        }
        // Rimuovi il riferimento al modello 3D corrente
        this.currentPlayingRadio = null;
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
.container-background {
  background-color: #000;
}

.radio-card {
  margin-bottom: 20px;
  position: relative;
  border: 2px solid #1976D2; /* Colore blu per il bordo */
  border-radius: 10px; /* Arrotonda i bordi */
}

.punk-card {
  background: linear-gradient(45deg, #8a2be2, #ff69b4); /* Viola e Rosa */
}

.punk-card2 {
  background: linear-gradient(45deg, #ff69b4, #8a2be2); /* Rosa e Viola */
}

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

.sound-wave {
  width: 150px;
  height: 40px;
  background-color: #eee;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 0 5px;
  border-radius: 20px;
}

.bar {
  width: 6px;
  background-color: #333;
  border-radius: 2px;
  animation: soundWaveAnimation 1s infinite alternate;
}

.bar:nth-child(2) {
  height: 60%;
  animation-delay: 0.1s;
}

.bar:nth-child(3) {
  height: 40%;
  animation-delay: 0.2s;
}

.bar:nth-child(4) {
  height: 70%;
  animation-delay: 0.3s;
}

.bar:nth-child(5) {
  height: 50%;
  animation-delay: 0.4s;
}

.bar:nth-child(6) {
  height: 80%;
  animation-delay: 0.5s;
}

.bar:nth-child(7) {
  height: 55%;
  animation-delay: 0.6s;
}

.bar:nth-child(8) {
  height: 75%;
  animation-delay: 0.7s;
}

.bar:nth-child(9) {
  height: 45%;
  animation-delay: 0.8s;
}

.bar:nth-child(10) {
  height: 65%;
  animation-delay: 0.9s;
}

@keyframes soundWaveAnimation {
  0% {
    height: 20%;
  }
  100% {
    height: 100%;
  }
}
</style>
