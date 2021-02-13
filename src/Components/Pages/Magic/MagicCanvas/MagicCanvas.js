import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import * as Tone from "tone";
import { TweenMax } from "gsap";
import "./MagicCanvas.scss";
import { updateAudioProps, sumFrequencyData } from "@components/Piano";
import useWindowSize from "@shared/hooks/useWindowSize";
import addCamera from "./helpers/addCamera";
import addLights from "./helpers/addLights";
// import addBalls from "./helpers/addBalls";
import addLandMesh, {
  createGeometry as createLandGeometry,
} from "./helpers/addLandMesh";
// import addLines from "./helpers/addLines";
import SimplexNoise from "@shared/SimplexNoise";
import KTUtil from "@utils/KTUtil";
import MagicLandShaderMaterial from "./shaders/MagicLandShaderMaterial";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass.js';
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader.js';
import { MirrorShader } from 'three/examples/jsm/shaders/MirrorShader.js';
import { KaleidoShader } from 'three/examples/jsm/shaders/KaleidoShader.js';
import { HorizontalTiltShiftShader } from 'three/examples/jsm/shaders/HorizontalTiltShiftShader.js';
import { VerticalTiltShiftShader } from 'three/examples/jsm/shaders/VerticalTiltShiftShader.js';
import { HorizontalBlurShader } from 'three/examples/jsm/shaders/HorizontalBlurShader.js';
import { VerticalBlurShader } from 'three/examples/jsm/shaders/VerticalBlurShader.js';


function MagicCanvas() {

  console.log('RENDER :: MagicCanvas');

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
  const fft = useRef();
  const waveform = useRef();
  const lines = useRef([]);
  const noise = new SimplexNoise();
  const rows = 100;
  const columns = 100;
  const filters = useRef([]);
  const onBeat = useRef(false);

  const notes = [
    "C3",
    "C3",
    "E3",
    "E3",
    "A2",
    "A2",
    "C3",
    "C3",
    "D3",
    "D3",
    "F3",
    "F3",
    "B2",
    "B2",
    "D3",
    "D3",
  ];

  const noteIndex = useRef(0);

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
   /**
    * Mount Player
    * 
    * Setup the Tone.js Integration,
    * and everything required:
    * buffered audio, audio analysis,
    * incudling fft and beat detection.
    * 
    * All `onPlayerDidMount` events should be bound here.
    * [TODO] unmountPlayer
    */
    const mountPlayer = () => {

      // const baseUrl = 'https://all-the-music.s3.amazonaws.com';
      const baseUrl = 'http://localhost:3000/assets/audio';

      const songs = [
        {title: 'Higher Love', artist: { title: 'Whitney'} , uri: 'higher-love.mp3'},
        {title: 'Express Yourself', artist: { title: 'N.W.A.'} , uri: 'express-yourself.m4a'},
        {title: 'La Di Da Di.mp3', artist: { title: 'Slick Rick'} , uri: 'la-di-da-di.mp3'},
        {title: 'A Little Mozart', artist: { title: 'Mozart'} , uri: 'a-little-mozart.mp3'},
        {title: 'Into You', artist: { title: 'Mozart'} , uri: 'into-you.m4a'},
        {title: 'Mr. Big Stuff', artist: { title: 'Jean Knight'} , uri: 'mr-big-stuff.m4a'},
        {title: 'Pretty Girls', artist: { title: 'Wale'} , uri: 'pretty-girls.m4a'},
        {title: 'MY PYT', artist: { title: 'Wale'} , uri: 'my-pyt.m4a'},
      ];

      // [TODO]? Find song dynamically (currently via config by uri)
      const song = songs[7];
      const url = baseUrl + '/' + song.uri;

      console.log(`Loading Song: ${url}`);

      player.current = new Tone.Player({url, autostart: true}).toDestination();

      /*
      * START BEAT DETECTION
      */

      const beatFilter = new Tone.Filter(100, "lowpass", -96);

      // Create an fft analyser node
      // fft.current = new Tone.Analyser("fft", rows);
      fft.current = new Tone.FFT(32);

      // Create a waveform analyser node
      waveform.current = new Tone.Analyser("waveform", 32);

      // Create a new list of amplitudes filled with 0s
      fft.current.amplitudes = new Array(fft.current).fill(0);
      fft.current.normalRange = true;

      player.current.chain(beatFilter, fft.current, waveform.current, Tone.Destination);
    }
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
      // lines.current = addLines({ rows, columns, scene: scene.current, rect: rect.current });

      composer.current = new EffectComposer(renderer.current);

      const renderPass = new RenderPass( scene.current, camera.current );
      composer.current.addPass( renderPass );

      // filters.current['glitchPass'] = new GlitchPass();
      filters.current['rGBShiftPass'] = new ShaderPass( RGBShiftShader );
      // filters.current['mirrorShader'] = new ShaderPass( MirrorShader );
      filters.current['kaleidoShader'] = new ShaderPass( KaleidoShader );
      filters.current['kaleidoShader'].enabled = false;
      
      // filters.current['hts'] = new ShaderPass( HorizontalTiltShiftShader );
      // filters.current['vts'] = new ShaderPass( VerticalTiltShiftShader );
      // filters.current['hblur'] = new ShaderPass( HorizontalBlurShader );
      // filters.current['vblur'] = new ShaderPass( VerticalBlurShader );

      for(var f in filters.current) {
        composer.current.addPass( filters.current[f] );
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
      // noiseSize.current = Math.sin(uTime) * 1000;
      let heights = fft.current.getValue();

      // for(let h = 0;h<heights.length;h++) {
      //   heights[h] = KTUtil.map(h,0.01,1,0,100)
      // }

      const plane = scene.current.getObjectByName("plane");

      if(noiseSize.current > 0.002) {        
        TweenMax.to(plane.rotation, 0.3, { z: plane.rotation.z + noiseSize.current * 50 });
        filters.current['kaleidoShader'].enabled = !filters.current['kaleidoShader'].enabled;
        filters.current['kaleidoShader'].uniforms.sides.value = 1.0 * Math.floor(KTUtil.randomRange(1, 6));
        TweenMax.to(plane.material.uniforms.lineSize, 0.5, { value: 0.1 * Math.floor(KTUtil.randomRange(1, 6)) });
        TweenMax.to(plane.material.uniforms.dotSize, 0.5, { value: 0.1 * Math.floor(KTUtil.randomRange(1, 6)) });
      }

			// plane.material.uniforms.noiseSize.value = KTUtil.lerp(noise.noise(uTime.current/4,40)/2 +.5,0,7);
			plane.material.uniforms.noiseSize.value = noiseSize.current;
      plane.material.uniforms.depth.value += KTUtil.lerp(noise.noise(uTime.current/4,40)/2 +.5,0,0.1);
      plane.material.uniforms.uTime.value = uTime.current;
      plane.material.uniforms.uRes.value = {x: rect.width, y: rect.height};

      filters.current['rGBShiftPass'].uniforms.angle.value = noiseSize.current * 10;
      // filters.current['rGBShiftPass'].uniforms.amount.value = noiseSize.current;

      plane.rotation.z += 0.001;

      composer.current.render();
    };

    animate();

    return () => {
      renderer.current.dispose();
      cancelAnimationFrame(requestId.current);
    };
  }, []);

  return <div className="Page-Canvas MagicCanvas" ref={mount}></div>;
}
export default MagicCanvas;
