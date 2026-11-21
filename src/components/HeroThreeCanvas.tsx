import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Eye, EyeOff, RotateCcw, Sun, Wind } from 'lucide-react';
import {
  HERO_CAMERA_PRESETS,
  HERO_LIGHTING_MOODS,
  type HeroCameraPresetId,
  type HeroLightingMoodId,
  computeResponsiveTargetX,
  detectSoftwareRenderer,
  expDampAlpha,
} from '../three/heroSceneLogic';
import { createHeroProceduralTextures } from '../three/proceduralTextures';
import { buildHeroTreeScene } from '../three/heroTreeBuilder';

interface HeroThreeCanvasProps {
  onDarkBackdropChange?: (isDark: boolean) => void;
}

// Pre-allocated scratch math helpers at module scope (zero GC in rAF loop)
const _vecPos = new THREE.Vector3();
const _vecTarget = new THREE.Vector3();
const _vecKeyPos = new THREE.Vector3();
const _colorSky = new THREE.Color();
const _colorFog = new THREE.Color();
const _colorHorizon = new THREE.Color();
const _colorKey = new THREE.Color();
const _colorRim = new THREE.Color();
const _colorFillSky = new THREE.Color();
const _colorFillGround = new THREE.Color();
const _leafDummy = new THREE.Object3D();

