'use client';

import { Canvas } from '@react-three/fiber';
import {
  OrbitControls,
  useGLTF,
  ContactShadows,
} from '@react-three/drei';
import { Suspense } from 'react';

function Model() {
  const { scene } = useGLTF('/models/scene.gltf');

  return (
    <primitive
      object={scene}
      scale={1.3}
      position={[0, -1.0, 0]}
      rotation={[0, Math.PI / 4, 0]}
    />
  );
}

export default function Model3DViewer() {
  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [4, 3, 6], fov: 60 }}
        style={{ background: 'transparent', pointerEvents: 'none' }}
      >
        <Suspense fallback={null}>
          {/* Soft, diffused lighting */}
          <ambientLight intensity={0.8} />
          <directionalLight
            position={[5, 10, 5]}
            intensity={0.8}
            castShadow
            shadow-camera-far={50}
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
          />
          <pointLight position={[-10, 5, 10]} intensity={0.3} color="#ff00ff" />
          <pointLight
            position={[10, -5, -10]}
            intensity={0.3}
            color="#00ffff"
          />

          {/* Custom environment lighting - no external dependencies */}
          <ambientLight intensity={0.4} color="#ffffff" />
          <hemisphereLight
            args={['#87CEEB', '#654321', 0.6]} // sky color, ground color, intensity
          />

          {/* Contact Shadows */}
          <ContactShadows
            position={[0, -1.8, 0]}
            opacity={0.3}
            scale={8}
            blur={2}
            far={1.6}
            color="#ffffff"
          />

          {/* 3D Model */}
          <Model />

          {/* Controls for interaction */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={3}
            maxDistance={12}
            autoRotate={true}
            autoRotateSpeed={0.8}
            enableDamping={true}
            dampingFactor={0.05}
            target={[0, -0.5, 0]}
          />
        </Suspense>
      </Canvas>

      {/* Loading indicator */}
      <div className="absolute top-4 right-4">
        <Suspense
          fallback={
            <div className="bg-black/20 backdrop-blur-sm rounded-full p-3 transition-opacity">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-neon-pink/60"></div>
            </div>
          }
        >
          <div className="bg-black/20 backdrop-blur-sm rounded-lg px-3 py-1 text-xs text-green-400/70 font-poppins transition-opacity hover:opacity-100 opacity-60">
            ✓ 3D
          </div>
        </Suspense>
      </div>
    </div>
  );
}
