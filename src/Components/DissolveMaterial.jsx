import { useFrame } from "@react-three/fiber";
import { patchShaders } from "gl-noise";
import { easing } from "maath";
import * as React from "react";
import * as THREE from "three";
import CSM from "three-custom-shader-material";

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vPosition; // use the world position instead of the uv
  uniform float uTime;
  uniform float uDissolveCompleted;

  void main() {
    vUv = uv;
    vec3 deformedPosition = position;

    if(uDissolveCompleted > 0.5) {

      // Flag effect
      float Y_AXIS = 1.0;
      float waveAmplitude = 0.1;
      float waveFrequency = 5.0;
      float waveOffset = sin(vUv.x * waveFrequency + uTime) * waveAmplitude * Y_AXIS;
      deformedPosition += normal * waveOffset;
    }

    vPosition = deformedPosition;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(deformedPosition, 1.0);
  }`;

const fragmentShader = patchShaders(/* glsl */ `
  varying vec2 vUv;
  varying vec3 vPosition;
  uniform float uThickness;
  uniform vec3 uColor;
  uniform float uProgress;
  
  
  void main() {
    gln_tFBMOpts opts = gln_tFBMOpts(1.0, 0.3, 2.0, 5.0, 1.0, 5, false, false);
    // float noise = gln_sfbm(vUv, opts); // THE ORIGINAL CODE FROM THE TUTORIAL
    float noise = gln_sfbm(vPosition, opts); //  use the world position instead of the uv for a better effect working on all objects
    noise = gln_normalize(noise);

    float progress = uProgress;

    float alpha = step(1.0 - progress, noise);
    float border = step((1.0 - progress) - uThickness, noise) - alpha;
    
    csm_DiffuseColor.a = alpha + border;
    csm_DiffuseColor.rgb = mix(csm_DiffuseColor.rgb, uColor, border);
  }`);

export function DissolveMaterial({
  baseMaterial,
  thickness = 0.1,
  color = "#eb5a13",
  intensity = 50,
  duration = 1,
  visible = true,
}) {
  const uniforms = React.useRef({
    uThickness: { value: 0.1 },
    uColor: { value: new THREE.Color("#eb5a13").multiplyScalar(20) },
    uProgress: { value: 0 },
    uTime: { value: 0.0 }, // Add this line to initialize the uTime uniform
    uDissolveCompleted: { value: 0.0 }, // Uniform to tell if dissolve has completed

  });
  const ref = React.useRef()

  React.useEffect(() => {
    uniforms.current.uThickness.value = thickness;
    uniforms.current.uColor.value.set(color).multiplyScalar(intensity);
  }, [thickness, color, intensity]);

  useFrame((_state, delta) => {

      easing.damp(
        uniforms.current.uProgress,
        "value",
        visible ? 1 : 0,
        duration,
        delta
      );

  });

  return (
    <>
      <CSM
        ref={ref}
        baseMaterial={baseMaterial}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms.current}
        toneMapped={true}
        transparent = {true}
      />
    </>
  );
}
