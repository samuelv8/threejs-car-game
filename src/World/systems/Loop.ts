/* eslint-disable no-restricted-syntax */
import {
  Clock,
  OrthographicCamera,
  PerspectiveCamera,
  Scene,
  WebGL1Renderer,
  WebGLRenderer,
} from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';

interface LoopTypes {
  camera: PerspectiveCamera | OrthographicCamera;
  scene: Scene;
  renderer: WebGLRenderer | WebGL1Renderer;
}

const clock = new Clock();
class Loop {
  camera: LoopTypes['camera'];

  scene: LoopTypes['scene'];

  renderer: LoopTypes['renderer'];

  updatables: any[];

  stats: Stats;

  constructor({ camera, scene, renderer }: LoopTypes) {
    this.camera = camera;
    this.scene = scene;
    this.renderer = renderer;
    this.updatables = [];
    this.stats = Stats();

    document.body.appendChild(this.stats.dom);
  }

  start() {
    this.renderer.setAnimationLoop(() => {
      this.tick();
      this.renderer.render(this.scene, this.camera);
      this.stats.update();
    });
  }

  stop() {
    this.renderer.setAnimationLoop(null);
  }

  tick() {
    const delta: number = clock.getDelta();

    for (const object of this.updatables) {
      object.tick(delta);
    }
  }
}

export { Loop };
