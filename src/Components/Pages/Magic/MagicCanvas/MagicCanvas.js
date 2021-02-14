import React, { useEffect, useRef, useState } from "react";
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
import BadTVShader from '@shared/shaders/BadTVShader';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js';

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
  const buffer = useRef();
  const offlineContext = useRef();
  const transport = useRef();
  const fft = useRef();
  const waveform = useRef();
  const lines = useRef([]);
  const noise = new SimplexNoise();
  const rows = 100;
  const columns = 100;
  const filters = useRef([]);
  const onBeat = useRef(false);
  const beatCount = useRef(0);


  const baseUrl = 'http://localhost:3000/assets/audio/';

  const songs = [
    {title: 'Higher Love', artist: { title: 'Whitney'} , url: baseUrl + 'higher-love.mp3'},
    {title: 'Express Yourself', artist: { title: 'N.W.A.'} , url: baseUrl + 'express-yourself.m4a'},
    {title: 'La Di Da Di.mp3', artist: { title: 'Slick Rick'} , url: baseUrl + 'la-di-da-di.mp3'},
    {title: 'A Little Mozart', artist: { title: 'Mozart'} , url: baseUrl + 'a-little-mozart.mp3'},
    {title: 'Into You', artist: { title: 'Mozart'} , url: baseUrl + 'into-you.m4a'},
    {title: 'Mr. Big Stuff', bpm: 93, artist: { title: 'Jean Knight'} , url: baseUrl + 'mr-big-stuff.m4a'},
    {title: 'Pretty Girls', artist: { title: 'Wale'} , url: baseUrl + 'pretty-girls.m4a'},
    {title: 'MY PYT', artist: { title: 'Wale'} , url: baseUrl + 'my-pyt.m4a'},
  ];

  const [song, setSong] = useState(songs[5]);

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

      // console.log(`Loading Song: ${url}`);

      const beatFilter = new Tone.Filter(300, "lowpass", -96);
      // beatFilter, 

      // Create an fft analyser node
      // fft.current = new Tone.Analyser("fft", rows);
      fft.current = new Tone.FFT(32);

      // Create a waveform analyser node
      waveform.current = new Tone.Analyser("waveform", 32);

      // Create a new list of amplitudes filled with 0s
      // fft.current.amplitudes = new Array(fft.current).fill(0);
      fft.current.normalRange = true;

      transport.current = Tone.Transport;
      Tone.Transport.bpm.value = 93;

      Tone.Transport.scheduleRepeat(time => {
        console.log('beat');
        onBeat.current = true;
        beatCount.current++;
      }, "2n");

      console.log(song);
      buffer.current = new Tone.Buffer(song.url, (buffer) => {
        const buff = buffer.get();
        console.log("Buffer loaded");
        console.log(buffer);
        offlineContext.current = new Tone.OfflineContext(1, 0.5, 44100);

        player.current = new Tone.Player(buff);
        player.current.chain(fft.current, waveform.current, Tone.Destination);
        player.current.start();

        Tone.Transport.start("+0");

      }, (err) => {
        console.log("Buffer Error");
        console.log(err);
      });
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
      filters.current['rGBShiftPass'].enabled = false;
      // filters.current['filmPass'] = new FilmPass(0.35,0.025,648,false);
      // filters.current['badTVShader'] = new ShaderPass( BadTVShader );
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
      let heights = fft.current.getValue();

      // console.log(heights);

      const plane = scene.current.getObjectByName("plane");

      if(onBeat.current) {        
        onBeat.current = false;

        // const scale = 0.1 * KTUtil.randomInt(5,10);        
        // // plane.scale.set(scale, scale, scale);
        // TweenMax.to(plane.scale, 0.3, { x: scale, y: scale, z: scale});

        plane.material.uniforms.lineCount.value = KTUtil.randomInt(10,30);
        plane.material.uniforms.lineSize.value = (30 - plane.material.uniforms.lineCount.value)/30;

        if(beatCount.current % 8 === 0) {
          plane.material.uniforms.spiral.value = !plane.material.uniforms.spiral.value;
        }
        plane.material.uniforms.spiral.value = false;

        TweenMax.to(plane.rotation, 0.3, { z: plane.rotation.z + noiseSize.current * 1000/2 });

        filters.current['rGBShiftPass'].uniforms.angle.value = noiseSize.current * 3;
        filters.current['rGBShiftPass'].uniforms.amount.value = noiseSize.current;

        if(beatCount.current % 4 === 0) {
          filters.current['kaleidoShader'].enabled = !filters.current['kaleidoShader'].enabled;
          filters.current['kaleidoShader'].uniforms.sides.value = 1.0 * Math.floor(KTUtil.randomRange(1, 6));
        }
        // filters.current['kaleidoShader'].enabled = false;

      }

			// plane.material.uniforms.noiseSize.value = KTUtil.lerp(noise.noise(uTime.current/4,40)/2 +.5,0,7);
      plane.material.uniforms.freqs.value = heights;
			plane.material.uniforms.noiseSize.value = noiseSize.current;
      plane.material.uniforms.depth.value += KTUtil.lerp(noise.noise(uTime.current/4,40)/2 +.5,0,0.1);
      plane.material.uniforms.uTime.value = uTime.current;
      plane.material.uniforms.uRes.value = {x: rect.width, y: rect.height};

      // plane.rotation.z += 0.001;

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
