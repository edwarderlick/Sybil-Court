"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function IsometricHero() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    host.appendChild(renderer.domElement);

    const accentColor = 0x6750a4;
    const group = new THREE.Group();
    scene.add(group);

    const slab = new THREE.Mesh(
      new THREE.BoxGeometry(4, 0.4, 4),
      new THREE.MeshPhongMaterial({ color: 0x1d1b20, shininess: 100 }),
    );
    group.add(slab);

    const boxGeom = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const boxMat = new THREE.MeshPhongMaterial({ color: accentColor });
    for (let i = 0; i < 4; i += 1) {
      const box = new THREE.Mesh(boxGeom, boxMat);
      box.position.set((i % 2 === 0 ? 1 : -1) * 1.2, 0.8, (i < 2 ? 1 : -1) * 1.2);
      group.add(box);
    }

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.5, 0.05, 16, 100),
      new THREE.MeshBasicMaterial({
        color: accentColor,
        transparent: true,
        opacity: 0.5,
      }),
    );
    ring.rotation.x = Math.PI / 2;
    group.add(ring);

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    camera.position.set(6, 6, 6);
    camera.lookAt(0, 0, 0);

    let frame = 0;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const resize = () => {
      const width = host.clientWidth || 640;
      const height = host.clientHeight || 400;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();

    const animate = (t: number) => {
      if (!reduceMotion) {
        group.rotation.y = t * 0.0005;
        group.position.y = Math.sin(t * 0.002) * 0.2;
      }
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      renderer.dispose();
      host.removeChild(renderer.domElement);
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          const material = obj.material;
          if (Array.isArray(material)) material.forEach((item) => item.dispose());
          else material.dispose();
        }
      });
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className="relative h-[400px] lg:h-[600px] w-full"
      aria-hidden
    />
  );
}
