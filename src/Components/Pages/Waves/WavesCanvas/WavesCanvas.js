import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import * as Tone from "tone";
// import { TweenMax } from "gsap";
import "./WavesCanvas.scss";
import { updateAudioProps, sumFrequencyData } from "@components/Piano";
import useWindowSize from "@shared/hooks/useWindowSize";
import addCamera from "./helpers/addCamera";
import addLights from "./helpers/addLights";
// import addCat from "./helpers/addCat";
// import addStars from "./helpers/addStars";
import addWavelengthMesh from "./helpers/addWavelengthMesh";
// import addLandMesh, {
//   createGeometry as createLandGeometry,
// } from "./helpers/addLandMesh";
// import addEqualizer from "./helpers/addEqualizer";
// import SimplexNoise from "@shared/SimplexNoise";
// import KTUtil from "@utils/KTUtil";
// import MagicLandShaderMaterial from "./shaders/MagicLandShaderMaterial";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
// import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
// import { GlitchPass } from "three/examples/jsm/postprocessing/GlitchPass.js";
// import { RGBShiftShader } from "three/examples/jsm/shaders/RGBShiftShader.js";
// import { MirrorShader } from "three/examples/jsm/shaders/MirrorShader.js";
// import { KaleidoShader } from "three/examples/jsm/shaders/KaleidoShader.js";
// import { HorizontalTiltShiftShader } from "three/examples/jsm/shaders/HorizontalTiltShiftShader.js";
// import { VerticalTiltShiftShader } from "three/examples/jsm/shaders/VerticalTiltShiftShader.js";
// import { HorizontalBlurShader } from "three/examples/jsm/shaders/HorizontalBlurShader.js";
// import { VerticalBlurShader } from "three/examples/jsm/shaders/VerticalBlurShader.js";
// import BadTVShader from "@shared/shaders/BadTVShader";
// import { FilmPass } from "three/examples/jsm/postprocessing/FilmPass.js";

