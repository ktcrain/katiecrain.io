import * as THREE from "three";

// Custom Imports
import DarkWaterShaderMaterial from "../../../shared/shaders/DarkWaterShaderMaterial";
// import RipplesShader from "../../../shared/shaders/RipplesShader";

/**
 * @return THREE.Mesh
 */
function addBackgroundMesh({ scene, rect }) {
  const geoDim = new THREE.Vector3(rect.width, rect.height, 1);

  // The geometry to be animated
  const geometry = new THREE.PlaneGeometry(geoDim.x, geoDim.y, 64, 64);

  // const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
  const material = new THREE.ShaderMaterial({
    uniforms: DarkWaterShaderMaterial.uniforms,
    vertexShader: DarkWaterShaderMaterial.vertexShader,
    fragmentShader: DarkWaterShaderMaterial.fragmentShader,
    depthTest: true,
    // side: THREE.DoubleSide,
    // blending: THREE.AdditiveBlending,
    transparent: false,
    wireframe: false,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.z = 2000;
  // mesh.rotation.x = -0.5;
  // mesh.rotation.x = -0.25;
  mesh.name = 'back';
  scene.add(mesh);

  return mesh;
}
export default addBackgroundMesh;