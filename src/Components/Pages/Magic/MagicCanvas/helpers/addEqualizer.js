import * as THREE from "three";
// import MagicLandShaderMaterial from "../shaders/MagicLandShaderMaterial";
import EqualizerShaderMaterial from "../shaders/EqualizerShaderMaterial";

function createGeometry({ rect, rows, columns }) {
  return new THREE.PlaneBufferGeometry(rect.width, rect.height, rows, columns);
}

// function viewSize({rect}) {
//   // fit plane to screen
//   // https://gist.github.com/ayamflow/96a1f554c3f88eef2f9d0024fc42940f

//   let distance = 500;
//   let vFov = (70 * Math.PI) / 180;
//   let height = 2 * Math.tan(vFov / 2) * distance;
//   let width = height * rect.width/rect.height;
//   return { width, height, vFov };
// }

function addEqualizer({ scene, rect, rows, columns }) {
  const geometry = createGeometry({ rect, rows, columns });

  // const material = new THREE.MeshBasicMaterial({});
  const material = new THREE.ShaderMaterial({
    uniforms: EqualizerShaderMaterial.uniforms,
    vertexShader: EqualizerShaderMaterial.vertexShader,
    fragmentShader: EqualizerShaderMaterial.fragmentShader,
    depthTest: true,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    // transparent: true,
    // wireframe: true,
  });

  const mesh = new THREE.Mesh(geometry, material);

  mesh.name = "eq";
  // mesh.rotation.x = -Math.PI / 3;
  // mesh.rotation.z = Math.PI / 2;
  // mesh.position.y = -300;
  mesh.position.z = -100;

  mesh.updateMatrixWorld();

  scene.add(mesh);
}

export default addEqualizer;
export { createGeometry };
