import * as THREE from "three";

const customUniforms = {
  uTime: { type: "f", value: 0.0 },
  uRes: { type: "vec2", value: { x: 500, y: 500 } },
  uMouse: { type: "vec3", value: { x: 0, y: 0, z: 0 } },
  noiseSize: { type: "f", value: 1.0 },
  raycastUv: { type: "vec2", value: { x: 0, y: 0 } },
  depth: { type: "f", value: 500.0 },
  pallete: { type: "t", value: null },
  ripplePoints: {
    type: "v3v",
    value: new Array(3).fill(new THREE.Vector3(0, 0, 0)),
  },
};

const uniforms = THREE.UniformsUtils.merge([
  THREE.ShaderLib.basic.uniforms,
  THREE.ShaderLib.lambert.uniforms,
  // THREE.UniformsLib["ambient"],
  // THREE.UniformsLib["lights"],
  customUniforms,
]);

// console.log(uniforms);

const AboutShaderMaterial = {
  uniforms: uniforms,
  vertexShader: [
    "#define PI 3.1415926538",

    "uniform vec2 raycastUv;",
    "uniform float depth;",
    "uniform float noiseSize;",
    "uniform float uTime;",
    "uniform vec3 uMouse;",
    "uniform vec3 ripplePoints[3];",

    "varying vec2 vUv;",
    "varying vec3 p;",
    "varying float vNoiseDisp;",
    "varying float vPointRippleDisp;",

    "float random (in vec2 st) {",
    "return fract(sin(dot(st.xy, vec2(12.9898,78.233)))*43758.5453123);",
    "}",

    // Based on Morgan McGuire @morgan3d,
    // https://www.shadertoy.com/view/4dS3Wd
    "float noise (in vec2 st) {",
    "vec2 i = floor(st);",
    "vec2 f = fract(st);",

    // Four corners in 2D of a tile
    "float a = random(i);",
    "float b = random(i + vec2(1.0, 0.0));",
    "float c = random(i + vec2(0.0, 1.0));",
    "float d = random(i + vec2(1.0, 1.0));",

    "vec2 u = f * f * (3.0 - 2.0 * f);",

    "return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;",
    "}",

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

    "#define OCTAVES 2",
    "float fbm (in vec2 st) {",
    // Initial values
    "float value = 0.0;",
    "float amplitude = .5;",
    "float frequency = 0.;",
    //
    // Loop of octaves
    "for (int i = 0; i < OCTAVES; i++) {",
    "value += amplitude * noise(st);",
    "st *= 2.;",
    // "amplitude *= .0005;",
    "}",
    "return value;",
    "}",

    "float fbm2 ( in vec2 _st) {",
    "float v = 0.0;",
    "float a = 0.5;",
    "vec2 shift = vec2(100.0);",
    // Rotate to reduce axial bias
    "mat2 rot = mat2(cos(0.5), sin(0.5),-sin(0.5), cos(0.50));",
    "for (int i = 0; i < OCTAVES; ++i) {",
    "v += a * noise(_st);",
    "_st = rot * _st * 2.0 + shift;",
    "a *= 0.5;",
    "}",
    "return v;",
    "}",

    "void main() {",
    "vUv = uv;",
    "vec3 p = position;",

    // Distance from the pixel to the center
    // "float toCenter = distance(vUv,vec2(0.5));",

    // "vNoiseDisp = fbm(vUv * 10. * (abs(sin(uTime/1000.)) - 0.9));",
    "vNoiseDisp = snoise(vUv * uTime * 0.001 + uTime * 0.001);",

    // add normalized noise
    "p = p + normal * vNoiseDisp * depth;",

    "gl_Position = projectionMatrix * modelViewMatrix * vec4( p, 1.0 );",
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
    "const vec3 darker = vec3(45.0/255.0,107.0/255.0,55.0/255.0);",
    "const vec3 lighter = vec3(255.0/255.0,255.0/255.0,250.0/255.0);",

    "uniform float uTime;",
    "uniform float noiseSize;",
    "uniform vec2 raycastUv;",
    "uniform vec2 uRes;",
    "uniform vec3 uMouse;",
    "uniform sampler2D pallete;",
    "varying vec2 vUv;",
    "varying vec3 p;",
    "varying float vNoiseDisp;",
    "varying float vPointRippleDisp;",

    // HSV (hue, saturation, value)
    "vec3 hsv2rgb(vec3 c){",
    "vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);",
    "vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);",
    "return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);",
    "}",

    "void main() {",

    // Find center
    "vec2 toCenter = vec2(0.5)-vUv;",
    "float angle = atan(toCenter.y,toCenter.x);",
    "float radius = length(toCenter)*2.0;",

    "float hueFn = angle/(2.*PI)+0.5 * sin(uTime*0.01);",
    "float satFn = radius;",
    "float valFn = 1.0;",
    "vec3 hsv = hsv2rgb(vec3(hueFn, satFn, valFn));",
    "vec3 c = hsv;",

    "vec3 darken = mix(c,black,0.5);",
    // "c = mix(c, darken, 0.3 * vNoiseDisp);",
    // "c = mix(c, darken, 0.5 * vUv.x);",
    // "c = mix(c, black, 0.8);",
    "gl_FragColor = vec4(c, 1.0);",

    "}",
  ].join("\n"),
};

export default AboutShaderMaterial;
