"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/** Written by the section's scroll timeline; read every frame. */
export type BottleMotion = { turn: number };

type Props = {
  tone: string;
  mark: string;
  motion: BottleMotion;
  onReady?: () => void;
};

/** Studio lighting as an environment map: glass needs something to reflect. */
function Studio() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    // A white studio is far too bright for a dark stage: keep only its shape.
    scene.environmentIntensity = 0.55;
    gl.toneMappingExposure = 0.92;
    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
}

function roundedRect(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

const block = (w: number, h: number, depth: number, r: number, bevel: number) => {
  const geo = new THREE.ExtrudeGeometry(roundedRect(w, h, r), {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 6,
    curveSegments: 12,
  });
  geo.center();
  return geo;
};

/** The etched label: a frosted panel with the house name and the scent's mark. */
function useLabel(mark: string) {
  const [canvas] = useState(() => document.createElement("canvas"));
  const texture = useMemo(() => {
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, [canvas]);

  useEffect(() => {
    const draw = () => {
      const css = getComputedStyle(document.documentElement);
      const serif = css.getPropertyValue("--font-cormorant").trim() || "serif";
      const sans = css.getPropertyValue("--font-jost").trim() || "sans-serif";
      canvas.width = 420;
      canvas.height = 470;
      const g = canvas.getContext("2d")!;
      g.clearRect(0, 0, 420, 470);
      g.fillStyle = "rgba(255, 250, 240, 0.12)";
      g.fillRect(0, 0, 420, 470);
      g.strokeStyle = "rgba(252, 248, 240, 0.55)";
      g.lineWidth = 3;
      g.strokeRect(1.5, 1.5, 417, 467);
      g.fillStyle = "rgba(252, 248, 240, 0.9)";
      g.textAlign = "center";
      g.font = `300 150px ${serif}`;
      g.fillText("ami", 210, 215);
      g.fillRect(170, 280, 80, 2);
      g.font = `400 40px ${sans}`;
      g.fillText(mark.split(" ").join("   "), 210, 370);
      texture.needsUpdate = true;
    };
    draw();
    // The house fonts may land after the first draw.
    document.fonts.ready.then(draw);
  }, [canvas, texture, mark]);

  return texture;
}

/** A soft pool of warm light behind the flacon, so the glass has something to refract. */
function LightPool() {
  const texture = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 512;
    const g = c.getContext("2d")!;
    const grad = g.createRadialGradient(256, 256, 0, 256, 256, 256);
    grad.addColorStop(0, "rgba(236, 216, 184, 0.75)");
    grad.addColorStop(0.4, "rgba(211, 190, 158, 0.28)");
    grad.addColorStop(1, "rgba(211, 190, 158, 0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 512, 512);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  return (
    <mesh position={[0, 0.1, -2.4]}>
      <planeGeometry args={[4.6, 5]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

/*
  Proportions follow the vector flacon (wide variant) in Bottle.tsx, in
  hundredths of its 200 x 380 viewBox: body 164 x 284, cap 88 x 48, liquid
  filling the lower two thirds.
*/
const BODY = { w: 1.64, h: 2.84, d: 0.92 };

function Flacon({ tone, mark, motion }: Omit<Props, "onReady">) {
  const group = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const label = useLabel(mark);

  const body = useMemo(() => block(BODY.w, BODY.h, BODY.d, 0.07, 0.05), []);
  const juice = useMemo(() => block(BODY.w - 0.2, 1.78, BODY.d - 0.22, 0.04, 0.03), []);
  const cap = useMemo(() => block(0.88, 0.48, 0.62, 0.03, 0.025), []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = e.clientX / window.innerWidth - 0.5;
      pointer.current.y = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const p = pointer.current;
    const k = Math.min(1, dt * 2.2);
    // Scroll turns the flacon a little over half a turn; the cursor leans it.
    const targetY = -0.55 + motion.turn * 1.1 + p.x * 0.45 + Math.sin(t * 0.3) * 0.05;
    g.rotation.y += (targetY - g.rotation.y) * k;
    g.rotation.x += (-p.y * 0.14 - g.rotation.x) * k;
    g.position.y = Math.sin(t * 0.7) * 0.04 - 0.3;
  });

  const liquid = new THREE.Color(tone);

  return (
    <group ref={group}>
      {/*
        Glass is layered rather than transmissive: the liquid first, then the
        inside faces, then a thin clear shell carrying the reflections. It
        reads the same on every GPU (transmission varies wildly, and falls
        back to milky plastic on software renderers).
      */}
      <mesh geometry={juice} position={[0, -BODY.h / 2 + 0.12 + 0.89, 0]} renderOrder={1}>
        <meshPhysicalMaterial
          color={liquid}
          roughness={0.18}
          clearcoat={0.4}
          transparent
          opacity={0.92}
          envMapIntensity={0.7}
        />
      </mesh>
      <mesh geometry={body} renderOrder={2}>
        <meshPhysicalMaterial
          color="#f4ead9"
          side={THREE.BackSide}
          transparent
          opacity={0.14}
          roughness={0.08}
          depthWrite={false}
        />
      </mesh>
      <mesh geometry={body} renderOrder={3}>
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.16}
          roughness={0.03}
          clearcoat={1}
          clearcoatRoughness={0.03}
          specularIntensity={1}
          envMapIntensity={2.2}
          depthWrite={false}
        />
      </mesh>
      {/* meniscus: one bright line where the liquid meets the air */}
      <mesh position={[0, -BODY.h / 2 + 0.12 + 1.78 + 0.03, 0]}>
        <boxGeometry args={[BODY.w - 0.24, 0.01, BODY.d - 0.26]} />
        <meshBasicMaterial color="#fff6e6" transparent opacity={0.5} />
      </mesh>
      <mesh position={[0, -0.37, BODY.d / 2 + 0.056]} renderOrder={4}>
        <planeGeometry args={[0.84, 0.94]} />
        <meshBasicMaterial map={label} transparent depthWrite={false} toneMapped={false} />
      </mesh>
      {/* neck, collar and the wide, low cap */}
      <mesh position={[0, BODY.h / 2 + 0.13, 0]}>
        <cylinderGeometry args={[0.11, 0.12, 0.3, 32]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.3} roughness={0.05} clearcoat={1} envMapIntensity={2} />
      </mesh>
      <mesh position={[0, BODY.h / 2 + 0.155, 0]}>
        <boxGeometry args={[0.8, 0.05, 0.56]} />
        <meshStandardMaterial color="#2a2620" metalness={0.2} roughness={0.5} />
      </mesh>
      <mesh geometry={cap} position={[0, BODY.h / 2 + 0.43, 0]}>
        <meshPhysicalMaterial color={liquid} roughness={0.45} clearcoat={0.4} clearcoatRoughness={0.35} envMapIntensity={0.7} />
      </mesh>
    </group>
  );
}

/**
 * The flagship in 3D glass, over a pool of
 * warm light, turned by the scroll and leaned by the cursor. Renders only
 * while on screen.
 */
export default function GlassBottle({ tone, mark, motion, onReady }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "20% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={host} className="h-full w-full">
      <Canvas
        frameloop={visible ? "always" : "never"}
        dpr={[1, 1.75]}
        camera={{ fov: 24, position: [0, 0.2, 12.6] }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={() => requestAnimationFrame(() => onReady?.())}
      >
        <Studio />
        <LightPool />
        {/* key from the upper right, a warm rim from behind for the glass edges */}
        <directionalLight position={[3, 4, 5]} intensity={1.1} />
        <directionalLight position={[-3, 2, -4]} intensity={1.6} color="#ffd9a8" />
        <directionalLight position={[4, -1, -3]} intensity={0.8} color="#ffe9cc" />
        <Flacon tone={tone} mark={mark} motion={motion} />
      </Canvas>
    </div>
  );
}
