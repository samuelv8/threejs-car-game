import { WebGLRenderer } from 'three';

function createRenderer(shadows: boolean = false) {
  const renderer = new WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  if (shadows) renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);
  return renderer;
}

export { createRenderer };
