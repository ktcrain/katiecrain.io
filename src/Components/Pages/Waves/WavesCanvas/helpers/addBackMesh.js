import * as THREE from "three";
import BackgroundShaderMaterial from "../shaders/BackgroundShaderMaterial";

function createGeometry({ rect }) {
  return new THREE.PlaneGeometry(5000, 5000, 100, 100);
}

function addSphereMesh({ scene, rect }) {
  const geometry = createGeometry({ rect });

  const material = new THREE.ShaderMaterial({
    uniforms: BackgroundShaderMaterial.uniforms,
    vertexShader: BackgroundShaderMaterial.vertexShader,
    fragmentShader: BackgroundShaderMaterial.fragmentShader,
    depthTest: true,
    transparent: true,
    lights: true,
    // wireframe: true,
  });

  const mesh = new THREE.Mesh(geometry, material);

  // pallete
  new THREE.TextureLoader().load(
    "https://res.cloudinary.com/dptp8ydoe/image/upload/a_90/v1614659029/red-background-black-clouds_jgwa7c.png",
    function (texture) {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(10, 10);
      mesh.material.uniforms.pallete.value = texture;
      mesh.material.needsUpdate = true;
    }
  );

  mesh.name = "back";
  mesh.rotation.z = Math.PI / 2;
  mesh.position.z = -1000;
  scene.add(mesh);
}

export default addSphereMesh;
export { createGeometry };
