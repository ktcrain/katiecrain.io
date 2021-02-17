import * as THREE from "three";
import MagicLineShaderMaterial from "../shaders/MagicLineShaderMaterial";
// import TransformationShader from "../shaders/TransformationShader";

function generateGridPoints({rows, columns, width, height}) {
  const grid = []

  const sX = width/rows;
  const sY = height/columns;

  for (let a = 0; a < rows; a++)
  {
    if(grid[a] === undefined) {
      grid[a] = [];
    }
    for (let b = 0; b < columns; b++)
    {
      const xi = sX*a - width/2;
      const yi = sY*b - height/2;
      grid[a][b] = new THREE.Vector3(xi,yi,0);
    }
  }
  return grid;
}

function addLines({ rows, columns, scene, rect, plane }) {
  const lines = new THREE.Group();
  const grid = generateGridPoints({rows, columns, width:1000, height:1000});

  for(let l = 0; l < grid.length; l++) {
    const lp = grid[l];
    const geometry = new THREE.PlaneGeometry(3, 1000, 1, 30);
    
    const material = new THREE.ShaderMaterial({
      uniforms: JSON.parse(JSON.stringify(MagicLineShaderMaterial.uniforms)),
      vertexShader: MagicLineShaderMaterial.vertexShader,
      fragmentShader: MagicLineShaderMaterial.fragmentShader,
      depthTest: true,
      transparent: true,
      wireframe: false,
    });

    const line = new THREE.Mesh( geometry, material );
    // line.rotation.y = Math.PI / 2;
    line.position.x = lp[0].x + 2;
    lines.add(line);
  }

  // lines.rotation.x = -Math.PI / 2;
  // lines.rotation.y = -Math.PI / 2;
  lines.rotation.z = Math.PI / 2;
  // lines.position.y -= 350;
  scene.add(lines);

  return lines;
}

// function addLines({ rows, columns, scene, rect, plane }) {
//   const lines = new THREE.Group();
//   const grid = generateGridPoints({rows, columns, width:1000, height:1000});

//   for(let l = 0; l < grid.length; l++) {
//     const lp = grid[l];
//     const geometry = new THREE.BufferGeometry().setFromPoints( lp );
//     // const material = new THREE.LineBasicMaterial( { color: 0x000000 } );
    
//     const material = new THREE.ShaderMaterial({
//       uniforms: JSON.parse(JSON.stringify(MagicLineShaderMaterial.uniforms)),
//       vertexShader: MagicLineShaderMaterial.vertexShader,
//       fragmentShader: MagicLineShaderMaterial.fragmentShader,
//       depthTest: true,
//       transparent: true,
//       wireframe: false,
//     });

//     const line = new THREE.Line( geometry, material );
//     lines.add(line);
//   }

//   lines.rotation.x = Math.PI / 2 + 10;
//   lines.rotation.z = Math.PI / 2;
//   lines.position.y = -100;
//   lines.position.z = -100;

//   scene.add(lines);

//   return lines;
// }

export default addLines;