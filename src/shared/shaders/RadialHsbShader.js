// import THREE from "../three"; // note the import here
// import * as THREE from "three";

// load a texture, set wrap mode to repeat
// const textureLoader = new THREE.TextureLoader();
// textureLoader.setCrossOrigin("");
// const ditherTex = textureLoader.load( "https://ktbox.s3.amazonaws.com/rainbow-sky.jpg" );
// ditherTex.wrapS = THREE.RepeatWrapping;
// ditherTex.wrapT = THREE.RepeatWrapping;
// ditherTex.repeat.set( 4, 4 );

const RadialHsbShader = {
  uniforms: {
    uTime: { type: "f", value: 0.0 },
    uRes: { type: "vec2", value: {x: 500, y: 500} },
    uMouse: { type: "vec2", value: {x: 0, y: 0} },
    noiseSize: { type: "f", value: 0.0 },

  },

  vertexShader: [
    "varying vec2 vUv;",

    "void main() {",
      "vUv = uv;",
      "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
    "}",
  ].join("\n"),

  fragmentShader: [
    " #define PI 3.14159265359",
    "const vec3 black = vec3(0.0, 0.0, 0.0);",
    "const vec3 white = vec3(255.0, 255.0, 255.0);",
    "const vec3 red = vec3(0.894,0.012,0.012);",
    "const vec3 orange = vec3(1.000,0.549,0.000);",
    "const vec3 yellow = vec3(1.000,0.929,0.000);",
    "const vec3 green = vec3(0.000,0.502,0.149);",
    "const vec3 blue = vec3(0.000,0.302,1.000);",
    "const vec3 purple = vec3(0.459,0.027,0.529);",

    "uniform float uTime;",
    "uniform float noiseSize;",
    "uniform vec2 uRes;",
    "uniform vec2 uMouse;",
    "varying vec2 vUv;",
    // HSV (hue, saturation, value)
    "vec3 hsv2rgb(vec3 c){",
    "vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);",
    "vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);",
    "return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);",
    "}",
    
    "void main() {",

    "float nt = uTime/1.;",
    // "float nt = 0.;",

    // the current vector
    "vec2 st = vUv;",

    // Find center
    "vec2 toCenter = vec2(0.5)-st;",

    "float angle = atan(toCenter.y,toCenter.x);",
    "float radius = length(toCenter)*2.0;",

    // Find distance from mouse vector
    // "float mouseDist = length(vec2(uMouse.y, 0));",

    // color testing
    "vec3 c = hsv2rgb(vec3((-noiseSize/10. + angle/(2.*PI))+0.5, radius * (noiseSize + 1.),noiseSize + 0.25));",

    "c = mix(black, c, smoothstep(0.0,0.5, distance(st,vec2(0.5))));",

    "gl_FragColor = vec4(c, 1.0);",

    "}",
  ].join("\n"),
};

export default RadialHsbShader;