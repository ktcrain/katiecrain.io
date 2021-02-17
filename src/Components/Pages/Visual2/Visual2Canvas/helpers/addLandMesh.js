import * as THREE from "three";
import MagicLandShaderMaterial from "../shaders/MagicLandShaderMaterial";

function createGeometry({ rect, rows, columns }) {
  return new THREE.PlaneBufferGeometry(8000, 2000, rows, columns);
}

function addLandMesh({ scene, rect, rows, columns }) {
  const geometry = createGeometry({ rect, rows, columns });

  // const material = new THREE.MeshBasicMaterial({});
  const material = new THREE.ShaderMaterial({
    uniforms: MagicLandShaderMaterial.uniforms,
    vertexShader: MagicLandShaderMaterial.vertexShader,
    fragmentShader: MagicLandShaderMaterial.fragmentShader,
    depthTest: true,
    side: THREE.DoubleSide,
    // blending: THREE.AdditiveBlending,
    // transparent: true,
    // wireframe: true,
  });

  const mesh = new THREE.Mesh(geometry, material);

  mesh.name = "plane";
  mesh.rotation.x = Math.PI / 2 + 0.2;
  // mesh.rotation.y = Math.PI / 2;
  // mesh.rotation.z = -Math.PI / 2;
  mesh.position.y = -400;
  mesh.position.z = -200;

  mesh.updateMatrixWorld();

  scene.add(mesh);
}

export default addLandMesh;
export { createGeometry };
