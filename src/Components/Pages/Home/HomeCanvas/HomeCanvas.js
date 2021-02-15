import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import "./HomeCanvas.scss";
import { usePianoContext, updateAudioProps } from "@components/Piano";
import useWindowSize from "@shared/hooks/useWindowSize";
import addCamera from "./helpers/addCamera";
import addLights from "./helpers/addLights";
import { TweenMax } from "gsap";
import addSphereMesh, {
  createGeometry as createSphereGeometry,
} from "./helpers/addSphereMesh";

function HomeCanvas() {
  const mount = useRef();
  const { waveform } = usePianoContext();
  const scene = useRef();
  const renderer = useRef();
  const camera = useRef();
  const rect = useRef();
  let uTime = useRef(1000.0);
  let noiseSize = useRef(0.0);
  let requestId = useRef();

  const doSomething = () => {
    const sphereMesh = scene.current.getObjectByName("sphere");
    TweenMax.to(sphereMesh.position, 3, { z: -rect.current.width / 2 });

    TweenMax.to(".Piano-Container", {
      opacity: 1,
      bottom: "20%",
      duration: 1,
      delay: 1,
    }); //wait 2 seconds
  };

  useEffect(() => {
    window.addEventListener("DO_SOMETHING", doSomething);
    return () => window.removeEventListener("DO_SOMETHING", doSomething);
  });

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

    const mesh = scene.current.getObjectByName("sphere");
    mesh.geometry = createSphereGeometry({ rect: rect.current });
  }, [windowSize]);

  useEffect(() => {
    const mountScene = () => {
      rect.current = mount.current.getBoundingClientRect();

      renderer.current = new THREE.WebGLRenderer({
        powerPreference: "high-performance",
        antialias: true,
        stencil: false,
        depth: false,
        alpha: true,
      });

      renderer.current.setPixelRatio(window.devicePixelRatio);
      renderer.current.setSize(rect.current.width, rect.current.height);
      mount.current.appendChild(renderer.current.domElement);

      scene.current = new THREE.Scene();
      camera.current = addCamera({ rect: rect.current });
      addLights({ scene: scene.current });

      addSphereMesh({ scene: scene.current, rect: rect.current });
    };

    mountScene();

    const updateNoiseTime = () => {
      uTime.current += 1.0;
    };

    const animate = () => {
      requestId.current = requestAnimationFrame(animate);

      updateNoiseTime();
      noiseSize.current = updateAudioProps(waveform);

      const freqs = waveform.getValue();
      // console.log(freqs);
      // sphereMesh
      const sphereMesh = scene.current.getObjectByName("sphere");
      sphereMesh.material.uniforms.noiseSize.value = noiseSize.current;
      sphereMesh.material.uniforms.uTime.value = uTime.current;

      renderer.current.render(scene.current, camera.current);
    };

    animate();

    return () => {
      renderer.current.dispose();
      cancelAnimationFrame(requestId.current);
    };
  }, [waveform]);

  return <div className="Page-Canvas HomeCanvas" ref={mount}></div>;
}
export default HomeCanvas;
