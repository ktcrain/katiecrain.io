// import THREE from "../three"; // note the import here
// import * as THREE from "three";

// load a texture, set wrap mode to repeat
// const textureLoader = new THREE.TextureLoader();
// textureLoader.setCrossOrigin("");
// const ditherTex = textureLoader.load( "https://ktbox.s3.amazonaws.com/rainbow-sky.jpg" );
// ditherTex.wrapS = THREE.RepeatWrapping;
// ditherTex.wrapT = THREE.RepeatWrapping;
// ditherTex.repeat.set( 4, 4 );

const RipplesShader = {
  uniforms: {
    uTime: { type: "f", value: 0.0 },
    uRes: { type: "vec2", value: {x: 500, y: 500} },
    uMouse: { type: "vec2", value: {x: 0, y: 0} },
    noiseSize: { type: "f", value: 0.0 },
    raycastUv: { type: "vec2", value: {x: 0, y: 0} },
  },

  vertexShader: [
    "uniform vec2 raycastUv;",
    "varying vec2 vUv;",
    "varying vec3 p;",

    "void main() {",
      "vUv = uv;",
      "p = position;",
      "vec2 rUv = raycastUv;",
      "float distanceToIntersect = distance(rUv, vUv);",
      
      "float peakBound = 0.5;",
      "float indentDepth = 1.75;",
      "if(distanceToIntersect < peakBound) {",
        "p.z += indentDepth;",
        // "p.z = -exp(-(p.z * 5.*((distanceToIntersect - peakBound)/peakBound)));",
        "p.z = p.z - exp(-(p.z * indentDepth * 2.*((distanceToIntersect - peakBound)/peakBound)));",
      "}",

      "gl_Position = projectionMatrix * modelViewMatrix * vec4( p, 1.0 );",
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
    "uniform vec2 raycastUv;",
    "uniform vec2 uRes;",
    "uniform vec2 uMouse;",
    "varying vec2 vUv;",

    // HSV (hue, saturation, value)
    "vec3 hsv2rgb(vec3 c){",
    "vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);",
    "vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);",
    "return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);",
    "}",

    "float smoothCenter(vec2 st, vec2 point, float start, float end) {",
        // Distance from point to center
        "float st2c = distance(st,point);",
        "return smoothstep(start,end, st2c);",
    "}",

    "void main() {",

    "float nt = uTime/1.;",
    // "float nt = 0.;",

    // the current vector
    "vec2 st = vUv;",

    // Find center
    "vec2 toCenter = vec2(0.5)-st;",
    // "vec2 toCenter = raycastUv-st;",
    "vec2 toIntersect = raycastUv-st;",

    "float angle = atan(toCenter.y,toCenter.x);",
    "float radius = length(toCenter)*2.0;",

    // convert [-1,1] to [0,1]
    // "vec2 m = (uMouse + 1.)/2.;",

    // // Find distance from mouse vector
    // "vec2 mouseDist = m - st;",

    // "float angle = atan(mouseDist.y,mouseDist.x);",
    // "float radius = length(mouseDist)*2.0;",

    // color testing
    // "float hueFn = fract(st.y*1.);",
    // "float satFn = 0.8;",
    "float hueFn = (-noiseSize/10. + angle/(2.*PI))+0.5;",
    "float satFn = radius * (noiseSize + 1.);",
    "vec3 c = hsv2rgb(vec3(hueFn, satFn, max(noiseSize, 0.5)));",
    // "c = mix(black, c, smoothCenter(st, vec2(0.5)));",
    "vec3 c2 = mix(black, c, smoothCenter(st, raycastUv, 0.0, 0.1));",
    "c = mix(c2, c, smoothCenter(st, raycastUv, 0.0, 0.8));",
    "gl_FragColor = vec4(c, 1.0);",

    "}",
  ].join("\n"),
};

export default RipplesShader;