import * as THREE from "three";
import HomeSphereShaderMaterial from "../shaders/HomeSphereShaderMaterial";

function createGeometry({ rect }) {
  return new THREE.SphereGeometry(500, 100, 100);
}

function addSphereMesh({ scene, rect }) {
  const geometry = createGeometry({ rect });

  const material = new THREE.ShaderMaterial({
    uniforms: HomeSphereShaderMaterial.uniforms,
    vertexShader: HomeSphereShaderMaterial.vertexShader,
    fragmentShader: HomeSphereShaderMaterial.fragmentShader,
    depthTest: true,
    transparent: true,
    castShadow: true,
    receiveShadow: true,
    lights: true,
    // wireframe: true,
  });

  const mesh = new THREE.Mesh(geometry, material);

  // pallete
  new THREE.TextureLoader().load(
    "https://res.cloudinary.com/dptp8ydoe/image/upload/v1614656273/lightning-black_lcdi5z.png",
    function (texture) {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(32, 32);
      mesh.material.uniforms.pallete.value = texture;
      mesh.material.needsUpdate = true;
    }
  );

  mesh.name = "sphere";
  mesh.position.z = -1000;
  scene.add(mesh);
}

export default addSphereMesh;
export { createGeometry };
