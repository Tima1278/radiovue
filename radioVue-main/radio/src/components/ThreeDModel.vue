<script>
import * as THREE from 'three';

export default {
  name: 'ThreeDModel',
  data() {
    return {
      scene: null,
      camera: null,
      renderer: null,
      mesh: null,
    };
  },
  mounted() {
    this.init();
    this.animate();
  },
  methods: {
    init() {
      // Creazione della scena
      this.scene = new THREE.Scene();

      // Creazione della camera
      this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      this.camera.position.z = 5;

      // Creazione del renderer
      this.renderer = new THREE.WebGLRenderer();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.$refs.container.appendChild(this.renderer.domElement);

      // Creazione del cubo
      const geometry = new THREE.BoxGeometry();
      const texture = new THREE.TextureLoader().load('url_della_tua_texture');
      const material = new THREE.MeshBasicMaterial({ map: texture });
      this.mesh = new THREE.Mesh(geometry, material);
      this.scene.add(this.mesh);

      // Aggiungi luci
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      this.scene.add(ambientLight);
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
      directionalLight.position.set(0, 1, 1);
      this.scene.add(directionalLight);
    },
    animate() {
      requestAnimationFrame(this.animate);
      this.mesh.rotation.x += 0.01;
      this.mesh.rotation.y += 0.01;
      this.renderer.render(this.scene, this.camera);
    },
  },
};
</script>
