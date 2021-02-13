import * as THREE from "three";
import ProjectImageShaderMaterial from "../shaders/ProjectImageShaderMaterial";

class FigureImage {
  constructor(scene, img) {
    this.scene = scene;
    this.loader = new THREE.TextureLoader();
    this.el = img;
    this.el.style.opacity = 0;
    this.sizes = new THREE.Vector2(0, 0);
    this.offset = new THREE.Vector2(0, 0);

    this.getSizes();
    this.createMesh();

    this.el.onmove = this.onMove.bind(this);

    return this;
  }

  getSizes() {
    const { width, height, top, left } = this.el.getBoundingClientRect();

    this.sizes.set(width, height);
    this.offset.set(
      left - window.innerWidth / 2 + width / 2,
      -top + window.innerHeight / 2 - height / 2
    );
  }

  onMove() {
    this.getSizes();
    this.updateTarget();
    this.mesh.material.uniforms.uTime.value += 0.01;
    this.mesh.material.needsUpdate = true;
  }

  updateTarget() {
    this.mesh.position.set(this.offset.x, this.offset.y, 0);
    this.mesh.scale.set(this.sizes.x, this.sizes.y, 1);
  }

  createMesh() {
    this.geometry = new THREE.PlaneBufferGeometry(1, 1, 1, 1);

    this.material = new THREE.ShaderMaterial({
      uniforms: JSON.parse(JSON.stringify(ProjectImageShaderMaterial.uniforms)),
      vertexShader: ProjectImageShaderMaterial.vertexShader,
      fragmentShader: ProjectImageShaderMaterial.fragmentShader,
      depthTest: true,
      transparent: true,
      wireframe: false,
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);

    // pallete
    this.loader.load(this.el.src, (texture) => {
      this.mesh.material.uniforms.pallete.value = texture;
      // this.mesh.material.needsUpdate = true;
    });

    this.updateTarget();

    this.scene.add(this.mesh);
  }
}

export default FigureImage;
