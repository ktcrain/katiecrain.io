import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import useWindowSize from "@shared/hooks/useWindowSize";
import addCamera from "./helpers/addCamera";
import addLights from "./helpers/addLights";
import AboutShaderMaterial from "./shaders/AboutShaderMaterial";
import "./AboutCanvas.scss";

function AboutCanvas() {
  const mount = useRef();
  const scene = useRef();
  const renderer = useRef();
  const camera = useRef();
  const rect = useRef();
  const raycaster = useRef();
  let uTime = useRef(1000.0);
  let noiseSize = useRef(0.0);
  let requestId = useRef();

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

    const geoDim = new THREE.Vector3(width, height, 1);

    const mesh = scene.current.getObjectByName("aboutMesh");
    mesh.geometry = new THREE.PlaneGeometry(geoDim.x, 1000, 100, 100);
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

      renderer.current.setClearColor(0x000000);
      renderer.current.setPixelRatio(window.devicePixelRatio);
      renderer.current.setSize(rect.current.width, rect.current.height);
      mount.current.appendChild(renderer.current.domElement);

      scene.current = new THREE.Scene();

      camera.current = addCamera({ rect: rect.current });
      addLights({ scene: scene.current });

      const geoDim = new THREE.Vector3(rect.width, rect.height, 1);

      /**
       * Hero Background Scene
       */
      // The geometry to be animated
      const aboutGeometry = new THREE.PlaneGeometry(geoDim.x, 1000, 100, 100);

      const aboutMaterial = new THREE.ShaderMaterial({
        uniforms: AboutShaderMaterial.uniforms,
        vertexShader: AboutShaderMaterial.vertexShader,
        fragmentShader: AboutShaderMaterial.fragmentShader,
        depthTest: true,
        side: THREE.DoubleSide,
        // blending: THREE.AdditiveBlending,
        transparent: true,
        wireframe: true,
        lights: false,
        fog: false,
      });

      const aboutMesh = new THREE.Mesh(aboutGeometry, aboutMaterial);

      aboutMesh.name = "aboutMesh";
      // aboutMesh.position.z = geoDim.x / 4;
      aboutMesh.position.z = 0;
      aboutMesh.position.y = -200;
      aboutMesh.rotation.z = Math.PI / 2;
      aboutMesh.rotation.x = Math.PI / 2;
      aboutMesh.rotation.y = Math.PI / 2;

      scene.current.add(aboutMesh);

      /**
       * Raycasting
       */
      raycaster.current = new THREE.Raycaster();
    };

    mountScene();

    const updateNoiseTime = () => {
      uTime.current += 1.0;
    };

    const animate = () => {
      requestId.current = requestAnimationFrame(animate);

      updateNoiseTime();

      // BACKGROUND
      const aboutMesh = scene.current.getObjectByName("aboutMesh");

      aboutMesh.material.uniforms.noiseSize.value = noiseSize.current;

      // pass the current uTime to the shader
      aboutMesh.material.uniforms.uTime.value = uTime.current;

      aboutMesh.rotation.z += 0.001;
      aboutMesh.rotation.x += 0.001;
      aboutMesh.rotation.y += 0.001;

      renderer.current.render(scene.current, camera.current);
    };

    animate();

    return () => {
      renderer.current.dispose();
      // scene.current.dispose();
      cancelAnimationFrame(requestId.current);
    };
  }, []);

  return <div className="Page-Canvas About-Canvas" ref={mount}></div>;
}
export default AboutCanvas;
