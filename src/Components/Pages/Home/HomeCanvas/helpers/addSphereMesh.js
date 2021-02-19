import * as THREE from "three";
import HomeSphereShaderMaterial from "../shaders/HomeSphereShaderMaterial";

function createGeometry({ rect }) {
  return new THREE.SphereGeometry(rect.width, 32, 32);
  // return new THREE.PlaneGeometry(rect.width, rect.width, 100, 100);
}

function addSphereMesh({ scene, rect }) {
  const geometry = createGeometry({ rect });

  const material = new THREE.ShaderMaterial({
    uniforms: HomeSphereShaderMaterial.uniforms,
    vertexShader: HomeSphereShaderMaterial.vertexShader,
    fragmentShader: HomeSphereShaderMaterial.fragmentShader,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthTest: true,
    transparent: true,
    wireframe: false,
  });

  const mesh = new THREE.Mesh(geometry, material);

  mesh.name = "sphere";
  mesh.position.z = -1000;
  scene.add(mesh);
}

export default addSphereMesh;
export { createGeometry };
