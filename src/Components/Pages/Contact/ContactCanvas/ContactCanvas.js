import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import "./ContactCanvas.scss";
import useWindowSize from "@shared/hooks/useWindowSize";
import addCamera from "./helpers/addCamera";
import addLandscapeMesh, {
  createGeometry as createLandGeometry,
} from "./helpers/addLandscapeMesh";
import addBackgroundMesh, {
  createGeometry as createBackGeometry,
} from "./helpers/addBackgroundMesh";
import { usePianoContext, updateAudioProps } from "@components/Piano";
// import * as Mousetrap from "mousetrap";

function ContactCanvas() {
  const mount = useRef();
  const scene = useRef();
  const renderer = useRef();
  const camera = useRef();
  const rect = useRef();
  let uTime = useRef(1000.0);
  let requestId = useRef();
  const { waveform, synth } = usePianoContext();
  let noiseSize = useRef(0.0);
  const windowSize = useWindowSize();

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

  const handleTone = ({ note }) => {
    console.log(note);
    synth.triggerAttackRelease(note, "32n");
  };

  const handleKeydown = () => {
    console.log("handleKey");
    const note = notes[noteIndex.current];
    handleTone({ note });
    noteIndex.current++;
    if (noteIndex.current >= notes.length) {
      noteIndex.current = 0;
    }
  };

  useEffect(() => {
    if (renderer.current === undefined) {
      return;
    }
    rect.current = mount.current.getBoundingClientRect();
    const { width, height } = rect.current;
    renderer.current.setSize(width, height);
    camera.current.aspect = width / height;
    camera.current.updateProjectionMatrix();

    const landMesh = scene.current.getObjectByName("land");
    landMesh.geometry = createLandGeometry({ rect: rect.current });

    const backMesh = scene.current.getObjectByName("back");
    backMesh.geometry = createBackGeometry({ rect: rect.current });
  }, [windowSize]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
  });

  useEffect(() => {
    const mountScene = () => {
      rect.current = mount.current.getBoundingClientRect();

      renderer.current = new THREE.WebGLRenderer({
        powerPreference: "high-performance",
        antialias: true,
        stencil: false,
        depth: true,
        alpha: true,
        pixelRatio: window.devicePixelRatio,
      });

      renderer.current.setSize(rect.current.width, rect.current.height);
      mount.current.appendChild(renderer.current.domElement);

      scene.current = new THREE.Scene();
      camera.current = addCamera({ rect: rect.current });

      const fogColor = new THREE.Color(0x000000);
      scene.current.fog = new THREE.Fog(fogColor, 200, 800);

      addBackgroundMesh({ scene: scene.current, rect: rect.current });
      addLandscapeMesh({ scene: scene.current, rect: rect.current });
    };

    mountScene();

    const updateNoiseTime = () => {
      uTime.current += 1.0;
    };

    const animate = () => {
      requestId.current = requestAnimationFrame(animate);
      updateNoiseTime();
      noiseSize.current = updateAudioProps(waveform);

      // background
      const backMesh = scene.current.getObjectByName("back");
      backMesh.material.uniforms.uTime.value = uTime.current;

      // landscape
      const landMesh = scene.current.getObjectByName("land");
      landMesh.material.uniforms.uTime.value = uTime.current;

      renderer.current.render(scene.current, camera.current);
    };

    animate();

    return () => {
      renderer.current.dispose();
      cancelAnimationFrame(requestId.current);
    };
  }, [waveform]);

  return <div className="Page-Canvas Contact-Canvas" ref={mount}></div>;
}
export default ContactCanvas;
