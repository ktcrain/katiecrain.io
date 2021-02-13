import * as THREE from "three";
import EffectShell from "./EffectShell";
import { TweenLite, Power4 } from "gsap";
require("@utils/math.js");

class NoEffect extends EffectShell {
  constructor(container = document.body, itemsWrapper = null, options = {}) {
    super(container, itemsWrapper);
    if (!this.container || !this.itemsWrapper) return;

    options.strength = options.strength || 0.25;
    this.options = options;

    this.init();
  }

  init() {
    this.position = new THREE.Vector3(0, 0, 0);
    this.scale = new THREE.Vector3(1, 1, 1);
    this.geometry = new THREE.PlaneBufferGeometry(1, 1, 32, 32);
    this.uniforms = {
      uTexture: {
        value: null,
      },
      uOffset: {
        value: new THREE.Vector2(0.0, 0.0),
      },
      uAlpha: {
        value: 1,
      },
    };
    this.material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: `
        varying vec2 vUv;
        void main() {
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }
      `,
      fragmentShader: `
        uniform sampler2D uTexture;
        varying vec2 vUv;

        void main() {
          vec3 color = texture2D(uTexture,vUv).rgb;
          gl_FragColor = vec4(color,1.0);
        }
      `,
      transparent: true,
    });
    this.plane = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.plane);
  }

  onMouseEnter() {}

  onMouseLeave(event) {}

  onMouseMove(event) {}

  onPositionUpdate() {}

  onMouseOver(index, e) {}

  onTargetChange(index) {}
}

export default NoEffect;
