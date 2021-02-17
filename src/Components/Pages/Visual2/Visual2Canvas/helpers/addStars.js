import * as THREE from "three";
// import MagicLandShaderMaterial from "../shaders/MagicLandShaderMaterial";
import StarsShaderMaterial from "../shaders/StarsShaderMaterial";
import KTUtil from "@utils/KTUtil";

function createGeometry({ rect, rows, columns }) {
  return new THREE.PlaneBufferGeometry(30, 30, 1, 1);
}

function addStars({ scene, rect, rows, columns }) {
  const stars = [];

  for (let s = 0; s < 300; s++) {
    const geometry = createGeometry({ rect, rows, columns });

    // const material = new THREE.MeshBasicMaterial({});
    const material = new THREE.ShaderMaterial({
      uniforms: JSON.parse(JSON.stringify(StarsShaderMaterial.uniforms)),
      vertexShader: StarsShaderMaterial.vertexShader,
      fragmentShader: StarsShaderMaterial.fragmentShader,
      depthTest: true,
      // side: THREE.DoubleSide,
      // blending: THREE.AdditiveBlending,
      transparent: true,
      // wireframe: true,
    });

    const textures = [
      "https://res.cloudinary.com/dptp8ydoe/image/upload/v1613589736/nyancat-bg-cross_pbkkkx.png",
      "https://res.cloudinary.com/dptp8ydoe/image/upload/v1613589736/nyancat-bg-circle_r07gwr.png",
      "https://res.cloudinary.com/dptp8ydoe/image/upload/v1613590977/nyancat-bg-cross2_rs2ybr.png",
    ];

    const textureUrl = textures[s % 3];

    new THREE.TextureLoader().load(textureUrl, function (texture) {
      mesh.material.uniforms.pallete.value = texture;
      mesh.material.needsUpdate = true;
    });

    const mesh = new THREE.Mesh(geometry, material);

    mesh.material.needsUpdate = true;

    mesh.name = "stars" + s;
    // mesh.rotation.x = -Math.PI / 3;
    // mesh.rotation.z = Math.PI / 2;
    mesh.position.x = KTUtil.randomRange(-2000, 2000);
    mesh.position.y = KTUtil.randomRange(-1000, 1000);
    mesh.position.z = KTUtil.randomRange(-4000, 1000);

    scene.add(mesh);

    stars.push(mesh);
  }

  return stars;
}

export default addStars;
export { createGeometry };
