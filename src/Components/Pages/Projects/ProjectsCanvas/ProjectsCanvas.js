import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import "./ProjectsCanvas.scss";
import useWindowSize from "@shared/hooks/useWindowSize";
import addCamera from "./helpers/addCamera";
import FigureImage from "./shared/FigureImage";
import FigureNumber from "./shared/FigureNumber";
// import FigureTitle from "./shared/FigureTitle";

function ProjectsCanvas() {
  const mount = useRef();
  const scene = useRef();
  const renderer = useRef();
  const camera = useRef();
  const rect = useRef();
  let uTime = useRef(1000.0);
  const figures = useRef([]);
  const windowSize = useWindowSize();
  let requestId = useRef();

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
    const mountScene = () => {
      rect.current = mount.current.getBoundingClientRect();

      renderer.current = new THREE.WebGLRenderer({
        powerPreference: "high-performance",
        antialias: true,
        stencil: false,
        depth: false,
        alpha: true,
        pixelRatio: window.devicePixelRatio,
      });

      renderer.current.setSize(rect.current.width, rect.current.height);
      mount.current.appendChild(renderer.current.domElement);
      scene.current = new THREE.Scene();
      camera.current = addCamera({ rect: rect.current });

      const numberTexts = document.getElementsByClassName("cell__number");
      for (let nt of numberTexts) {
        const fig = new FigureNumber(scene.current, nt);
        figures.current.push(fig);
      }

      const imgs = document.getElementsByClassName("cell__img");
      for (let img of imgs) {
        const fig = new FigureImage(scene.current, img);
        figures.current.push(fig);
      }
    };

    mountScene();

    const updateNoiseTime = () => {
      uTime.current += 1.0;
    };

    const animate = () => {
      requestId.current = requestAnimationFrame(animate);
      updateNoiseTime();

      figures.current.forEach((fig) => {
        fig.onMove();
      });

      renderer.current.render(scene.current, camera.current);
    };

    animate();

    return () => {
      renderer.current.dispose();
      // scene.current.dispose();
      cancelAnimationFrame(requestId.current);
    };
  }, []);

  return <div className="ProjectsCanvas" ref={mount}></div>;
}
export default ProjectsCanvas;
