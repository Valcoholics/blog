import { useEffect, useRef, type MutableRefObject } from 'react';

const MAX_WARP = 0.42;

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function easeInOut(value: number) {
  return value * value * (3 - 2 * value);
}

function shader(gl: WebGLRenderingContext, type: number, source: string) {
  const result = gl.createShader(type);
  if (!result) throw new Error('Unable to create shader');
  gl.shaderSource(result, source);
  gl.compileShader(result);
  if (!gl.getShaderParameter(result, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(result) ?? 'Shader compilation failed';
    gl.deleteShader(result);
    throw new Error(message);
  }
  return result;
}

function texture(gl: WebGLRenderingContext, unit: number) {
  const result = gl.createTexture();
  if (!result) throw new Error('Unable to create texture');
  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, result);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    1,
    1,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    new Uint8Array([0, 0, 0, 255])
  );
  return result;
}

let textile: HTMLCanvasElement | null = null;

function textileDisplacement() {
  if (textile) return textile;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Unable to create textile texture');
  const image = context.createImageData(canvas.width, canvas.height);

  for (let y = 0; y < canvas.height; y += 1) {
    const vy = y * 2;
    const yThread = Math.floor(vy / 18);
    const rowSlub = Math.sin(yThread * 2.13) * 0.5 + Math.sin(vy * 0.011) * 0.5;
    for (let x = 0; x < canvas.width; x += 1) {
      const vx = x * 2;
      const xThread = Math.floor(vx / 18);
      const overUnder = (xThread + yThread) % 2 === 0 ? 1 : -1;
      const warpRidge = Math.abs(Math.sin(vx * 0.18 + rowSlub * 1.8)) ** 0.55;
      const weftRidge = Math.abs(Math.sin(vy * 0.2 + Math.sin(vx * 0.014) * 2.6)) ** 0.5;
      const fiber = Math.sin((vx + vy) * 0.055 + Math.sin(vy * 0.018) * 2) * 0.5;
      const lint = Math.sin((xThread * 12.9898 + yThread * 78.233) * 43758.5453);
      const value = Math.max(0, Math.min(255, 96 + warpRidge * 54 + weftRidge * 48 + overUnder * 30 + fiber * 26 + lint * 16));
      const index = (y * canvas.width + x) * 4;
      image.data[index] = value;
      image.data[index + 1] = value;
      image.data[index + 2] = value;
      image.data[index + 3] = 255;
    }
  }
  context.putImageData(image, 0, 0);
  textile = canvas;
  return canvas;
}

const vertex = `
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const fragment = `
  precision mediump float;
  uniform float uTime;
  uniform float uProgress;
  uniform float uWarp;
  uniform float uCanvasAspect;
  uniform float uFromAspect;
  uniform float uToAspect;
  uniform sampler2D uFrom;
  uniform sampler2D uTo;
  uniform sampler2D uDisplacement;
  varying vec2 vUv;

  vec2 coverUv(vec2 uv, float textureAspect, float canvasAspect) {
    vec2 centered = uv - 0.5;
    if (canvasAspect > textureAspect) centered.y *= textureAspect / canvasAspect;
    else centered.x *= canvasAspect / textureAspect;
    return centered + 0.5;
  }

  void main() {
    float peak = sin(uProgress * 3.14159265);
    vec2 displacementUv = vUv;
    displacementUv.x += uTime * 0.012;
    displacementUv.y += sin(uTime * 0.19) * 0.018;
    vec3 d = texture2D(uDisplacement, displacementUv).rgb;
    float centered = d.r - 0.5;

    vec2 fromUv = coverUv(vUv, uFromAspect, uCanvasAspect);
    vec2 toUv = coverUv(vUv, uToAspect, uCanvasAspect);
    fromUv.x += d.r * uWarp * 0.7;
    fromUv.y += d.r * uWarp + uProgress * 0.36;
    toUv.x -= d.r * uWarp * 0.64;
    toUv.y += d.r * -uWarp - (1.0 - uProgress) * 0.36;

    vec3 fromColor = texture2D(uFrom, fromUv).rgb;
    vec3 toColor = texture2D(uTo, toUv).rgb;
    float seam = mix(1.22, -0.22, uProgress) + centered * peak * 0.42;
    float reveal = smoothstep(seam - 0.22, seam + 0.22, vUv.y);
    gl_FragColor = vec4(mix(fromColor, toColor, reveal), 1.0);
  }
