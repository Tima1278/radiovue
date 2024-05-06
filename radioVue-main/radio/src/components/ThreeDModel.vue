<template>
  <div ref="container"></div>
</template>

<script>
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import earthTexture from '../assets/mappa.jpg';

export default {
  name: 'ThreeJsScene',
  data() {
      return {
          camera: null,
          renderer: null,
          controls: null,
          earthRadius: 1 // Radius of the Earth model
      };
  },
  mounted() {
      this.init();
      this.animate();

      // Fetch radio station data
      fetch('https://nl1.api.radio-browser.info/json/stations/search?limit=100&countrycode=IT&hidebroken=true&order=clickcount&reverse=true')
          .then(response => response.json())
          .then(data => {
              const italianRadioStations = data.filter(radio => radio.countrycode === 'IT');
              italianRadioStations.forEach(station => {
                  const longitude = station.geo_long;
                  const latitude = station.geo_lat;
                  this.addMarker(longitude, latitude, 0.01); // Adjust marker size as needed
              });
          })
          .catch(error => {
              console.error('Error fetching radio station data:', error);
          });

      // Listen for window resize event
      window.addEventListener('resize', this.handleWindowResize);
  },
  beforeUnmount() { // Replace beforeDestroy with beforeUnmount
      // Remove the window resize event listener when component is destroyed
      window.removeEventListener('resize', this.handleWindowResize);
  },
 init() {
    // Create a scene
    scene = new THREE.Scene();

    // Create a camera
    camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Create a renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Add controls
    const controls = new OrbitControls(camera, renderer.domElement);

    // Create a sphere (world)
    const geometry = new THREE.SphereGeometry(1, 64, 64);
    const texture = new THREE.TextureLoader().load('mappa.jpg');
    const material = new THREE.MeshPhongMaterial({ map: texture });
    earth = new THREE.Mesh(geometry, material);
    scene.add(earth);

    // Define initial coordinates for the marker (Central Italy)
    const initialLongitude = 12 + (34 / 60) + (21.5 / 3600); // Longitude for Central Italy
    const initialLatitude = 42 + (30 / 60) + (15.5 / 3600); // Latitude for Central Italy

    // Convert geographic coordinates to 3D coordinates
    const markerPosition = convertGeoTo3D(initialLongitude, initialLatitude);

    // Create a marker
    const markerGeometry = new THREE.SphereGeometry(0.01, 32, 32);
    const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Red color
    marker = new THREE.Mesh(markerGeometry, markerMaterial);
    marker.position.copy(markerPosition);
    marker.position.normalize(); // Normalize the position to keep the marker on the surface of the sphere
    marker.position.multiplyScalar(1); // Adjust the radius of the sphere (1 in this case)
    scene.add(marker);

    // Add an ambient light to illuminate the scene
    const ambientLight = new THREE.AmbientLight(0xffffff); // White light
    scene.add(ambientLight);
},

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

function convertGeoTo3D(longitude, latitude) {
    const phi = (90 - latitude) * Math.PI / 180;
    const theta = (360 - longitude) * Math.PI / 180;

    const x = Math.sin(phi) * Math.cos(theta);
    const y = Math.cos(phi);
    const z = Math.sin(phi) * Math.sin(theta);

    return new THREE.Vector3(x, y, z);
}

try {
    init();
    animate();
} catch (error) {
    console.error(error);
}
