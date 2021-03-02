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
  raycastUv: { type: "vec2", value: { x: 0, y: 0 } },
  depth: { type: "f", value: 10.0 },
  pallete: { type: "t", value: null },
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

const BackgroundShaderMaterial = {
  uniforms: uniforms,
  vertexShader: [
    "#define PI 3.1415926538",

    "uniform vec2 uRes;",
    "uniform float depth;",
    "uniform float noiseSize;",
    "uniform float uTime;",
    "uniform vec3 uMouse;",
    "uniform float freqs[32];",

    "varying vec2 vUv;",
    "varying vec3 p;",
    "varying vec3 vNormal;",
    "varying float vNoiseDisp;",

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

    "float plotSinWave(vec2 currentUv, float freq, float amp, float lineWidth) {",
    "float dx = lineWidth / uRes.x;",
    "float dy = lineWidth / uRes.y;",
    "float sy = sin(currentUv.x * freq + uTime*10.) * amp;",
    "float dsy = cos(currentUv.x * freq + uTime) * amp * freq;",
    "float alpha = smoothstep(0.0, dy, (abs(currentUv.y - sy))/sqrt(1.0+dsy*dsy));",
    "return alpha;",
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
    "vUv = uv;",
    "p = position;",
    "vNormal = normal;",

    "int bar = int(floor(vUv.y * 32.));",
    // "vUv *= 32.;",
    // "vUv = fract(vUv);",

    "float f = freqs[bar];",
    "f = sqrt(f);",

    "vNoiseDisp = snoise(vUv * uTime * 0.01);",

    "vec2 nearest = vec2(vUv.y, bar);",
    "float dist = f * length(nearest) * 100.;",

    // "float f = vNoiseDisp*100.;",

    // "p.z += dist * sin((15.-vUv.y+uTime*0.1) * uTime*0.05 + uTime*0.1);",

    "int barOff = bar + 16;",

    // "p.x += f * 1000. * vNoiseDisp;",

    // "p += normal * vNoiseDisp*20.;",

    "gl_Position = projectionMatrix * modelViewMatrix * vec4( p, 1.0 );",
    "}",
  ].join("\n"),

  fragmentShader: [
    " #define PI 3.14159265359",
    "#define TAU 6.283185307179586",

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
    "varying vec3 vNormal;",
    "uniform float freqs[32];",

    "vec2 rotate2D(vec2 _st, float _angle){",
    "_st -= 0.5;",
    "_st =  mat2(cos(_angle),-sin(_angle),sin(_angle),cos(_angle)) * _st;",
    "_st += 0.5;",
    "return _st;",
    "}",

    "vec3 spiral(vec2 p, float uTime, sampler2D pallete, float vNoiseDisp) {",
    "float angle = atan(p.y, p.x);",
    "float turn = (angle + PI) / TAU;",
    "float radius = 0.1 * sqrt(p.x*p.x + p.y*p.y);",

    "float rotation = 0.04 * TAU * uTime;",
    // "float rotation = 0.04 * TAU;",
    "float turn_1 = turn + rotation;",

    "float n_sub = 2.0;",

    "float turn_sub = mod(float(n_sub) * turn_1, float(n_sub));",

    "float k_sine = 0.1 * sin(3.0 * uTime);",
    // "float k_sine = 0.1 * sin(3.0);",

    "float sine = k_sine * sin(50.0 * (pow(radius, 0.1) - 0.4 * uTime));",

    "float turn_sine = turn_sub + sine;",

    "int n_colors = 7;",
    "int i_turn = int(mod(float(n_colors) * turn_sine, float(n_colors)));",

    "int i_radius = int(1.5/pow(radius*0.5, 0.6) + 5.0 * uTime);",

    "int i_color = int(mod(float(i_turn + i_radius), float(n_colors)));",

    "vec2 stripPos = 4. * p;",
    "stripPos = rotate2D(stripPos, -turn_sine);",
    "vec4 stripColor = texture2D( pallete, stripPos);",

    "vec3 color;",
    "if(i_color == 0) {",
    "color = stripColor.rgb;",
    "} else if(i_color == 1) {",
    "color = orange;",
    "} else if(i_color == 2) {",
    "color = yellow;",
    "} else if(i_color == 3) {",
    "color = green;",
    "} else if(i_color == 4) {",
    "color = blue;",
    "} else if(i_color == 5) {",
    "color = purple;",
    "} else if(i_color == 6) {",
    "color = black;",
    "}",

    "color *= pow(radius, 0.5)*1.0;",
    "return color;",
    "}",

    "void main() {",

    "vec2 st = vUv;",
    "st.y *= 32.;",

    "vec3 light = vec3( 0.5, 0.5, 0.5 );",
    "light = normalize( light );",

    "float dProd = dot( vNormal, light ) * 1.5 + 0.5;",

    "float repeat = 10.;",
    "vec2 stripPos = vUv;",
    // "stripPos += uTime*0.1;",
    "vec2 sp = (p.xy) / uRes.xx;",
    // "float angle = atan(sp.y, sp.x);",
    // "float turn = (angle + PI) / TAU;",
    // "float radius = 0.1 * sqrt(sp.x*sp.x + sp.y*sp.y);",
    // "float rotation = 0.04 * TAU * uTime*2.0;",
    // "stripPos = rotate2D(stripPos, -rotation);",
    "stripPos *= repeat;",
    // "vec4 stripColor = texture2D( pallete, stripPos);",
    // "stripColor *= pow(2.0 - vNoiseDisp, 1.2);",

    "vec3 c = spiral(sp, uTime, pallete, vNoiseDisp);",

    "int bar = int(floor(st.y * 32.));",
    "float f = freqs[bar];",
    // "f = 100. * sqrt(f);",

    // "c = mix(c,stripColor.rgb,0.1);",

    // "vec2 nearest = vec2(st.x, bar);",
    // "float dist = length(nearest);",

    // "int barOff = bar + 0;",

    // "if(barOff % 64 > 0 && barOff % 64 < 16) {",
    // "c = mix(c, yellow, 0.95);",
    // "}",

    "vec3 darken = mix(c,black,0.5);",
    // "c = mix(c, darken, 0.3 * vNoiseDisp);",
    // "c = mix(c, darken, 0.5 * p.x);",
    // "c = mix(c, darken, 0.8 * p.y);",
    // "c = mix(c, black, 0.7 * normalize(p.z));",

    "gl_FragColor = vec4(c*dProd, 1.0);",

    "}",
  ].join("\n"),
};

export default BackgroundShaderMaterial;
