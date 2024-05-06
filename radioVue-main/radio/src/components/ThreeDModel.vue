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
    },
    beforeUnmount() {
        // Remove the window resize event listener when component is destroyed
        window.removeEventListener('resize', this.handleWindowResize);
    },
    methods: {
        init() {
            // Create a camera
            this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            this.camera.position.z = 2;

            // Create a renderer
            this.renderer = new THREE.WebGLRenderer();
            // Set renderer size to smaller values
            this.renderer.setSize(500, 300); // Modify these dimensions as needed
            this.$refs.container.appendChild(this.renderer.domElement);

            // Add OrbitControls
            this.controls = new OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;

            // Create a scene
            const scene = new THREE.Scene();

            // Create a more accurate Earth model
            const geometry = new THREE.SphereGeometry(this.earthRadius, 64, 64); // Increase segments for smoother surface
            const texture = new THREE.TextureLoader().load(earthTexture);
            const material = new THREE.MeshPhongMaterial({ map: texture });
            const earth = new THREE.Mesh(geometry, material);
            scene.add(earth);

            // Define initial coordinates for the marker (Central Italy)
            const initialLongitude = 12 + (34 / 60) + (21.5 / 3600); // Longitude for Central Italy
            const initialLatitude = 42 + (30 / 60) + (15.5 / 3600); // Latitude for Central Italy

            // Convert geographic coordinates to 3D coordinates
            const markerPosition = this.convertGeoTo3D(initialLongitude, initialLatitude);

            // Create a marker
            const markerGeometry = new THREE.SphereGeometry(0.01, 32, 32);
            const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Red color
            const marker = new THREE.Mesh(markerGeometry, markerMaterial);
            marker.position.copy(markerPosition);
            marker.position.normalize(); // Normalize the position to keep the marker on the surface of the sphere
            marker.position.multiplyScalar(1); // Adjust the radius of the sphere (1 in this case)
            scene.add(marker);

            // Add an ambient light to illuminate the scene
            const ambientLight = new THREE.AmbientLight(0xffffff); // White light
            scene.add(ambientLight);

            // Set the scene to component data
            this.scene = scene;
        },
        animate() {
            requestAnimationFrame(this.animate);

            // Update OrbitControls
            if (this.controls) {
                this.controls.update();
            }

            // Render the scene
            if (this.renderer && this.scene && this.camera) {
                this.renderer.render(this.scene, this.camera);
            }
        },
        convertGeoTo3D(longitude, latitude) {
            const phi = (90 - latitude) * Math.PI / 180;
            const theta = (360 - longitude) * Math.PI / 180;

            const x = Math.sin(phi) * Math.cos(theta);
            const y = Math.cos(phi);
            const z = Math.sin(phi) * Math.sin(theta);

            return new THREE.Vector3(x, y, z);
        }
    }
};
</script>
