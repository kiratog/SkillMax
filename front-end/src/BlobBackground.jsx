import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function AmberBlobBackground({
  className = '',
  children,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.z = 6.5;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'low-power', // Optimized for battery and low CPU usage
    });

    const updateSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      // Cap DPR to 1.0 to guarantee ultra-fast 60 FPS performance without heating device
      const dpr = Math.min(window.devicePixelRatio || 1, 1.0);
      renderer.setSize(width, height);
      renderer.setPixelRatio(dpr);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    updateSize();

    // 2. Low-Poly Triangular Icosphere (Static GPU Geometry)
    const radius = 2.2;
    const detail = 2; // Crisp geometric triangular facets
    const baseGeo = new THREE.IcosahedronGeometry(radius, detail);

    // Dark Amber Metallic Flat-Shaded Material
    const meshMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e1004,       // Deep amber dark metallic base
      emissive: 0x3d1702,    // Ambient warm core glow
      roughness: 0.35,
      metalness: 0.8,
      flatShading: true,     // Crisp triangular facets
    });

    const icosphereMesh = new THREE.Mesh(baseGeo, meshMaterial);
    scene.add(icosphereMesh);

    // 3. Glowing Amber Wireframe Grid
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,        // Tailwind Amber-500
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const wireframeMesh = new THREE.Mesh(baseGeo, wireframeMat);
    icosphereMesh.add(wireframeMesh);

    // 4. Lightweight Floating Particle Field
    const particleCount = 45;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const r = 3.0 + Math.random() * 4.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      particlePositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = r * Math.cos(phi);
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0xfbbf24, // Amber-400
      size: 0.05,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });

    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // 5. Dynamic Lighting Setup
    const ambientLight = new THREE.AmbientLight(0x2d1203, 2.0);
    scene.add(ambientLight);

    const keyLight = new THREE.PointLight(0xf59e0b, 14, 15);
    keyLight.position.set(4, 5, 5);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0xd97706, 10, 15);
    rimLight.position.set(-5, -4, -3);
    scene.add(rimLight);

    const mouseLight = new THREE.PointLight(0xfbbf24, 20, 14);
    mouseLight.position.set(0, 0, 4);
    scene.add(mouseLight);

    // 6. Interactive Pointer Tracking
    const mouse = { x: 0, y: 0 };
    const targetMouse = { x: 0, y: 0 };

    const handlePointerMove = (e) => {
      targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      targetMouse.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', handlePointerMove);

    const handleResize = () => {
      updateSize();
    };
    window.addEventListener('resize', handleResize);

    // 7. Ultra-Fast Render Loop (Zero CPU vertex recalculations!)
    let animId;
    const clock = new THREE.Clock();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const animate = () => {
      if (!reduceMotion) {
        const elapsedTime = clock.getElapsedTime();

        // Smooth mouse lerp
        mouse.x += (targetMouse.x - mouse.x) * 0.05;
        mouse.y += (targetMouse.y - mouse.y) * 0.05;

        // Move cursor light
        mouseLight.position.x = mouse.x * 5.5;
        mouseLight.position.y = mouse.y * 5.5;
        mouseLight.position.z = 4;

        // GPU-accelerated rotation (silky smooth 60 FPS)
        icosphereMesh.rotation.y = elapsedTime * 0.2 + mouse.x * 0.6;
        icosphereMesh.rotation.x = elapsedTime * 0.12 + mouse.y * 0.4;

        // Particle field slow counter-rotation
        particleSystem.rotation.y = -elapsedTime * 0.05;

        renderer.render(scene, camera);
      }
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      baseGeo.dispose();
      meshMaterial.dispose();
      wireframeMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-screen bg-black overflow-hidden select-none ${className}`}
      style={{ backgroundColor: '#000000' }}
    >
      {/* 3D Interactive Low-Poly Icosphere Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none block"
      />

      {/* Subtle radial amber background glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.12)_0%,transparent_70%)]" />

      {/* Children Content Overlay */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}