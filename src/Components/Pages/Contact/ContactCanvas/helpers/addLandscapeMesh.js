import * as THREE from "three";
import ContactLandscapeShaderMaterial from "../shaders/ContactLandscapeShaderMaterial";

function createGeometry({ rect }) {
  return new THREE.PlaneGeometry(rect.width, rect.height * 2, 100, 100);
}

function addLandscapeMesh({ scene, rect }) {
  const geometry = createGeometry({ rect });

  const material = new THREE.ShaderMaterial({
    uniforms: ContactLandscapeShaderMaterial.uniforms,
    vertexShader: ContactLandscapeShaderMaterial.vertexShader,
    fragmentShader: ContactLandscapeShaderMaterial.fragmentShader,
    depthTest: true,
    transparent: false,
    wireframe: false,
    fog: true,
  });

  const mesh = new THREE.Mesh(geometry, material);

  // pallete
  new THREE.TextureLoader().load(
    "https://res.cloudinary.com/dptp8ydoe/image/upload/v1613066609/rainbow-gradient_lae22d.png",
    function (texture) {
      mesh.material.uniforms.pallete.value = texture;
      mesh.material.needsUpdate = true;
    }
  );

  mesh.position.y = -300;
  mesh.rotation.x = -Math.PI / 2;

  mesh.name = "land";
  scene.add(mesh);
}
export default addLandscapeMesh;

export { createGeometry };
