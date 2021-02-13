import * as THREE from "three";

function addCamera() {
  const perspective = 800;
  const fov =
    (180 * (2 * Math.atan(window.innerHeight / 2 / perspective))) / Math.PI;
  const camera = new THREE.PerspectiveCamera(
    fov,
    window.innerWidth / window.innerHeight,
    1,
    10000
  );
  camera.position.set(0, 0, perspective);
  return camera;
}

export default addCamera;
