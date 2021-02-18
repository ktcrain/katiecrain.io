import * as THREE from "three";
import WavelengthShaderMaterial from "../shaders/WavelengthShaderMaterial";

function createGeometry() {
  return new THREE.PlaneBufferGeometry(1000, 500, 1, 1);
}

function addWavelengthMesh({ scene, rect, rows, columns }) {
  const geometry = createGeometry();

  // const material = new THREE.MeshBasicMaterial({});
  const material = new THREE.ShaderMaterial({
    uniforms: WavelengthShaderMaterial.uniforms,
    vertexShader: WavelengthShaderMaterial.vertexShader,
    fragmentShader: WavelengthShaderMaterial.fragmentShader,
    // depthTest: true,
    // side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    transparent: true,
    wireframe: false,
  });

  const mesh = new THREE.Mesh(geometry, material);

  mesh.name = "wave";
  mesh.position.y = 200;
  mesh.position.z = -100;

  mesh.updateMatrixWorld();

  scene.add(mesh);
}

export default addWavelengthMesh;
export { createGeometry };
