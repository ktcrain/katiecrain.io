import * as THREE from "three";
// import ContactBackgroundShaderMaterial from "../shaders/ContactBackgroundShaderMaterial";
import SpaceShader from "../shaders/SpaceShader";

function createGeometry({ rect }) {
  return new THREE.PlaneGeometry(rect.width * 4, rect.height * 4, 100, 100);
}

function addBackgroundMesh({ scene, rect }) {
  const geometry = createGeometry({ rect });

  const material = new THREE.ShaderMaterial({
    uniforms: SpaceShader.uniforms,
    vertexShader: SpaceShader.vertexShader,
    fragmentShader: SpaceShader.fragmentShader,
    depthTest: true,
    transparent: true,
    wireframe: false,
  });

  const mesh = new THREE.Mesh(geometry, material);

  mesh.position.z = -1000;
  // mesh.position.y = -300;
  // mesh.rotation.x = -Math.PI / 2;

  mesh.name = "back";
  scene.add(mesh);
}

export default addBackgroundMesh;
export { createGeometry };
