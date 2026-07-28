"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Ambient particle field behind the viewfinder. Drifts slowly and leans toward
 * the pointer; goes still when the tab is hidden or motion is reduced.
 */
export default function AmbientField({ className = "" }) {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(host.clientWidth, host.clientHeight);
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      host.clientWidth / host.clientHeight,
      0.1,
      100
    );
    camera.position.z = 14;

    const COUNT = 620;
    const positions = new Float32Array(COUNT * 3);
    const scales = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 34;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 22;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 18;
      scales[i] = Math.random();
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uWarm: { value: new THREE.Color("#ffb020") },
        uCool: { value: new THREE.Color("#3ecf8e") },
      },
      vertexShader: `
        uniform float uTime;
        attribute float aScale;
        varying float vMix;
        void main() {
          vec3 p = position;
          p.y += sin(uTime * 0.25 + position.x * 0.28) * 0.55;
          p.x += cos(uTime * 0.18 + position.y * 0.22) * 0.45;
          vMix = aScale;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = (7.0 + aScale * 22.0) / -mv.z;
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        uniform vec3 uWarm;
        uniform vec3 uCool;
        varying float vMix;
        void main() {
          float d = distance(gl_PointCoord, vec2(0.5));
          if (d > 0.5) discard;
          float a = smoothstep(0.5, 0.0, d) * (0.18 + vMix * 0.5);
          gl_FragColor = vec4(mix(uWarm, uCool, vMix), a);
        }
      `,
    });

    const points = new THREE.Points(geo, material);
    scene.add(points);

    const pointer = { x: 0, y: 0 };
    const onPointer = (e) => {
      pointer.x = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    const onResize = () => {
      if (!host.clientWidth || !host.clientHeight) return;
      camera.aspect = host.clientWidth / host.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(host.clientWidth, host.clientHeight);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(host);

    const clock = new THREE.Clock();
    let frame;
    const tick = () => {
      frame = requestAnimationFrame(tick);
      if (document.hidden) return;
      const t = clock.getElapsedTime();
      material.uniforms.uTime.value = t;
      points.rotation.y = t * 0.035 + pointer.x * 0.16;
      points.rotation.x = pointer.y * 0.1;
      renderer.render(scene, camera);
    };

    if (reduced) {
      renderer.render(scene, camera);
    } else {
      tick();
    }

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      window.removeEventListener("pointermove", onPointer);
      geo.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={hostRef} className={className} aria-hidden="true" />;
}
