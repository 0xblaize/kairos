"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Hero centrepiece: a slowly turning wireframe torus knot inside a drifting
 * particle haze. Rotation tracks scroll so the shape unwinds as you read down.
 */
export default function HeroScene({ className = "" }) {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      return; // no WebGL: hero still reads fine without it
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(host.clientWidth, host.clientHeight);
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      52,
      host.clientWidth / host.clientHeight,
      0.1,
      100
    );
    camera.position.z = 15;

    const group = new THREE.Group();
    scene.add(group);

    const knot = new THREE.Mesh(
      new THREE.TorusKnotGeometry(4.1, 0.92, 128, 16, 2, 3),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color("#ffb020"),
        wireframe: true,
        transparent: true,
        opacity: 0.1,
      })
    );
    group.add(knot);

    const inner = new THREE.Mesh(
      new THREE.IcosahedronGeometry(2.15, 1),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color("#ff7a18"),
        wireframe: true,
        transparent: true,
        opacity: 0.2,
      })
    );
    group.add(inner);

    const COUNT = 900;
    const positions = new Float32Array(COUNT * 3);
    const scales = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      const r = 8 + Math.random() * 16;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.62;
      positions[i * 3 + 2] = r * Math.cos(phi);
      scales[i] = Math.random();
    }

    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    dustGeo.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));

    const dustMat = new THREE.ShaderMaterial({
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
          p.y += sin(uTime * 0.22 + position.x * 0.2) * 0.7;
          p.x += cos(uTime * 0.16 + position.z * 0.18) * 0.6;
          vMix = aScale;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = (6.0 + aScale * 20.0) / -mv.z;
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
          float a = smoothstep(0.5, 0.0, d) * (0.16 + vMix * 0.46);
          gl_FragColor = vec4(mix(uWarm, uCool, vMix), a);
        }
      `,
    });

    const dust = new THREE.Points(dustGeo, dustMat);
    scene.add(dust);

    const pointer = { x: 0, y: 0 };
    const onPointer = (e) => {
      pointer.x = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    let scrollN = 0;
    const onScroll = () => {
      scrollN = window.scrollY / Math.max(window.innerHeight, 1);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const onResize = () => {
      if (!host.clientWidth || !host.clientHeight) return;
      camera.aspect = host.clientWidth / host.clientHeight;
      // Narrow viewports crop the knot badly, so pull the camera back to keep it
      // behind the copy rather than tangled in it.
      camera.position.z = host.clientWidth < 700 ? 26 : 15;
      camera.updateProjectionMatrix();
      renderer.setSize(host.clientWidth, host.clientHeight);
    };
    onResize();
    const ro = new ResizeObserver(onResize);
    ro.observe(host);

    const clock = new THREE.Clock();
    let frame;
    const tick = () => {
      frame = requestAnimationFrame(tick);
      if (document.hidden) return;

      const t = clock.getElapsedTime();
      dustMat.uniforms.uTime.value = t;

      group.rotation.y = t * 0.12 + scrollN * 1.5 + pointer.x * 0.22;
      group.rotation.x = Math.sin(t * 0.16) * 0.16 + scrollN * 0.55 + pointer.y * 0.14;
      group.position.y = scrollN * 2.4;
      inner.rotation.y = -t * 0.28;
      inner.rotation.z = t * 0.14;
      dust.rotation.y = t * 0.03;

      renderer.render(scene, camera);
    };

    if (reduced) renderer.render(scene, camera);
    else tick();

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
      knot.geometry.dispose();
      knot.material.dispose();
      inner.geometry.dispose();
      inner.material.dispose();
      dustGeo.dispose();
      dustMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={hostRef} className={className} aria-hidden="true" />;
}
