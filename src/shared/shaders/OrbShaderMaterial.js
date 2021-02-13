// import THREE from "../three"; // note the import here
import * as THREE from "three";

// load a texture, set wrap mode to repeat
// const textureLoader = new THREE.TextureLoader();
// textureLoader.setCrossOrigin("");
// const ditherTex = textureLoader.load( "https://ktbox.s3.amazonaws.com/rainbow-sky.jpg" );
// ditherTex.wrapS = THREE.RepeatWrapping;
// ditherTex.wrapT = THREE.RepeatWrapping;
// ditherTex.repeat.set( 4, 4 );

const customUniforms = {
  uTime: { type: "f", value: 0.0 },
  uRes: { type: "vec2", value: {x: 500, y: 500} },
  uMouse: { type: "vec2", value: {x: 0, y: 0} },
  noiseSize: { type: "f", value: 0.0 },
  raycastUv: { type: "vec2", value: {x: 0, y: 0} },
  depth: { type: "f", value: 10.0 },
};

const uniforms = THREE.UniformsUtils.merge( [
  THREE.UniformsLib[ "ambient" ],
  THREE.UniformsLib[ "lights" ],
  customUniforms
] );

console.log(uniforms);

const OrbShaderMaterial = {
  uniforms: uniforms,
  vertexShader: [
    "uniform vec2 raycastUv;",
    "varying vec2 vUv;",
    "varying float vNoiseDisp;",
    "varying vec3 p;",
    "uniform float depth;",
    "uniform float noiseSize;",
    // Start Ashima 2D Simplex Noise
    //outputs in range -1 to 1

    "vec3 mod289(vec3 x) {",
    "return x - floor(x * (1.0 / 289.0)) * 289.0;",
    "}",

    "vec2 mod289(vec2 x) {",
    "return x - floor(x * (1.0 / 289.0)) * 289.0;",
    "}",

    "vec3 permute(vec3 x) {",
    "return mod289(((x*34.0)+1.0)*x);",
    "}",

    "float snoise(vec2 v) {",

    "const vec4 C = vec4(0.211324865405187,", // (3.0-sqrt(3.0))/6.0
    "				  0.366025403784439,", // 0.5*(sqrt(3.0)-1.0)
    "				 -0.577350269189626,", // -1.0 + 2.0 * C.x
    "				  0.024390243902439);", // 1.0 / 41.0",

    "vec2 i  = floor(v + dot(v, C.yy) );",
    "vec2 x0 = v -   i + dot(i, C.xx);",

    "vec2 i1;",
    "i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);",
    "vec4 x12 = x0.xyxy + C.xxzz;",
    "x12.xy -= i1;",

    "i = mod289(i); // Avoid truncation effects in permutation",
    "vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))",
    "	+ i.x + vec3(0.0, i1.x, 1.0 ));",

    "vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);",
    "m = m*m ;",
    "m = m*m ;",

    "vec3 x = 2.0 * fract(p * C.www) - 1.0;",
    "vec3 h = abs(x) - 0.5;",
    "vec3 ox = floor(x + 0.5);",
    "vec3 a0 = x - ox;",

    "m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );",

    "vec3 g;",
    "g.x  = a0.x  * x0.x  + h.x  * x0.y;",
    "g.yz = a0.yz * x12.xz + h.yz * x12.yw;",
    "return 130.0 * dot(m, g);",
    "}",

    // End Ashima 2D Simplex Noise

    "void main() {",
      "vUv = uv;",
      "p = position;",

      "vec2 rUv = raycastUv;",
      "float distanceToIntersect = distance(rUv, vUv);",
      
      "float peakBound = 0.05;",
      "float indentDepth = 0.05;",
      "if(distanceToIntersect < peakBound) {",
        // "p.z += indentDepth;",
        "p.z = -2.0 + p.z - exp(-(p.z * indentDepth * 2.*((distanceToIntersect - peakBound)/peakBound)));",
        // "p = p - exp(-(p * indentDepth * 2.*((distanceToIntersect - peakBound)/peakBound)));",
      "}",

      "vNoiseDisp = snoise(vUv * distanceToIntersect * 1000.);",
      "vec3 newPosition = p + normal * -vNoiseDisp *depth * noiseSize;",
      "gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );",
    "}",
  ].join("\n"),

  fragmentShader: [
    " #define PI 3.14159265359",
    "const vec3 black = vec3(0.0, 0.0, 0.0);",
    "const vec3 grey = vec3(127.0, 127.0, 127.0);",
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
    "uniform vec3 ambientLightColor;",
    'uniform vec3 diffuse;',
    "varying vec2 vUv;",
    "varying vec3 p;",
    "varying float vNoiseDisp;",

    'struct DirectionalLight {',
      'vec3 direction;',
      'vec3 color;',
    '};',
    'uniform DirectionalLight directionalLights[NUM_DIR_LIGHTS];',

    // HSV (hue, saturation, value)
    "vec3 hsv2rgb(vec3 c){",
    "vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);",
    "vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);",
    "return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);",
    "}",

    "float smoothCenter(vec2 st, vec2 point, float start, float end) {",
        // Distance from point to center
        "float st2c = distance(st,point);",
        "return smoothstep(start,end,st2c);",
    "}",

    "void main() {",

    'vec4 addedLights = vec4(0.0, 0.0, 0.0, 1.0);',

    'for (int i = 0; i < NUM_DIR_LIGHTS; i++) {',
      'addedLights.rgb += directionalLights[i].color;', // LOOKS LIKE THIS LINE IS THE ISSUE
    '}',

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
    "float hueFn = (-noiseSize/10. + angle/(2.*PI))+0.5;",
    "float satFn = radius * (noiseSize + 1.);",
    "vec3 c = hsv2rgb(vec3(hueFn, satFn, max(noiseSize, 0.5)));",
    // "vec3 darken = mix(orange, c, smoothCenter(st, raycastUv, 0.1, 1.));",
    // "c = mix(black, c, distance(p.z, vUv.x));",
    "gl_FragColor = vec4(c, 1.0) * addedLights * 1.5;",

    "}",
  ].join("\n"),
};

export default OrbShaderMaterial;