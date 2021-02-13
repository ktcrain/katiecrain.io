import * as THREE from "three";
// import ProjectImageShaderMaterial from "../shaders/ProjectImageShaderMaterial";
// const createGeometry = require("three-bmfont-text");
// const loadFont = require("load-bmfont");
import LatoExtraBold from "@assets/fonts/Lato/Lato_ExtraBold_Regular.json";
// import LatoThinRegular from "@assets/fonts/Lato/Lato_Thin_Regular.json";
// import Bungee_Outline_Regular from "@assets/fonts/Bungee_Outline_Regular.json";
import ProjectNumberShaderMaterial from "../shaders/ProjectNumberShaderMaterial";

class FigureNumber {
  constructor(scene, el) {
    this.scene = scene;
    this.loader = new THREE.TextureLoader();
    this.el = el;
    this.el.style.opacity = 0;
    this.content = this.el.innerHTML;
    this.sizes = new THREE.Vector2(0, 0);
    this.offset = new THREE.Vector2(0, 0);
    this.font = null;
    this.geo = null;
    this.mesh = null;
    this.height = 1;

    this.getSizes();
    this.loadFont();

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
    this.mesh.position.set(this.offset.x, this.offset.y, 200);
    const scaleFactor = 0.75;
    this.mesh.scale.set(
      this.sizes.x / scaleFactor,
      this.sizes.y / scaleFactor,
      1
    );
  }

  loadFont() {
    this.font = new THREE.FontLoader().parse(LatoExtraBold);
    this.createText();
    this.updateTarget();
  }

  createGeometry() {
    this.geo = new THREE.TextGeometry(this.content, {
      font: this.font,
      size: 1,
      height: this.height,
      anchor: { x: 0.5, y: 0.5, z: 0.5 },
    });

    this.geo.computeBoundingBox();

    this.geo.userData = {};
    this.geo.userData.size = {
      width: this.geo.boundingBox.max.x - this.geo.boundingBox.min.x,
      height: this.geo.boundingBox.max.y - this.geo.boundingBox.min.y,
      depth: this.geo.boundingBox.max.z - this.geo.boundingBox.min.z,
    };

    const anchorX = this.geo.userData.size.width * -0.5;
    const anchorY = this.geo.userData.size.height * -0.5;
    const anchorZ = this.geo.userData.size.depth * -0.5;
    const matrix = new THREE.Matrix4().makeTranslation(
      anchorX,
      anchorY,
      anchorZ
    );

    this.geo.applyMatrix4(matrix);
  }
  createText() {
    this.createGeometry();

    // this.material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.material = new THREE.ShaderMaterial({
      uniforms: JSON.parse(
        JSON.stringify(ProjectNumberShaderMaterial.uniforms)
      ),
      vertexShader: ProjectNumberShaderMaterial.vertexShader,
      fragmentShader: ProjectNumberShaderMaterial.fragmentShader,
      depthTest: true,
      wireframe: false,
      // side: THREE.DoubleSide,
      // transparent: true,
    });

    this.mesh = new THREE.Mesh(this.geo, this.material);
    this.mesh.name = "number-figure-" + this.content;
    // this.mesh.rotation.y = Math.PI / 8;

    // pallete
    this.loader.load(this.el.getAttribute("data-img-src"), (texture) => {
      this.mesh.material.uniforms.pallete.value = texture;
      this.mesh.material.needsUpdate = true;
    });

    this.scene.add(this.mesh);
  }

  refreshText() {
    this.scene.remove(this.mesh.name);
    this.createText();
  }
}

export default FigureNumber;