function WavesCanvas() {
  console.log("RENDER :: WavesCanvas");

  const mount = useRef();
  const scene = useRef();
  const renderer = useRef();
  const camera = useRef();
  const composer = useRef();
  const rect = useRef();
  let uTime = useRef(1000.0);
  let noiseSize = useRef(0.0);
  let requestId = useRef();
  const player = useRef();
  const buffer = useRef();
  // const offlineContext = useRef();
  const transport = useRef();
  const fft = useRef();
  const waveform = useRef();
  // const stars = useRef([]);
  // const noise = new SimplexNoise();
  const rows = 100;
  const columns = 100;
  const filters = useRef([]);
  const onBeat = useRef(false);
  const beatCount = useRef(0);
  // const video = useRef();

  const baseUrl = "/assets/audio/";

  const songs = [
    {
      title: "Higher Love",
      bpm: 104,
      artist: { title: "Whitney" },
      url: baseUrl + "higher-love.mp3",
    },
    {
      title: "Express Yourself",
      bpm: 96,
      artist: { title: "N.W.A." },
      url: baseUrl + "express-yourself.m4a",
    },
    {
      title: "La Di Da Di.mp3",
      artist: { title: "Slick Rick" },
      url: baseUrl + "la-di-da-di.mp3",
    },
    {
      title: "Into You",
      bpm: 91,
      artist: { title: "Fabulus" },
      url: baseUrl + "into-you.m4a",
    },
    {
      title: "Mr. Big Stuff",
      bpm: 93,
      artist: { title: "Jean Knight" },
      url: baseUrl + "mr-big-stuff.m4a",
    },
    {
      title: "Pretty Girls",
      bpm: 89,
      artist: { title: "Wale" },
      url: baseUrl + "pretty-girls.m4a",
    },
    {
      title: "MY PYT",
      bpm: 96,
      artist: { title: "Wale" },
      url: baseUrl + "my-pyt.m4a",
    },
    {
      title: "Nyan Cat",
      bpm: 142,
      artist: { title: "Kitty" },
      url: baseUrl + "nyan.m4a",
    },
  ];

  const [song, setSong] = useState(songs[5]);

  const windowSize = useWindowSize();
  useEffect(() => {
    if (renderer.current === undefined) {
      return;
    }
    rect.current = mount.current.getBoundingClientRect();
    const { width, height } = rect.current;
    renderer.current.setSize(width, height);
    camera.current.aspect = width / height;
    camera.current.updateProjectionMatrix();
  }, [windowSize]);

  useEffect(() => {
    const mountPlayer = () => {
      // const beatFilter = new Tone.Filter(300, "lowpass", -96);
      // beatFilter,

      // Create an fft analyser node
      // fft.current = new Tone.Analyser("fft", rows);
      fft.current = new Tone.FFT(32);
      fft.current.normalRange = true;

      // Create a waveform analyser node
      waveform.current = new Tone.Analyser("waveform", 32);

      transport.current = Tone.Transport;
      Tone.Transport.bpm.value = song.bpm;

      Tone.Transport.scheduleRepeat((time) => {
        console.log("beat");
        onBeat.current = true;
        beatCount.current++;
      }, "2n");

      console.log(song);
      buffer.current = new Tone.Buffer(
        song.url,
        (buffer) => {
          const buff = buffer.get();
          // offlineContext.current = new Tone.OfflineContext(1, 0.5, 44100);

          player.current = new Tone.Player(buff);
          player.current.chain(fft.current, waveform.current, Tone.Destination);
          player.current.start();

          Tone.Transport.start("+0");
        },
        (err) => {
          console.log("Buffer Error");
          console.log(err);
        }
      );
    };
    mountPlayer();

    return () => player.current.stop();
  }, []);

  useEffect(() => {
    const mountScene = () => {
      rect.current = mount.current.getBoundingClientRect();

      renderer.current = new THREE.WebGLRenderer({
        powerPreference: "high-performance",
        antialias: true,
        stencil: true,
        depth: true,
        // alpha: false,
      });

      renderer.current.setPixelRatio(window.devicePixelRatio);
      renderer.current.setSize(rect.current.width, rect.current.height);
      mount.current.appendChild(renderer.current.domElement);

      scene.current = new THREE.Scene();
      window.scene = scene.current;
      camera.current = addCamera({ rect: rect.current });
      addLights({ scene: scene.current });
      // addLandMesh({ rows, columns, scene: scene.current, rect: rect.current });
      // addEqualizer({ rows, columns, scene: scene.current, rect: rect.current });

      addWavelengthMesh({
        rows,
        columns,
        scene: scene.current,
        rect: rect.current,
      });

      composer.current = new EffectComposer(renderer.current);

      const renderPass = new RenderPass(scene.current, camera.current);
      composer.current.addPass(renderPass);

      for (var f in filters.current) {
        composer.current.addPass(filters.current[f]);
      }
    };

    mountScene();

    const updateNoiseTime = () => {
      uTime.current += 0.01;
    };

    const animate = () => {
      requestId.current = requestAnimationFrame(animate);

      updateNoiseTime();
      noiseSize.current = updateAudioProps(fft.current);
      let heights = fft.current.getValue();
      let waveformH = waveform.current.getValue();

      const wave = scene.current.getObjectByName("wave");
      wave.material.uniforms.freqs.value = heights;
      wave.material.uniforms.noiseSize.value = noiseSize.current;
      wave.material.uniforms.uTime.value = uTime.current;

      composer.current.render();
    };

    animate();

    return () => {
      renderer.current.dispose();
      cancelAnimationFrame(requestId.current);
    };
  }, []);

  return (
    <React.Fragment>
      <div className="Page-Canvas WavesCanvas" ref={mount}></div>
    </React.Fragment>
  );
}
export default WavesCanvas;
