import * as THREE from "three";
import MagicBallShaderMaterial from "../shaders/MagicBallShaderMaterial";

function createGeometry({ rect }) {
  // return new THREE.SphereBufferGeometry(10, 10, 10, 10);
  // return new THREE.CircleGeometry(10,5);

  const geometry = new THREE.Geometry();

  geometry.vertices = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(1, 1, 0),
    new THREE.Vector3(1, 0, 0),
    new THREE.Vector3(0.5, 0.5, 1),
  ];

  geometry.faces = [
    new THREE.Face3(0, 1, 2),
    new THREE.Face3(0, 2, 3),
    new THREE.Face3(1, 0, 4),
    new THREE.Face3(2, 1, 4),
    new THREE.Face3(3, 2, 4),
    new THREE.Face3(0, 3, 4),
  ];

  return geometry;
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
  // mesh.position.y = v.y + 100;
  mesh.position.z = v.z;

  mesh.scale.set(10, 10, 10);

  mesh.name = `ball${i}`;

  scene.add(mesh);

  return mesh;
}

function randChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function addBalls({ scene, rect, plane }) {
  const balls = [];

  const ballCount = 100;

  const vertices = new THREE.Geometry().fromBufferGeometry(plane.geometry)
    .vertices;

  console.log(`Adding ${vertices.length} balls...`);

  for (var i = 0; i < ballCount; i++) {
    let v = randChoice(vertices);
    v.applyMatrix4(plane.matrixWorld);
    const ball = addBall({ scene, rect, i, v, plane });
    balls.push(ball);
  }

  // for (var i = 0; i < vertices.length; i++) {
  //   let v = vertices[i];
  //   v.applyMatrix4(plane.matrixWorld);
  //   const ball = addBall({ scene, rect, i, v, plane });
  //   balls.push(ball);
  // }

  return balls;
}

export default addBalls;
