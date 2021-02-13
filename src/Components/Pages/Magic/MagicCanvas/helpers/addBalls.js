import * as THREE from "three";
import MagicBallShaderMaterial from "../shaders/MagicBallShaderMaterial";

function createGeometry({ rect }) {
  // return new THREE.SphereBufferGeometry(10, 10, 10, 10);
  return new THREE.CircleGeometry(10,5);
}

function addBall({ scene, rect, v, plane, i }) {
  const geometry = createGeometry({ rect });

  // const material = new THREE.MeshBasicMaterial({
  //   color: new THREE.Color("#000000")
  // });

  const material = new THREE.ShaderMaterial({
    uniforms: JSON.parse(JSON.stringify(MagicBallShaderMaterial.uniforms)),
    vertexShader: MagicBallShaderMaterial.vertexShader,
    fragmentShader: MagicBallShaderMaterial.fragmentShader,
    depthTest: true,
    transparent: true,
    wireframe: false,
  });

  const mesh = new THREE.Mesh(geometry, material);

  mesh.position.x = v.x;
  mesh.position.y = v.y + 10;
  mesh.position.z = v.z;

  mesh.name = `ball${i}`;
  
  scene.add(mesh);

  return mesh;
}

function addBalls({ scene, rect, plane }) {
  const balls = [];

  const vertices = new THREE.Geometry().fromBufferGeometry(plane.geometry).vertices;
  console.log(`Adding ${vertices.length} balls...`);

  for (var i = 0; i < vertices.length; i++)
  {
      let v = vertices[i];
      v.applyMatrix4(plane.matrixWorld);
      const ball = addBall({ scene, rect, i, v, plane});
      balls.push(ball);
  }

  return balls;
}

export default addBalls;