export function HeroThreeCanvas({ onDarkBackdropChange }: HeroThreeCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  const [presetId, setPresetId] = useState<HeroCameraPresetId>('hero');
  const [moodId, setMoodId] = useState<HeroLightingMoodId>(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'emerald';
    }
    return 'morning';
  });
  const [breezeEnabled, setBreezeEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return false;
    }
    return true;
  });
  const [dockCollapsed, setDockCollapsed] = useState(false);

  // Mutable state bridge so React UI state updates never recreate the WebGL context
  const stateRef = useRef({
    presetId,
    moodId,
    breezeEnabled,
    presetDirty: true,
    cameraAnimating: true,
  });

  useEffect(() => {
    stateRef.current.presetId = presetId;
    stateRef.current.presetDirty = true;
    stateRef.current.cameraAnimating = true;
  }, [presetId]);

  useEffect(() => {
    stateRef.current.moodId = moodId;
    onDarkBackdropChange?.(HERO_LIGHTING_MOODS[moodId].isDarkBackdrop);
  }, [moodId, onDarkBackdropChange]);

  useEffect(() => {
    stateRef.current.breezeEnabled = breezeEnabled;
  }, [breezeEnabled]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Detect software WebGL rasterizer strictly via GPU renderer string
    const probeCanvas = document.createElement('canvas');
    const probeGl = probeCanvas.getContext('webgl2');
    let gpuString = '';
    if (probeGl) {
      const ext = probeGl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : probeGl.RENDERER;
      gpuString = String(probeGl.getParameter(param) ?? '');
      probeGl.getExtension('WEBGL_lose_context')?.loseContext();
    }
    const isSoftwareGl = detectSoftwareRenderer(gpuString);

    // 2. Initialize WebGLRenderer & PBR Color Pipeline
    const width = Math.max(container.clientWidth, 320);
    const height = Math.max(container.clientHeight, 260);
    const initialMood = HERO_LIGHTING_MOODS[stateRef.current.moodId];

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
      preserveDrawingBuffer: true,
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = initialMood.exposure;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
    renderer.setClearColor(initialMood.skyHex, 1);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.touchAction = 'pan-y';
    renderer.domElement.setAttribute('aria-label', 'Interactive 3D Growvia oak tree showcase');

    container.replaceChildren(renderer.domElement);

    // 3. Scene, Atmosphere Fog & Studio PMREM Environment (same across GPU and software WebGL)
    const scene = new THREE.Scene();
    const bgColor = new THREE.Color(initialMood.skyHex);
    scene.background = bgColor;
    const fog = new THREE.FogExp2(initialMood.fogHex, initialMood.fogDensity);
    scene.fog = fog;

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    roomEnv.dispose();
    pmremGenerator.dispose();

    // 4. Camera & Damped OrbitControls (scroll wheel unlocked so page scrolls naturally)
    const initPreset = HERO_CAMERA_PRESETS[stateRef.current.presetId];
    const initTargetX = computeResponsiveTargetX(window.innerWidth, stateRef.current.presetId);
    const camera = new THREE.PerspectiveCamera(initPreset.fov, width / height, 0.1, 90);
    camera.position.set(
      initPreset.position.x + initTargetX,
      initPreset.position.y,
      initPreset.position.z
    );

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(initPreset.target.x + initTargetX, initPreset.target.y, initPreset.target.z);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.065;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.minPolarAngle = 0.25;
    controls.maxPolarAngle = Math.PI * 0.472;
    controls.rotateSpeed = 0.72;
    controls.update();

    const handleControlStart = () => {
      stateRef.current.cameraAnimating = false;
    };
    controls.addEventListener('start', handleControlStart);

    // 5. Three-Point Studio Botanical Lighting Rig (Warm key vs cool fill + rim)
    const keyLight = new THREE.DirectionalLight(initialMood.keyColorHex, initialMood.keyIntensity);
    keyLight.position.set(
      initialMood.keyPosition.x,
      initialMood.keyPosition.y,
      initialMood.keyPosition.z
    );
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 26;
    const d = 5.6;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const hemiLight = new THREE.HemisphereLight(
      initialMood.fillSkyHex,
      initialMood.fillGroundHex,
      initialMood.fillIntensity
    );
    hemiLight.position.set(0, 16, 0);
    scene.add(hemiLight);

    const rimLight = new THREE.DirectionalLight(initialMood.rimColorHex, initialMood.rimIntensity);
    rimLight.position.set(-5.8, 4.4, -6.2);
    scene.add(rimLight);

    // 6. Procedural PBR Textures & Composite Multi-Part Growvia Tree Diorama
    const textures = createHeroProceduralTextures(renderer.capabilities.getMaxAnisotropy());
    const sceneObjects = buildHeroTreeScene(textures);
    sceneObjects.setShadowsEnabled(!isSoftwareGl);
    scene.add(sceneObjects.rootGroup);

    // Match initial horizon plane tint to mood (1.0 white preserves vertex colors on light moods)
    sceneObjects.horizonPlaneMat.color.setHex(
      initialMood.isDarkBackdrop ? 0x355640 : 0xffffff
    );

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // 7. ResizeObserver for crisp responsive framing without remounting WebGL
    let currentWidth = width;
    let currentHeight = height;
    const handleResize = () => {
      if (!container) return;
      const nextW = Math.max(container.clientWidth, 300);
      const nextH = Math.max(container.clientHeight, 240);
      if (nextW === currentWidth && nextH === currentHeight) return;
      currentWidth = nextW;
      currentHeight = nextH;
      camera.aspect = nextW / nextH;
      camera.updateProjectionMatrix();
      renderer.setSize(nextW, nextH, false);
      stateRef.current.presetDirty = true;
      stateRef.current.cameraAnimating = true;
      renderer.render(scene, camera);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    window.addEventListener('resize', handleResize);

    // 8. Smooth 60fps Animation Loop (zero GC + proper afterDraw sync on Software WebGL)
    let frameId = 0;
    let timeoutId = 0;
    let disposed = false;
    let windFactor = stateRef.current.breezeEnabled ? 1 : 0.08;
    let lastTime = performance.now();
    let elapsedSim = 0;

    function afterDraw(cb: () => void) {
      if (disposed) return;
      const gl = renderer.getContext() as WebGL2RenderingContext | null;
      if (!gl || typeof gl.fenceSync !== 'function') {
        timeoutId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) {
          if (sync) gl.deleteSync(sync);
          return;
        }
        const state = sync ? gl.getSyncParameter(sync, gl.SYNC_STATUS) : gl.SIGNALED;
        if (state === gl.UNSIGNALED) {
          timeoutId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          timeoutId = window.setTimeout(cb, 80);
        }
      };
      timeoutId = window.setTimeout(poll, 5);
    }

    const tick = (now: number) => {
      if (disposed) return;

      const rawDelta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      const dt = Math.max(rawDelta, 0.001);

      const { presetId: activePresetId, moodId: activeMoodId, breezeEnabled: activeBreeze } =
        stateRef.current;

      // Damped breeze & subtle organic tree sway
      const targetWind = activeBreeze ? 1.0 : 0.06;
      windFactor += (targetWind - windFactor) * expDampAlpha(4.5, dt);
      elapsedSim += dt * (0.25 + windFactor * 0.75);

      sceneObjects.grassUniforms.uTime.value = elapsedSim;
      sceneObjects.grassUniforms.uWind.value = windFactor;
      sceneObjects.leafUniforms.uTime.value = elapsedSim;
      sceneObjects.leafUniforms.uWind.value = windFactor;

      sceneObjects.treeGroup.rotation.z = Math.sin(elapsedSim * 0.65) * 0.011 * windFactor;
      sceneObjects.treeGroup.rotation.x = Math.cos(elapsedSim * 0.45) * 0.007 * windFactor;

      // Zero-GC floating leaf spirals
      const leafStates = sceneObjects.floatingLeafStates;
      for (let i = 0; i < leafStates.length; i++) {
        const s = leafStates[i];
        const t = elapsedSim * s.speed + s.phase;
        _leafDummy.position.set(
          s.basePos.x + Math.sin(t) * s.orbitRadius,
          s.basePos.y + Math.sin(t * 1.4) * 0.24,
          s.basePos.z + Math.cos(t * 0.9) * s.orbitRadius
        );
        _leafDummy.rotation.set(
          t * s.rotSpeedX,
          t * s.rotSpeedY,
          Math.sin(t * 0.8) * 0.6
        );
        _leafDummy.scale.setScalar(s.scale);
        _leafDummy.updateMatrix();
        sceneObjects.floatingLeavesMesh.setMatrixAt(i, _leafDummy.matrix);
      }
      sceneObjects.floatingLeavesMesh.instanceMatrix.needsUpdate = true;

      // Zero-GC sunlit pollen motes
      const moteStates = sceneObjects.sunMoteStates;
      for (let i = 0; i < moteStates.length; i++) {
        const m = moteStates[i];
        const mt = elapsedSim * m.speed + m.phase;
        _leafDummy.position.set(
          m.basePos.x + Math.cos(mt * 0.9) * 0.16,
          m.basePos.y + Math.sin(mt * 1.2) * 0.22,
          m.basePos.z + Math.sin(mt * 0.7) * 0.16
        );
        _leafDummy.rotation.set(0, mt, 0);
        _leafDummy.scale.setScalar(m.scale * (0.85 + Math.sin(mt * 2) * 0.18));
        _leafDummy.updateMatrix();
        sceneObjects.sunMotesMesh.setMatrixAt(i, _leafDummy.matrix);
      }
      sceneObjects.sunMotesMesh.instanceMatrix.needsUpdate = true;

      // Damped lighting mood transitions
      const targetMood = HERO_LIGHTING_MOODS[activeMoodId];
      const moodAlpha = expDampAlpha(5.2, dt);

      _colorSky.setHex(targetMood.skyHex);
      bgColor.lerp(_colorSky, moodAlpha);
      _colorFog.setHex(targetMood.fogHex);
      fog.color.lerp(_colorFog, moodAlpha);
      fog.density += (targetMood.fogDensity - fog.density) * moodAlpha;

      _colorHorizon.setHex(targetMood.isDarkBackdrop ? 0x355640 : 0xffffff);
      sceneObjects.horizonPlaneMat.color.lerp(_colorHorizon, moodAlpha);

      _colorKey.setHex(targetMood.keyColorHex);
      keyLight.color.lerp(_colorKey, moodAlpha);
      keyLight.intensity += (targetMood.keyIntensity - keyLight.intensity) * moodAlpha;
      _vecKeyPos.set(targetMood.keyPosition.x, targetMood.keyPosition.y, targetMood.keyPosition.z);
      keyLight.position.lerp(_vecKeyPos, moodAlpha);

      _colorFillSky.setHex(targetMood.fillSkyHex);
      hemiLight.color.lerp(_colorFillSky, moodAlpha);
      _colorFillGround.setHex(targetMood.fillGroundHex);
      hemiLight.groundColor.lerp(_colorFillGround, moodAlpha);
      hemiLight.intensity += (targetMood.fillIntensity - hemiLight.intensity) * moodAlpha;

      _colorRim.setHex(targetMood.rimColorHex);
      rimLight.color.lerp(_colorRim, moodAlpha);
      rimLight.intensity += (targetMood.rimIntensity - rimLight.intensity) * moodAlpha;
      renderer.toneMappingExposure += (targetMood.exposure - renderer.toneMappingExposure) * moodAlpha;

      // Exponential camera preset transitions (cleared immediately when user orbits)
      if (stateRef.current.cameraAnimating) {
        const preset = HERO_CAMERA_PRESETS[activePresetId];
        const offsetX = computeResponsiveTargetX(window.innerWidth, activePresetId);
        _vecPos.set(preset.position.x + offsetX, preset.position.y, preset.position.z);
        _vecTarget.set(preset.target.x + offsetX, preset.target.y, preset.target.z);

        const camAlpha = expDampAlpha(7.2, dt);
        camera.position.lerp(_vecPos, camAlpha);
        controls.target.lerp(_vecTarget, camAlpha);
        if (Math.abs(camera.fov - preset.fov) > 0.05) {
          camera.fov += (preset.fov - camera.fov) * camAlpha;
          camera.updateProjectionMatrix();
        }

        if (
          camera.position.distanceTo(_vecPos) < 0.015 &&
          controls.target.distanceTo(_vecTarget) < 0.015
        ) {
          camera.position.copy(_vecPos);
          controls.target.copy(_vecTarget);
          camera.fov = preset.fov;
          camera.updateProjectionMatrix();
          stateRef.current.cameraAnimating = false;
          stateRef.current.presetDirty = false;
        }
      }

      controls.update();
      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(() => {
          if (!disposed) tick(performance.now());
        });
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    if (isSoftwareGl) {
      tick(performance.now());
    } else {
      frameId = requestAnimationFrame(tick);
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      controls.removeEventListener('start', handleControlStart);
      controls.dispose();

      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          mesh.geometry?.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose());
          } else {
            mesh.material?.dispose();
          }
        }
      });
      textures.dispose();
      envTarget.dispose();
      renderer.dispose();
    };
  }, []);

  const isDarkMood = HERO_LIGHTING_MOODS[moodId].isDarkBackdrop;

  return (
    <>
      {/* Isolated WebGL canvas container (zero sibling React churn inside) */}
      <div ref={mountRef} data-testid="hero-three-canvas" className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Compact Single-Row Collapsible 3D Stage Dock (solid rgba, ZERO backdrop-filter, ZERO pulse dots) */}
      <div
        data-testid="hero-3d-dock"
        className="pointer-events-auto absolute bottom-2.5 sm:bottom-3 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center max-w-[95vw]"
      >
        <button
          type="button"
          onClick={() => setDockCollapsed((prev) => !prev)}
          aria-expanded={!dockCollapsed}
          aria-label={dockCollapsed ? 'Show 3D scene controls' : 'Hide 3D scene controls'}
          className="inline-flex items-center gap-1 rounded-t-[10px] px-2.5 py-0.5 text-[10.5px] font-semibold tracking-wide transition-colors cursor-pointer border border-b-0"
          style={{
            backgroundColor: isDarkMood ? 'rgba(18, 35, 25, 0.94)' : 'rgba(255, 253, 248, 0.95)',
            borderColor: isDarkMood ? 'rgba(142, 168, 135, 0.34)' : 'rgba(23, 48, 31, 0.14)',
            color: isDarkMood ? '#EEF0E4' : '#17301F',
          }}
        >
          {dockCollapsed ? (
            <>
              <Eye className="w-3 h-3" aria-hidden="true" />
              <span>3D Controls</span>
            </>
          ) : (
            <>
              <EyeOff className="w-3 h-3" aria-hidden="true" />
              <span>Hide 3D</span>
            </>
          )}
        </button>

        {!dockCollapsed && (
          <div
            className="flex items-center justify-center gap-0.5 sm:gap-1.5 rounded-[14px] px-1.5 sm:px-2.5 py-1 border shadow-[0_10px_24px_-10px_rgba(15,31,22,0.28)] whitespace-nowrap overflow-x-auto max-w-[94vw] no-scrollbar"
            style={{
              backgroundColor: isDarkMood ? 'rgba(18, 35, 25, 0.94)' : 'rgba(255, 253, 248, 0.96)',
              borderColor: isDarkMood ? 'rgba(142, 168, 135, 0.36)' : 'rgba(23, 48, 31, 0.14)',
              color: isDarkMood ? '#EEF0E4' : '#17301F',
            }}
          >
            {/* Camera Viewpoint Pills */}
            <div className="flex items-center gap-0.5 sm:gap-1 shrink-0" role="group" aria-label="3D Camera Viewpoint">
              {(Object.keys(HERO_CAMERA_PRESETS) as HeroCameraPresetId[]).map((id) => {
                const active = presetId === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setPresetId(id);
                      stateRef.current.cameraAnimating = true;
                    }}
                    aria-pressed={active}
                    className="rounded-full px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap"
                    style={{
                      backgroundColor: active
                        ? '#F26B1D'
                        : isDarkMood
                        ? 'rgba(255,255,255,0.08)'
                        : 'rgba(31,77,51,0.08)',
                      color: active ? '#1A2E20' : isDarkMood ? '#EEF0E4' : '#17301F',
                    }}
                  >
                    {HERO_CAMERA_PRESETS[id].label}
                  </button>
                );
              })}
            </div>

            <span
              aria-hidden="true"
              className="h-3.5 w-px shrink-0"
              style={{ backgroundColor: isDarkMood ? 'rgba(238,240,228,0.18)' : 'rgba(23,48,31,0.14)' }}
            />

            {/* Lighting Mood Swatches */}
            <div className="flex items-center gap-1 shrink-0" role="group" aria-label="3D Lighting Mood">
              <Sun className="w-3 h-3 opacity-75 hidden sm:inline shrink-0" aria-hidden="true" />
              {(Object.keys(HERO_LIGHTING_MOODS) as HeroLightingMoodId[]).map((id) => {
                const active = moodId === id;
                const mood = HERO_LIGHTING_MOODS[id];
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setMoodId(id)}
                    aria-pressed={active}
                    title={mood.label}
                    className="inline-flex items-center gap-1 rounded-full px-1.5 sm:px-2 py-0.5 text-[10.5px] sm:text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap"
                    style={{
                      backgroundColor: active
                        ? isDarkMood
                          ? 'rgba(155, 192, 148, 0.25)'
                          : 'rgba(31, 77, 51, 0.13)'
                        : 'transparent',
                      border: active
                        ? '1px solid rgba(242, 107, 29, 0.65)'
                        : '1px solid transparent',
                    }}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-black/15 shrink-0"
                      style={{ backgroundColor: mood.swatchHex }}
                      aria-hidden="true"
                    />
                    <span className="hidden md:inline">{mood.label}</span>
                  </button>
                );
              })}
            </div>

            <span
              aria-hidden="true"
              className="h-3.5 w-px shrink-0"
              style={{ backgroundColor: isDarkMood ? 'rgba(238,240,228,0.18)' : 'rgba(23,48,31,0.14)' }}
            />

            {/* Breeze Toggle + Quick Reset */}
            <button
              type="button"
              onClick={() => setBreezeEnabled((prev) => !prev)}
              aria-pressed={breezeEnabled}
              title={breezeEnabled ? 'Pause leaf breeze' : 'Enable leaf breeze'}
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] sm:text-[11px] font-medium cursor-pointer whitespace-nowrap shrink-0"
              style={{
                backgroundColor: breezeEnabled
                  ? isDarkMood
                    ? 'rgba(155, 192, 148, 0.22)'
                    : 'rgba(31, 77, 51, 0.11)'
                  : 'transparent',
              }}
            >
              <Wind className="w-3 h-3 shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">Breeze</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPresetId('hero');
                stateRef.current.cameraAnimating = true;
              }}
              aria-label="Reset camera framing"
              title="Reset framing"
              className="inline-flex items-center justify-center w-5 h-5 rounded-full cursor-pointer opacity-80 hover:opacity-100 shrink-0"
            >
              <RotateCcw className="w-3 h-3" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
