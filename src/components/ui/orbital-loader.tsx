'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface OrbitalLoaderProps {
  isThinking: boolean;
}

export default function OrbitalLoader({ isThinking }: OrbitalLoaderProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<'idle' | 'thinking'>('idle');
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationRef = useRef<number | null>(null);
  const themeRef = useRef<'light' | 'dark'>('dark');
  const elapsedTimeRef = useRef(0);

  const detectTheme = () => {
    return document.documentElement.className.includes('light') ? 'light' : 'dark';
  };

  useEffect(() => {
    if (!mountRef.current) return;

    if (rendererRef.current) {
      mountRef.current.removeChild(rendererRef.current.domElement);
      rendererRef.current.dispose();
    }
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
    }

    const scene = new THREE.Scene();
    scene.background = null;
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    // Aumentar a distância da câmera para capturar todo o raio da órbita
    camera.position.z = 50;

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true 
    });
    rendererRef.current = renderer;

    const width = 160;
    const height = 160;
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);

    mountRef.current.innerHTML = '';

    const canvas = renderer.domElement;
    canvas.style.position = 'absolute';
    canvas.style.zIndex = '1';
    canvas.style.width = '160px';
    canvas.style.height = '160px';
    canvas.style.top = '0';
    canvas.style.left = '0';

    mountRef.current.appendChild(canvas);

    const points: THREE.Mesh[] = [];
    // Reduzir o raio base para garantir que mesmo ao pulsar, a órbita não ultrapasse os limites
    const baseOrbitRadius = 18;
    const numPoints = 480;

    const pointsGroup = new THREE.Group();
    scene.add(pointsGroup);

    for (let i = 0; i < numPoints; i++) {
      const geometry = new THREE.SphereGeometry(0.35, 8, 8);
      const material = new THREE.MeshStandardMaterial({ 
        color: 0xffffff, 
        emissive: 0x0066ff, 
        emissiveIntensity: 1.5 
      });
      const point = new THREE.Mesh(geometry, material);

      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);

      point.userData = { theta, phi, speed: (Math.random() * 0.005) + 0.001 };

      point.position.set(
        baseOrbitRadius * Math.sin(phi) * Math.cos(theta),
        baseOrbitRadius * Math.sin(phi) * Math.sin(theta),
        baseOrbitRadius * Math.cos(phi)
      );

      points.push(point);
      pointsGroup.add(point);
    }

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1.5);
    pointLight.position.set(50, 50, 50);
    scene.add(pointLight);

    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);

      const state = stateRef.current;
      elapsedTimeRef.current += 0.05;

      let dynamicOrbitRadius = baseOrbitRadius;
      // Ajustar a forma como a pulsação funciona para garantir que fique dentro dos limites
      if (state === 'thinking') {
        const pulse = Math.pow(Math.abs(Math.sin(elapsedTimeRef.current * 1)), 3);
        // Reduzir a amplitude máxima da pulsação
        dynamicOrbitRadius = baseOrbitRadius + pulse * 2.5;
      }

      points.forEach(point => {
        const { phi, speed } = point.userData;
        point.userData.theta += speed;

        point.position.set(
          dynamicOrbitRadius * Math.sin(phi) * Math.cos(point.userData.theta),
          dynamicOrbitRadius * Math.sin(phi) * Math.sin(point.userData.theta),
          dynamicOrbitRadius * Math.cos(phi)
        );
      });

      pointsGroup.rotation.y += 0.001;
      pointsGroup.rotation.x += 0.0005;

      points.forEach(p => {
        const material = p.material as THREE.MeshStandardMaterial;

        if (!p.userData.colorSet) {
          // Usar as mesmas cores do tema light para ambos os temas
          material.emissive.set(0x0044aa);
          material.color.set(0x0033aa);
          p.userData.colorSet = true;
        }

        material.emissiveIntensity = 5;
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
      if (rendererRef.current && mountRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
        rendererRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    stateRef.current = isThinking ? 'thinking' : 'idle';
    themeRef.current = detectTheme();
  }, [isThinking]);

  useEffect(() => {
    const handleThemeChange = () => {
      themeRef.current = detectTheme();
    };

    window.addEventListener('storage', handleThemeChange);
    themeRef.current = detectTheme();

    return () => {
      window.removeEventListener('storage', handleThemeChange);
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      style={{ 
        width: '160px', 
        height: '160px', 
        position: 'relative',
        overflow: 'visible', // Garantir que os elementos fora dos limites ainda sejam visíveis
        display: 'inline-block',
        margin: '0',
        padding: '0'
      }} 
    />
  );
}
