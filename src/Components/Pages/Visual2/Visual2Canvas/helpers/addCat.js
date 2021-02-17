import * as THREE from "three";
// import MagicLandShaderMaterial from "../shaders/MagicLandShaderMaterial";
import CatShaderMaterial from "../shaders/CatShaderMaterial";

function createGeometry({ rect, rows, columns }) {
  return new THREE.PlaneBufferGeometry(250, 198 / 2, rows, columns);
}

function addCat({ scene, rect, rows, columns, texture }) {
  const geometry = createGeometry({ rect, rows, columns });

  // const material = new THREE.MeshBasicMaterial({});
  const material = new THREE.ShaderMaterial({
    uniforms: CatShaderMaterial.uniforms,
    vertexShader: CatShaderMaterial.vertexShader,
    fragmentShader: CatShaderMaterial.fragmentShader,
    depthTest: true,
    side: THREE.DoubleSide,
    // blending: THREE.AdditiveBlending,
    transparent: true,
    // wireframe: true,
  });

  // pallete: { type: "t", value: null },

  // pallete
  // new THREE.TextureLoader().load(
  //   // "https://res.cloudinary.com/dptp8ydoe/image/upload/v1613584085/nyancat_zxoyko.gif",
  //   "https://res.cloudinary.com/dptp8ydoe/video/upload/v1613584596/nyancat_q5kjj2.mp4",
  //   function (texture) {
  //     mesh.material.uniforms.pallete.value = texture;
  //     mesh.material.needsUpdate = true;
  //   }
  // );

  const mesh = new THREE.Mesh(geometry, material);

  mesh.material.uniforms.pallete.value = texture;
  mesh.material.needsUpdate = true;

  mesh.name = "cat";
  // mesh.rotation.x = -Math.PI / 3;
  // mesh.rotation.z = Math.PI / 2;
  mesh.position.y = 0;
  mesh.position.z = 100;
  // mesh.position.x = 100;
  mesh.updateMatrixWorld();

  scene.add(mesh);
}

export default addCat;
export { createGeometry };
