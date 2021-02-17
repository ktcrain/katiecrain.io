import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import * as Tone from "tone";
import { TweenMax } from "gsap";
import "./Visual2Canvas.scss";
import { updateAudioProps, sumFrequencyData } from "@components/Piano";
import useWindowSize from "@shared/hooks/useWindowSize";
import addCamera from "./helpers/addCamera";
import addLights from "./helpers/addLights";
import addCat from "./helpers/addCat";
import addStars from "./helpers/addStars";
import addLandMesh, {
  createGeometry as createLandGeometry,
} from "./helpers/addLandMesh";
import addEqualizer from "./helpers/addEqualizer";
// import SimplexNoise from "@shared/SimplexNoise";
// import KTUtil from "@utils/KTUtil";
// import MagicLandShaderMaterial from "./shaders/MagicLandShaderMaterial";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
// import { GlitchPass } from "three/examples/jsm/postprocessing/GlitchPass.js";
import { RGBShiftShader } from "three/examples/jsm/shaders/RGBShiftShader.js";
// import { MirrorShader } from "three/examples/jsm/shaders/MirrorShader.js";
import { KaleidoShader } from "three/examples/jsm/shaders/KaleidoShader.js";
// import { HorizontalTiltShiftShader } from "three/examples/jsm/shaders/HorizontalTiltShiftShader.js";
// import { VerticalTiltShiftShader } from "three/examples/jsm/shaders/VerticalTiltShiftShader.js";
// import { HorizontalBlurShader } from "three/examples/jsm/shaders/HorizontalBlurShader.js";
// import { VerticalBlurShader } from "three/examples/jsm/shaders/VerticalBlurShader.js";
// import BadTVShader from "@shared/shaders/BadTVShader";
// import { FilmPass } from "three/examples/jsm/postprocessing/FilmPass.js";

function Visual2Canvas() {
  console.log("RENDER :: MagicCanvas");

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
  const stars = useRef([]);
  // const noise = new SimplexNoise();
  const rows = 100;
  const columns = 100;
  const filters = useRef([]);
  const onBeat = useRef(false);
  const beatCount = useRef(0);
  const video = useRef();

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

  const [song, setSong] = useState(songs[7]);

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
      addLandMesh({ rows, columns, scene: scene.current, rect: rect.current });
      addEqualizer({ rows, columns, scene: scene.current, rect: rect.current });

      video.current = document.getElementById("video");
      video.current.play();

      const texture = new THREE.VideoTexture(video.current);
      console.log(texture);

      addCat({
        rows,
        columns,
        scene: scene.current,
        rect: rect.current,
        texture,
      });

      stars.current = addStars({
        rows,
        columns,
        scene: scene.current,
        rect: rect.current,
      });

      // const plane = scene.current.getObjectByName("plane");

      // balls.current = addBalls({
      //   rows,
      //   columns,
      //   scene: scene.current,
      //   rect: rect.current,
      //   plane,
      // });
      // addEqualizer({ rows, columns, scene: scene.current, rect: rect.current });

      composer.current = new EffectComposer(renderer.current);

      const renderPass = new RenderPass(scene.current, camera.current);
      composer.current.addPass(renderPass);

      // filters.current['glitchPass'] = new GlitchPass();
      filters.current["rGBShiftPass"] = new ShaderPass(RGBShiftShader);
      filters.current["rGBShiftPass"].enabled = false;
      // filters.current['filmPass'] = new FilmPass(0.35,0.025,648,false);
      // filters.current['badTVShader'] = new ShaderPass( BadTVShader );
      filters.current["kaleidoShader"] = new ShaderPass(KaleidoShader);
      filters.current["kaleidoShader"].enabled = false;

      // filters.current['hts'] = new ShaderPass( HorizontalTiltShiftShader );
      // filters.current['vts'] = new ShaderPass( VerticalTiltShiftShader );
      // filters.current['hblur'] = new ShaderPass( HorizontalBlurShader );
      // filters.current['vblur'] = new ShaderPass( VerticalBlurShader );

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

      const plane = scene.current.getObjectByName("plane");
      plane.material.uniforms.noiseSize.value = noiseSize.current;
      plane.material.uniforms.uTime.value = uTime.current;
      plane.material.uniforms.freqs.value = heights;

      const eq = scene.current.getObjectByName("eq");
      eq.material.uniforms.freqs.value = heights;
      eq.material.uniforms.noiseSize.value = noiseSize.current;
      eq.material.uniforms.uTime.value = uTime.current;
      // eq.material.uniforms.uRes.value = { x: rect.width, y: rect.height };

      const cat = scene.current.getObjectByName("cat");
      cat.material.uniforms.noiseSize.value = noiseSize.current;
      cat.material.uniforms.uTime.value = uTime.current;
      // cat.material.needsUpdate = true;
      // camera.current.position.x = Math.sin(-uTime.current) * 100;
      // camera.current.lookAt(plane);

      for (let s = 0; s < stars.current.length; s++) {
        const star = stars.current[s];
        star.position.z += 10;
        if (star.position.z > 500) {
          star.position.z = -4000;
        }
      }
      // stars.material.uniforms.noiseSize.value = noiseSize.current;
      // stars.material.uniforms.uTime.value = uTime.current;

      if (onBeat.current) {
        onBeat.current = false;
        for (let s = 0; s < stars.current.length; s++) {
          const star = stars.current[s];
          star.material.uniforms.scaleX.value = 1.0 + noiseSize.current * 1000;
          star.material.uniforms.scaleY.value = 1.0 + noiseSize.current * 1000;
          star.material.uniforms.scaleZ.value = 1.0 + noiseSize.current * 1000;
        }
      } else {
        for (let s = 0; s < stars.current.length; s++) {
          const star = stars.current[s];
          star.material.uniforms.scaleX.value = 1.0;
          star.material.uniforms.scaleY.value = 1.0;
          star.material.uniforms.scaleZ.value = 1.0;
        }
      }

      // eq.rotation.y += 0.01;

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
      <div className="Page-Canvas Visual2Canvas" ref={mount}></div>
      <video
        id="video"
        loop
        crossOrigin="anonymous"
        playsInline
        autoPlay
        style={
          {
            // display: "none",
          }
        }
        src="https://res.cloudinary.com/dptp8ydoe/video/upload/v1613584596/nyancat_q5kjj2.mp4"
      >
        <source
          src="https://res.cloudinary.com/dptp8ydoe/video/upload/v1613584596/nyancat_q5kjj2.mp4"
          type='video/mp4"'
        />
      </video>
    </React.Fragment>
  );
}
export default Visual2Canvas;
