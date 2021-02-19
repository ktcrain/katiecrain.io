// import THREE from "../three"; // note the import here
import * as THREE from "three";

const customUniforms = {
  uTime: { type: "f", value: 0.0 },
  uRes: { type: "vec2", value: { x: 2000, y: 2000 } },
  uMouse: { type: "vec3", value: { x: 0, y: 0, z: 0 } },
  noiseSize: { type: "f", value: 1.0 },
  raycastUv: { type: "vec2", value: { x: 0, y: 0 } },
  depth: { type: "f", value: 100.0 },
  pallete: { type: "t", value: null },

  lineTime: { type: "f", value: 1.0 },
  lineCount: { type: "f", value: 32.0 },
  dotSize: { type: "f", value: 0.1 },
  lineSize: { type: "f", value: 0.05 },
  blur: { type: "f", value: 0.1 },
  spiral: { type: "b", value: false },
  freqs: {
    type: "fv",
    value: new Array(32).fill(1.0),
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

const WavelengthShaderMaterial = {
  uniforms: uniforms,
  vertexShader: [
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

    "uniform float uTime;",
    "varying vec2 vUv;",
    "uniform float noiseSize;",
    "varying float vNoiseDisp;",

    "void main() {",
    "vUv = uv;",
    "vec3 p = position;",

    "vNoiseDisp = snoise(vUv*noiseSize*1. + uTime * 0.1);",
    "gl_Position = projectionMatrix * modelViewMatrix * vec4( p, 1.0 );",
    "}",
  ].join("\n"),

  fragmentShader: [
    "#define PI 3.1415926538",

    "const float lineWidth = 20.0;",

    "vec3 hsv2rgb(vec3 c){",
    "vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);",
    "vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);",
    "return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);",
    "}",

    // // from here: www.shadertoy.com/view/XtjBzG
    "vec3 heatColorMap(float t) {",
    "t *= 4.;",
    "return clamp(vec3(min(t-1.5, 4.5-t), min(t-0.5, 3.5-t), min(t+0.5, 2.5-t)), 0., 1.);",
    "}",

    "uniform float uTime;",
    "uniform float noiseSize;",
    "uniform float depth;",
    "uniform float blur;",
    "uniform vec2 uRes;",
    "uniform float freqs[32];",

    "varying vec2 vUv;",
    "varying vec2 uvf;",
    "varying float vNoiseDisp;",

    "vec3 plotSinWave(vec2 currentUv, float freq, float amp, vec3 color, vec3 bgc) {",
    "float dx = lineWidth / uRes.x;",
    "float dy = lineWidth / uRes.y;",
    "float sy = sin(currentUv.x * freq + uTime*10.) * amp;",
    "float dsy = cos(currentUv.x * freq + uTime) * amp * freq;",
    "float alpha = smoothstep(0.0, dy, (abs(currentUv.y - sy))/sqrt(1.0+dsy*dsy));",
    "return mix(color, bgc, alpha);",
    "}",

    "float genRange(float s, float e, float d) {",
    "float c = mod(uTime * 0.3, d);",
    "float halfTime = d / 2.0;",
    "if(c - halfTime <= 0.0)",
    "return s * (1.0 - c / halfTime) + e * (c / halfTime);",
    "else",
    "return s + abs(e - s) - (c - halfTime) / halfTime * abs(e - s);",
    "}",

    "void main() {",

    "vec3 black = vec3(0);",
    "vec3 pink = vec3(1,0,1);",
    "vec3 green = vec3(0,1,0);",

    "vec3 c = black;",

    // "float f = freqs[bar];",

    "vec2 st = vUv;",
    "st.y = .5 - st.y;",

    "for(int t=0; t<8; t++) {",
    "float f = freqs[t];",
    "f = sqrt(f);",
    "c += plotSinWave(st, 1.0+f*20., 0.1+f*.5+genRange(0.001,0.1,0.1), hsv2rgb(vec3(f*1000.,1.0,1.0)), vec3(0.0));",
    "}",

    "gl_FragColor = vec4(c, 1.0);",
    "}",
  ].join("\n"),
};

export default WavelengthShaderMaterial;
