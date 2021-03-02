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

const VoxelShaderMaterial = {
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

    "uniform float uTime;",
    "uniform float noiseSize;",
    "uniform float depth;",
    "uniform float blur;",
    "uniform vec2 uRes;",
    "uniform float freqs[32];",

    "varying vec2 vUv;",
    "varying vec2 uvf;",
    "varying float vNoiseDisp;",

    "mat2 r2d(float a) {",
    "float c = cos(a), s = sin(a);",
    "return mat2(c, s, -s, c);",
    "}",

    "vec2 path(float t) {",
    "float a = sin(t*.2 + 1.5), b = sin(t*.2);",
    "return vec2(2.*a, a*b);",
    "}",

    "float g = 0.;",
    "float de(vec3 p) {",
    "p.xy -= path(p.z);",
    "float d = -length(p.xy) + 4.;",
    "p.xy += vec2(cos(p.z + uTime)*sin(uTime), cos(p.z + uTime));",
    "p.z -= 6. + uTime * 6.;",
    "d = min(d, dot(p, normalize(sign(p))) - 1.);",
    "g += .015 / (.01 + d * d);",
    "return d;",
    "}",

    "void main() {",

    "vec2 st = vUv - 0.5;",
    // "vec2 uv = fragCoord / iResolution.xy - .5;",
    // "uv.x *= iResolution.x / iResolution.y;",

    "vec3 black = vec3(0);",
    "vec3 pink = vec3(1,0,1);",
    "vec3 green = vec3(0,1,0);",

    "float dt = uTime * 6.;",
    "vec3 ro = vec3(0, 0, -5. + dt);",
    "vec3 ta = vec3(0, 0, dt);",

    "ro.xy += path(ro.z);",
    "ta.xy += path(ta.z);",

    "vec3 fwd = normalize(ta - ro);",
    "vec3 right = cross(fwd, vec3(0, 1, 0));",
    "vec3 up = cross(right, fwd);",
    "vec3 rd = normalize(fwd + st.x*right + st.y*up);",

    "rd.xy *= r2d(sin(-ro.x / 3.14)*.3);",

    "vec3 p = floor(ro) + .5;",
    "vec3 mask;",
    "vec3 drd = 1. / abs(rd);",
    "rd = sign(rd);",
    "vec3 side = drd * (rd * (p - ro) + .5);",

    "float t = 0., ri = 0.;",
    "for (float i = 0.; i < 1.; i += .01) {",
    "ri = i;",
    "if (de(p) < 0.) break;",
    "mask = step(side, side.yzx) * step(side, side.zxy);",
    "side += drd * mask;",
    "p += rd * mask;",
    "}",
    "t = length(p - ro);",

    "vec3 c = vec3(1) * length(mask * vec3(1., .5, .75));",
    "c = mix(vec3(.2, .2, .7), vec3(.2, .1, .2), c);",
    "c += g * .4;",
    "c.r += sin(uTime)*.2 + sin(p.z*.5 - uTime * 6.);",
    "c = mix(c, vec3(.2, .1, .2), 1. - exp(-.001*t*t));",

    "gl_FragColor = vec4(c, 1.0);",
    "}",
  ].join("\n"),
};

export default VoxelShaderMaterial;
