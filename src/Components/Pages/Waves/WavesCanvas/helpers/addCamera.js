import * as THREE from "three";

function addCamera() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 10000);
  camera.position.z = 500;
  camera.name = camera;
  return camera;
}

export default addCamera;