`;

export function MezameThreadedVideoTextureBridge({
  active,
  fromVideoElRef,
  fromSrc,
  progress,
  toVideoElRef,
  toSrc,
}: {
  active: boolean;
  fromVideoElRef: MutableRefObject<HTMLVideoElement | null>;
  fromSrc: string;
  progress: number;
  toVideoElRef: MutableRefObject<HTMLVideoElement | null>;
  toSrc: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(progress);
  const activeRef = useRef(active);
  const syncRenderingRef = useRef<(() => void) | null>(null);
  const primed = useRef({ from: false, to: false });
  const blocked = useRef(false);

  useEffect(() => {
    progressRef.current = clamp01(progress);
    activeRef.current = active;
    syncRenderingRef.current?.();
  }, [active, progress]);

  useEffect(() => {
    primed.current = { from: false, to: false };
    blocked.current = false;
  }, [fromSrc, toSrc]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { alpha: true, antialias: true });
    if (!gl) return;
    let frame: number | null = null;
    let program: WebGLProgram | null = null;
    let quad: WebGLBuffer | null = null;
    const shaders: WebGLShader[] = [];
    const textures: WebGLTexture[] = [];
    primed.current = { from: false, to: false };
    blocked.current = false;

    const dispose = () => {
      syncRenderingRef.current = null;
      if (frame !== null) window.cancelAnimationFrame(frame);
      frame = null;
      textures.forEach((value) => gl.deleteTexture(value));
      shaders.forEach((value) => gl.deleteShader(value));
      gl.deleteBuffer(quad);
      gl.deleteProgram(program);
    };

    try {
      program = gl.createProgram();
      if (!program) throw new Error('Unable to create WebGL program');
      shaders.push(shader(gl, gl.VERTEX_SHADER, vertex));
      shaders.push(shader(gl, gl.FRAGMENT_SHADER, fragment));
      shaders.forEach((value) => gl.attachShader(program!, value));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Unable to link WebGL program');
      gl.useProgram(program);

      quad = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, quad);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
      const position = gl.getAttribLocation(program, 'position');
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

      const fromTexture = texture(gl, 0);
      textures.push(fromTexture);
      const toTexture = texture(gl, 1);
      textures.push(toTexture);
      const displacement = texture(gl, 2);
      textures.push(displacement);
      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, displacement);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textileDisplacement());
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);

      const uniform = (name: string) => gl.getUniformLocation(program!, name);
      const uniforms = {
        time: uniform('uTime'), progress: uniform('uProgress'), warp: uniform('uWarp'),
        canvasAspect: uniform('uCanvasAspect'), fromAspect: uniform('uFromAspect'), toAspect: uniform('uToAspect'),
        from: uniform('uFrom'), to: uniform('uTo'), displacement: uniform('uDisplacement'),
      };
      gl.uniform1i(uniforms.from, 0);
      gl.uniform1i(uniforms.to, 1);
      gl.uniform1i(uniforms.displacement, 2);

      const upload = (unit: number, target: WebGLTexture, video: HTMLVideoElement) => {
        if (blocked.current || video.readyState < 2 || !video.videoWidth) return false;
        try {
          gl.activeTexture(gl.TEXTURE0 + unit);
          gl.bindTexture(gl.TEXTURE_2D, target);
          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
          return true;
        } catch {
          blocked.current = true;
          return false;
        }
      };

      const render = (now: number) => {
        frame = null;
        if (!activeRef.current) return;

        const width = Math.max(1, Math.floor(canvas.clientWidth * window.devicePixelRatio));
        const height = Math.max(1, Math.floor(canvas.clientHeight * window.devicePixelRatio));
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
          gl.viewport(0, 0, width, height);
        }

        const from = fromVideoElRef.current;
        const to = toVideoElRef.current;
        if (from && upload(0, fromTexture, from)) primed.current.from = true;
        if (to && upload(1, toTexture, to)) primed.current.to = true;

        if (primed.current.from && primed.current.to) {
          const value = easeInOut(progressRef.current);
          const fromAspect = from && from.videoHeight ? from.videoWidth / from.videoHeight : 16 / 9;
          const toAspect = to && to.videoHeight ? to.videoWidth / to.videoHeight : 16 / 9;
          gl.uniform1f(uniforms.time, now * 0.001);
          gl.uniform1f(uniforms.progress, value);
          gl.uniform1f(uniforms.warp, MAX_WARP * Math.sin(value * Math.PI));
          gl.uniform1f(uniforms.canvasAspect, canvas.width / Math.max(1, canvas.height));
          gl.uniform1f(uniforms.fromAspect, fromAspect);
          gl.uniform1f(uniforms.toAspect, toAspect);
          gl.drawArrays(gl.TRIANGLES, 0, 6);
        } else {
          gl.clearColor(0, 0, 0, 0);
          gl.clear(gl.COLOR_BUFFER_BIT);
        }
        frame = window.requestAnimationFrame(render);
      };
      const syncRendering = () => {
        if (activeRef.current) {
          if (frame === null) frame = window.requestAnimationFrame(render);
        } else if (frame !== null) {
          window.cancelAnimationFrame(frame);
          frame = null;
        }
      };
      syncRenderingRef.current = syncRendering;
      syncRendering();
    } catch {
      // The two native video layers remain visible if WebGL is unavailable.
      dispose();
      return;
    }
    return dispose;
  }, [fromVideoElRef, toVideoElRef]);

  return <canvas aria-hidden className="mezame-weave-canvas" ref={canvasRef} style={{ opacity: active ? 1 : 0 }} />;
}
