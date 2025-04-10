import * as THREE from 'three';
import { MindARThree } from 'mind-ar/dist/mindar-image-three.prod.js';

export const ARLabelManager = async (containerRef) => {
  if (!containerRef?.current) {
    console.error("Container ref is not ready!");
    return;
  }

  const mindarThree = new MindARThree({
    container: containerRef.current,
    imageTargetSrc: './data/targets.mind',

    maxTrack: 3,
    uiLoading: "yes", // Shows loading progress
    uiError: "yes",   // Shows error message if target fails
    uiScanning: "yes", // Shows scanning UI
  });

  // const { renderer: mindRenderer, scene: mindScene, camera: mindCamera } = mindarThree;
  const { renderer, scene, camera } = mindarThree;


  const descriptions = [
    "Café Aroma - Fresh coffee and pastries",
    "TechZone – All your gadget needs",
    "BookNest – Escape into a good book",
    "GreenGrocer – Organic fruits and vegetables",
    "StyleHub – Trendy fashion wear",
    "PharmaPlus – Trusted health products",
    "FitMax – Fitness gear and supplements",
    "ToyLand – Fun for every kid",
    "GlamCorner – Beauty and skincare",
    "GameDen – Consoles and gaming accessories"
  ];

//   // Add all 10 anchors with labels
//   for (let i = 0; i < 10; i++) {
//     const anchor = mindarThree.addAnchor(i);
//     anchor.onTargetFound = () => {
//       console.log(`Target ${i} found!`);
//     };
//     anchor.onTargetLost = () => {
//       console.log(`Target ${i} lost!`);
//     };

//     const canvas = document.createElement('canvas');
//     canvas.width = 512;
//     canvas.height = 128;
//     const ctx = canvas.getContext('2d');
//     ctx.fillStyle = '#000000';
//     ctx.fillRect(0, 0, canvas.width, canvas.height);
//     ctx.fillStyle = '#ffffff';
//     ctx.font = 'bold 40px Arial';
//     // ctx.fillText(`Shop ${i + 1}`, 30, 80);
//     ctx.innerText = descriptions[i] || `Shop ${i + 1}`;


//     const texture = new THREE.CanvasTexture(canvas);
//     const material = new THREE.MeshBasicMaterial({
//       map: texture,
//       side: THREE.DoubleSide,
//       transparent: true,
//     });

//     const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.25), material);
//     plane.position.set(0, 0, 0);

//     anchor.group.add(plane);
//   }


//   await mindarThree.start();
//   renderer.setAnimationLoop(() => {
//     mindRenderer.render(mindScene, mindCamera);
//   });
// };
for (let i = 0; i < 10; i++) {
  const anchor = mindarThree.addAnchor(i);

  // Add debug logging
  anchor.onTargetFound = () => {
    console.log(`Target ${i} found!`);
  };
  anchor.onTargetLost = () => {
    console.log(`Target ${i} lost!`);
  };

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 40px Arial';
  ctx.fillText(`Shop ${i + 1}`, 30, 80);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide,
    transparent: true,
  });

  const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.25), material);
  plane.position.set(0, 0, 0);
  anchor.group.add(plane);
}

await mindarThree.start();

// ✅ THIS IS STEP 7:
renderer.setAnimationLoop(() => {
  renderer.render(scene, camera);
});
};
