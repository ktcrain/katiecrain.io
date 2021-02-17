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
  uRes: { type: "vec2", value: { x: 500, y: 500 } },
  uMouse: { type: "vec3", value: { x: 0, y: 0, z: 0 } },
  noiseSize: { type: "f", value: 1.0 },
  depth: { type: "f", value: 100.0 },
  pallete: { type: "t", value: null },
};

const uniforms = THREE.UniformsUtils.merge([
  THREE.ShaderLib.basic.uniforms,
  THREE.ShaderLib.lambert.uniforms,
  // THREE.UniformsLib["ambient"],
  // THREE.UniformsLib["lights"],
  customUniforms,
]);

// console.log(uniforms);

const CatShaderMaterial = {
  uniforms: uniforms,
  vertexShader: [
    "float map(float value, float min1, float max1, float min2, float max2) { return min2 + (value - min1) * (max2 - min2) / (max1 - min1);}",

    "float random (in float x) { return fract(sin(x)*43758.5453123);}",

    "float noise (in float x) {",
    "float i = floor(x);",
    "float f = fract(x);",

    "float a = random(i);",
    "float b = random(i + 1.);",
    "float u = f * f * (3.0 - 2.0 * f);",

    "return mix(a, b, u);",
    "}",

    "#define OCTAVES 3",
    "float fbm (in float x) {",
    "float value = 0.0;",
    "float amplitude = .5;",
    "float frequency = 0.;",

    "for (int i = 0; i < OCTAVES; i++) {",
    "value += amplitude * noise(x);",
    "x *= 2.;",
    "amplitude *= .7;",
    "}",
    "return value;",
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

    "vec4 mod289(vec4 x)",
    "{",
    "return x - floor(x * (1.0 / 289.0)) * 289.0;",
    "}",

    "vec4 permute(vec4 x)",
    "{",
    "return mod289(((x*34.0)+1.0)*x);",
    "}",

    "vec4 taylorInvSqrt(vec4 r)",
    "{",
    "return 1.79284291400159 - 0.85373472095314 * r;",
    "}",

    "vec3 fade(vec3 t) {",
    "return t*t*t*(t*(t*6.0-15.0)+10.0);",
    "}",

    // Classic Perlin noise
    "float cnoise(vec3 P)",
    "{",
    "vec3 Pi0 = floor(P);", // Integer part for indexing
    "vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1",
    "Pi0 = mod289(Pi0);",
    "Pi1 = mod289(Pi1);",
    "vec3 Pf0 = fract(P);", // Fractional part for interpolation
    "vec3 Pf1 = Pf0 - vec3(1.0);", // Fractional part - 1.0
    "vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);",
    "vec4 iy = vec4(Pi0.yy, Pi1.yy);",
    "vec4 iz0 = Pi0.zzzz;",
    "vec4 iz1 = Pi1.zzzz;",

    "vec4 ixy = permute(permute(ix) + iy);",
    "vec4 ixy0 = permute(ixy + iz0);",
    "vec4 ixy1 = permute(ixy + iz1);",

    "vec4 gx0 = ixy0 * (1.0 / 7.0);",
    "vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;",
    "gx0 = fract(gx0);",
    "vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);",
    "vec4 sz0 = step(gz0, vec4(0.0));",
    "gx0 -= sz0 * (step(0.0, gx0) - 0.5);",
    "gy0 -= sz0 * (step(0.0, gy0) - 0.5);",

    "vec4 gx1 = ixy1 * (1.0 / 7.0);",
    "vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;",
    "gx1 = fract(gx1);",
    "vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);",
    "vec4 sz1 = step(gz1, vec4(0.0));",
    "gx1 -= sz1 * (step(0.0, gx1) - 0.5);",
    "gy1 -= sz1 * (step(0.0, gy1) - 0.5);",

    "vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);",
    "vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);",
    "vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);",
    "vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);",
    "vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);",
    "vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);",
    "vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);",
    "vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);",

    "vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));",
    "g000 *= norm0.x;",
    "g010 *= norm0.y;",
    "g100 *= norm0.z;",
    "g110 *= norm0.w;",
    "vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));",
    "g001 *= norm1.x;",
    "g011 *= norm1.y;",
    "g101 *= norm1.z;",
    "g111 *= norm1.w;",

    "float n000 = dot(g000, Pf0);",
    "float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));",
    "float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));",
    "float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));",
    "float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));",
    "float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));",
    "float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));",
    "float n111 = dot(g111, Pf1);",

    "vec3 fade_xyz = fade(Pf0);",
    "vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);",
    "vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);",
    "float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);",
    "return 2.2 * n_xyz;",
    "}",

    // Classic Perlin noise, periodic variant
    "float pnoise(vec3 P, vec3 rep)",
    "{",
    "vec3 Pi0 = mod(floor(P), rep);", // Integer part, modulo period
    "vec3 Pi1 = mod(Pi0 + vec3(1.0), rep);", // Integer part + 1, mod period
    "Pi0 = mod289(Pi0);",
    "Pi1 = mod289(Pi1);",
    "vec3 Pf0 = fract(P);", // Fractional part for interpolation
    "vec3 Pf1 = Pf0 - vec3(1.0);", // Fractional part - 1.0
    "vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);",
    "vec4 iy = vec4(Pi0.yy, Pi1.yy);",
    "vec4 iz0 = Pi0.zzzz;",
    "vec4 iz1 = Pi1.zzzz;",

    "vec4 ixy = permute(permute(ix) + iy);",
    "vec4 ixy0 = permute(ixy + iz0);",
    "vec4 ixy1 = permute(ixy + iz1);",

    "vec4 gx0 = ixy0 * (1.0 / 7.0);",
    "vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;",
    "gx0 = fract(gx0);",
    "vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);",
    "vec4 sz0 = step(gz0, vec4(0.0));",
    "gx0 -= sz0 * (step(0.0, gx0) - 0.5);",
    "gy0 -= sz0 * (step(0.0, gy0) - 0.5);",

    "vec4 gx1 = ixy1 * (1.0 / 7.0);",
    "vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;",
    "gx1 = fract(gx1);",
    "vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);",
    "vec4 sz1 = step(gz1, vec4(0.0));",
    "gx1 -= sz1 * (step(0.0, gx1) - 0.5);",
    "gy1 -= sz1 * (step(0.0, gy1) - 0.5);",

    "vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);",
    "vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);",
    "vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);",
    "vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);",
    "vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);",
    "vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);",
    "vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);",
    "vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);",

    "vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));",
    "g000 *= norm0.x;",
    "g010 *= norm0.y;",
    "g100 *= norm0.z;",
    "g110 *= norm0.w;",
    "vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));",
    "g001 *= norm1.x;",
    "g011 *= norm1.y;",
    "g101 *= norm1.z;",
    "g111 *= norm1.w;",

    "float n000 = dot(g000, Pf0);",
    "float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));",
    "float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));",
    "float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));",
    "float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));",
    "float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));",
    "float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));",
    "float n111 = dot(g111, Pf1);",

    "vec3 fade_xyz = fade(Pf0);",
    "vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);",
    "vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);",
    "float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);",
    "return 2.2 * n_xyz;",
    "}",

    "#define PI 3.1415926538",

    "uniform float uTime;",
    "varying vec2 vUv;",
    "varying float vNoiseDisp;",
    "uniform float noiseSize;",
    "uniform float depth;",

    "void main() {",
    "vUv = uv;",
    "vec3 p = position;",

    "vNoiseDisp = cnoise(p*noiseSize*1. + uTime * 0.1);",

    "p.x = 50. + p.x + sin(uTime)*5.;",

    "p.y = p.y + 25. + noiseSize*50000.;",

    "gl_Position = projectionMatrix * modelViewMatrix * vec4( p, 1.0 );",
    "}",
  ].join("\n"),

  fragmentShader: [
    "uniform float uTime;",
    "uniform float noiseSize;",
    "uniform float depth;",
    "uniform sampler2D pallete;",
    "varying vec2 vUv;",
    "varying float vNoiseDisp;",

    "void main() {",

    "vec3 black = vec3(0);",

    "vec4 c = texture2D( pallete, vUv );",

    "if(c.x > 0.8 && c.y > 0.8 && c.z > 0.8) {",
    "c.x = 0.0;",
    "c.y = 0.0;",
    "c.z = 0.0;",
    "c.z =0.0;",
    "}",

    "gl_FragColor = c;",
    "}",
  ].join("\n"),
};

export default CatShaderMaterial;
