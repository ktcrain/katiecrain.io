import * as THREE from "three";

/**
 * Normalize the mouse coordiantes
 * for the shader from -1 to 1
 **/
function updateMouseCoordinates(mouse, rect) {
  const uMouse = new THREE.Vector3(
    ((mouse.x - rect.left) / rect.width) * 2 - 1,
    ((mouse.y - rect.top) / rect.height) * -2 + 1,
    0
  );
  return uMouse;
}

export default updateMouseCoordinates;
