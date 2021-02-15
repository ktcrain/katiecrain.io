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

const EqualizerShaderMaterial = {
  uniforms: uniforms,
  vertexShader: [
    "uniform float uTime;",
    "varying vec2 vUv;",
    "uniform float noiseSize;",
    "uniform float freqs[32];",
    "varying vec2 uvf;",

    "void main() {",
    "vUv = uv;",

    // "uvf.y *= 32.;",

    "uvf.x = freqs[int(ceil(uvf.x*32.))];",
    "uvf.y = freqs[int(ceil(uvf.y*32.))];",

    "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
    "}",
  ].join("\n"),

  fragmentShader: [
    "#define NB_BARS 16",
    "#define NB_SAMPLES	32",
    // WARNING : NB_BARS x NB_SAMPLES must be 512

    // space between bars (relative to bar width)
    "#define SPACE 0.15",

    // space without bars, left and right (relative to window size)
    "#define SIDE_SPACE  0.04",

    // from here: www.shadertoy.com/view/XtjBzG
    "vec3 heatColorMap(float t) {",
    "t *= 4.;",
    "return clamp(vec3(min(t-1.5, 4.5-t), min(t-0.5, 3.5-t), min(t+0.5, 2.5-t)), 0., 1.);",
    "}",

    "uniform float uTime;",
    // "uniform float noiseSize;",
    "uniform vec2 uRes;",
    "uniform float lineCount;",
    "uniform float lineSize;",
    "varying vec2 vUv;",
    "varying vec2 uvf;",
    "uniform float freqs[32];",

    "void main() {",

    "vec3 black = vec3(0);",
    "vec2 st = vUv;",

    // "st.x = (st.x-SIDE_SPACE)/(1.-2.*SIDE_SPACE);",

    "float NB_BARS_F = float(NB_BARS);",
    "int bar = int(floor(st.x * NB_BARS_F));",

    "float f = 0.;",

    // "f = uvf.y * 8.;",

    "for(int t=0; t<NB_SAMPLES; t++) {",
    // "f += texelFetch(freqs, ivec2(bar*NB_SAMPLES+t, 0), 0).r;",
    "f+= freqs[bar];",
    "}",
    "f /= float(NB_SAMPLES);",

    "f *= 5.85;",
    "f += 0.02;",

    "vec3 c = heatColorMap(f);",

    "float bar_f = float(bar)/NB_BARS_F;",

    "c *= mix(1.,0., clamp((st.y-f)*uRes.y,0.,1.));",
    "c *= clamp((min((st.x-bar_f)*NB_BARS_F, 1.-(st.x-bar_f)*NB_BARS_F)-SPACE*.5)/NB_BARS_F*uRes.x, 0., 1.);",

    "gl_FragColor = vec4(c, 1.);",
    "}",
  ].join("\n"),
};

export default EqualizerShaderMaterial;
