<!-- RadioView.vue -->
<template>
  <v-container>
    <h1>Radio</h1>
    <v-row>
      <v-col v-for="radio in radios" :key="radio.name" cols="12" sm="6" md="4" lg="3">
        <v-card>
          <v-img :src="radio.favicon ? radio.favicon : require('@/assets/no immage.jpg')" height="200"></v-img>
          <div @click="toggleFavorite(radio)" class="favorite-icon">
            <v-icon v-if="!isFavorite(radio)" color="black">mdi-heart-outline</v-icon>
            <v-icon v-else color="red">mdi-heart</v-icon>
          </div>
          <v-card-title>{{ radio.name }}</v-card-title>
          <v-card-actions class="d-flex justify-center">
            <!-- Tasto di riproduzione della radio -->
            <v-btn v-if="!isPlaying(radio)" @click="playRadio(radio)" color="primary" class="ma-2">
              <v-icon>mdi-play</v-icon>
            </v-btn>
            <!-- Onde sonore -->
            <div v-else class="sound-wave">
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
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    
    <!-- Aggiunta del componente ThreeDModel.vue -->
    <three-d-model></three-d-model>
  </v-container>
</template>

<script>
import Hls from 'hls.js'; // Importa HLS.js
import ThreeDModel from '@/components/ThreeDModel.vue'; // Importa il componente ThreeDModel.vue

export default {
  name: 'RadioView',
  components: {
    ThreeDModel // Dichiarazione del componente ThreeDModel.vue
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
