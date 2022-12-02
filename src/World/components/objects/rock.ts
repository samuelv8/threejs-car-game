import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';


async function createRock() {
    const loader = new GLTFLoader();

    const data = await loader.loadAsync('public/assets/models/rock.gltf');
    (data).scene.scale.set(30, 30, 30);
    (data).scene.position.z = 10;
    (data).scene.rotateX(Math.PI / 2);
    return (data).scene
}


export { createRock };
