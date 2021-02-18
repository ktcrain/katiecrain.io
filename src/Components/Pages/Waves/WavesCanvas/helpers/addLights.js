import * as THREE from "three";

function addLights({ scene }) {
  /**
   * Lighting
   */
  const lights = [];

  // lights["ambiant"] = new THREE.AmbientLight(0x404040, 1.5);

  lights["top"] = new THREE.DirectionalLight(0x404040, 0.25);
  lights["top"].position.set(0, 500, 100);

  lights["bottom"] = new THREE.DirectionalLight(0xffffff, 0.25);
  lights["bottom"].position.set(0, -500, 100);

  lights["stageLeft"] = new THREE.DirectionalLight(0xffffff, 0.25);
  lights["stageLeft"].position.set(-500, 200, 200);

  // lights['stageRight'] = new THREE.DirectionalLight( 0xFFFFFF, 0.25 );
  // lights['stageRight'].position.set( 500, 0, 500 );

  lights["cursorLight"] = new THREE.PointLight(0xff0000, 1, 100);
  lights["cursorLight"].position.set(50, 50, 100);

  Object.keys(lights).forEach((key) => {
    const light = lights[key];
    light.name = key;
    // light.target = mesh;
    scene.add(light);
  });
}

export default addLights;
