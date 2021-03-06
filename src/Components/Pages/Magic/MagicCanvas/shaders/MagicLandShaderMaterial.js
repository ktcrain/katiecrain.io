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
  // noiseIn: { type: "f", value: 0.0 },
  noiseSize: { type: "f", value: 1.0 },
  raycastUv: { type: "vec2", value: { x: 0, y: 0 } },
  depth: { type: "f", value: 100.0 },
  pallete: { type: "t", value: null },

  lineTime: { type: "f", value: 1.0 },
  lineCount: { type: "f", value: 32.0 },
  dotSize: { type: "f", value: 0.3 },
  lineSize: { type: "f", value: 0.2 },
  blur: { type: "f", value: 0.05 },
  spiral: { type: "b", value: false },

  // ripplePoints: {
  //   type: "v3v",
  //   value: new Array(3).fill(new THREE.Vector3(0, 0, 0)),
  // },
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

const MagicLandShaderMaterial = {
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

    "#define PI 3.1415926538",

    "uniform float uTime;",
    "varying vec2 vUv;",
    "varying float vNoiseDisp;",
    "uniform float noiseSize;",
    "uniform float depth;",
    "uniform bool spiral;",
    "uniform float freqs[32];",
    "varying vec2 uvf;",

    "void main() {",
    "vUv = uv;",
    "vec3 p = position;",

    // "vUv.y *= 32.;",

    "uvf.x = freqs[int(ceil(vUv.x*32.))];",
    "uvf.y = freqs[int(ceil(vUv.y*32.))];",

    // // // Find distance from center vector
    "if(spiral) {",
    "float toCenter = distance(vUv,vec2(0.5));",
    "vUv = vec2(0.5) * toCenter * vUv;",
    "}",

    "vNoiseDisp = snoise(vUv*noiseSize*1000. + uTime * 0.001);",
    "p = position + normal * vNoiseDisp *depth;",

    "p.x = p.x * log(uvf.y)/2. * 0.1;",
    // "p.y = p.y * uvf.x * 10.;",

    "gl_Position = projectionMatrix * modelViewMatrix * vec4( p, 1.0 );",
    "}",
  ].join("\n"),

  fragmentShader: [
    "#define PI 3.1415926538",

    "vec3 hsv2rgb(vec3 c){",
    "vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);",
    "vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);",
    "return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);",
    "}",

    "uniform float uTime;",
    "uniform float noiseSize;",
    "uniform float depth;",
    "uniform float blur;",
    // "uniform vec2 uRes;",
    "uniform float lineTime;",
    "uniform float lineCount;",
    "uniform float lineSize;",
    "uniform float dotSize;",
    "varying vec2 vUv;",
    "varying vec2 uvf;",
    "varying float vNoiseDisp;",

    "vec3 heatColorMap(float t) {",
    "t *= 4.;",
    "return clamp(vec3(min(t-1.5, 4.5-t), min(t-0.5, 3.5-t), min(t+0.5, 2.5-t)), 0., 1.);",
    "}",

    "void main() {",

    "vec3 black = vec3(0);",
    // "vec3 c = hsv2rgb(vec3(vUv.x + uTime, 0.8, 0.7));",
    "vec3 c = heatColorMap(vUv.x);",

    // "vec3 c = vec3(1);",
    "vec2 st = vUv;",
    "st.x += uTime*0.1;",
    "st.y += uTime*0.1;",

    // find nearest dot posn
    "vec2 nearest = 2.0*fract(lineCount * st) - 1.0;",
    "float dist = length(nearest);",
    "vec3 dotcol = mix(c, black, smoothstep(dotSize, dotSize + dotSize*blur, dist));",

    // "st.x = 1. / length(st);",

    //draw lines

    "float x = fract(st.y * lineCount) - .5 + lineSize/2.;",
    "float fx = smoothstep(-lineSize*blur,0.0, x) - smoothstep(lineSize, lineSize + lineSize*blur, x);",

    // "float y = fract(st.x * lineCount) - 0.5 + lineSize/2.;",
    // // "float fy = smoothstep(-lineSize*blur,0.0, y) - smoothstep(lineSize, lineSize + lineSize*blur, y);",
    // "float fy = smoothstep(-lineSize*blur,0.0, y) - smoothstep(lineSize, lineSize + lineSize*blur, y);",

    "vec3 linecol = mix(black, c, fx);",

    //make lines darker based on z pos. Lines further back are darker
    // "c = mix(linecol, black, uvf);",
    "c = mix(linecol + dotcol, black, -vNoiseDisp);",

    // "c = mix(c,black,uvf.x);",

    // // make a tube
    // "float f = ;",

    // // add the angle
    // "f += atan(vUv.x, vUv.y) / acos(0.);",

    "gl_FragColor = vec4(c, 1.);",
    "}",
  ].join("\n"),
};

export default MagicLandShaderMaterial;
