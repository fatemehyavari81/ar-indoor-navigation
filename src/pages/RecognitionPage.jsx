// import  { useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import * as THREE from "three";
// import { MindARThree } from 'mind-ar/dist/mindar-image-three.prod.js';

// import { shops } from "../utils/shopData";

// const RecognitionPage = () => {
//   const navigate = useNavigate();

//   useEffect(() => {
//     let mindarThree;
//     let renderer, scene, camera;
//     let anchors = [];

//     const startMindAR = async () => {
//       mindarThree = new MindARThree({
//         container: document.body,
//         imageTargetSrc: "/data/targets.mind",

//         maxTrack: 3,
//         uiScanning: false,
//         uiLoading: false
//       });

//       ({ renderer, scene, camera } = mindarThree);


//       shops.forEach((shop, i) => {
//         const anchor = mindarThree.addAnchor(i);
//         anchors.push(anchor);

//         const group = new THREE.Group();
//         scene.add(group);

//         // Create canvas texture for description text
//         const canvas = document.createElement("canvas");
//         canvas.width = 512;
//         canvas.height = 128;
//         const ctx = canvas.getContext("2d");

//         // Background
//         ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
//         ctx.fillRect(0, 0, canvas.width, canvas.height);

//         // Text style
//         ctx.fillStyle = "black";
//         ctx.font = "28px Arial";
//         ctx.fillText(shop.description, 10, 60);

//         const texture = new THREE.CanvasTexture(canvas);
//         const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
//         const plane = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.4), material);

//         group.add(plane);

//         anchor.group.add(group);

//         anchor.onTargetFound = () => {
//           localStorage.setItem("selectedDestination", JSON.stringify(shop.location));
//           setTimeout(() => {
//             navigate("/navigation");
//           }, 1000);
//         };
//       });

//       await mindarThree.start();
//       renderer.setAnimationLoop(() => {
//         renderer.render(scene, camera);
//       });
//     };

//     startMindAR();

//     return () => {
//       if (mindarThree?.stop) {
//         mindarThree.stop();
//         renderer.setAnimationLoop(null);
//         anchors = [];
//       }
//     };
//   }, [navigate]);

//   return (
//     <div className="w-full h-full fixed absolute top-0 left-0 p-4 text-white z-10">
//     </div>
//   );
// };

// export default RecognitionPage;

  // useEffect(() => {
  //   let mindarThree;
  //   let renderer, scene, camera;
  //   let raycaster, mouse;
  //   let clickableObjects = [];

  //   const startMindAR = async () => {
  //     mindarThree = new MindARThree({
  //       container: document.body,
  //       imageTargetSrc: "/data/targets.mind",
  //       maxTrack: 3,
  //       uiScanning: false,
  //       uiLoading: false,
  //     });

  //     ({ renderer, scene, camera } = mindarThree);

  //     raycaster = new THREE.Raycaster();
  //     mouse = new THREE.Vector2();

  //     shops.forEach((shop, i) => {
  //       const anchor = mindarThree.addAnchor(i);

  //       const group = new THREE.Group();
  //       anchor.group.add(group);
  //       scene.add(group);

  //       // === Description Text Plane ===
  //       const descCanvas = document.createElement("canvas");
  //       descCanvas.width = 512;
  //       descCanvas.height = 128;
  //       const descCtx = descCanvas.getContext("2d");

  //       descCtx.fillStyle = "rgba(255,255,255,0.9)";
  //       descCtx.fillRect(0, 0, descCanvas.width, descCanvas.height);
  //       descCtx.fillStyle = "black";
  //       descCtx.font = "28px Arial";
  //       descCtx.fillText(shop.description, 10, 60);

  //       const descTexture = new THREE.CanvasTexture(descCanvas);
  //       const descMaterial = new THREE.MeshBasicMaterial({
  //         map: descTexture,
  //         transparent: true,
  //       });
  //       const descPlane = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.4), descMaterial);
  //       group.add(descPlane);

  //       // === Button Plane ===
  //       const btnCanvas = document.createElement("canvas");
  //       btnCanvas.width = 512;
  //       btnCanvas.height = 128;
  //       const btnCtx = btnCanvas.getContext("2d");

  //       btnCtx.fillStyle = "#10B981"; // green
  //       btnCtx.fillRect(0, 0, btnCanvas.width, btnCanvas.height);
  //       btnCtx.fillStyle = "white";
  //       btnCtx.font = "bold 28px Arial";
  //       btnCtx.fillText("It is my destination", 50, 70);

  //       const btnTexture = new THREE.CanvasTexture(btnCanvas);
  //       const btnMaterial = new THREE.MeshBasicMaterial({
  //         map: btnTexture,
  //         transparent: true,
  //       });

  //       const btnPlane = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.4), btnMaterial);
  //       btnPlane.position.set(0, -0.5, 0); // Position below description
  //       group.add(btnPlane);

  //       // Store button reference for click detection
  //       clickableObjects.push({ mesh: btnPlane, location: shop.location });

  //       // Anchor activation
  //       anchor.onTargetFound = () => {
  //         btnPlane.visible = true;
  //         descPlane.visible = true;
  //       };

  //       anchor.onTargetLost = () => {
  //         btnPlane.visible = false;
  //         descPlane.visible = false;
  //       };
  //     });

  //     // Start AR
  //     await mindarThree.start();

  //     renderer.setAnimationLoop(() => {
  //       renderer.render(scene, camera);
  //     });

  //     // Click listener
  //     const handleClick = (event) => {
  //       // Get normalized device coordinates (-1 to +1)
  //       const rect = renderer.domElement.getBoundingClientRect();
  //       mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  //       mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  //       raycaster.setFromCamera(mouse, camera);
  //       const intersects = raycaster.intersectObjects(
  //         clickableObjects.map((obj) => obj.mesh)
  //       );

  //       if (intersects.length > 0) {
  //         const clicked = clickableObjects.find((obj) => obj.mesh === intersects[0].object);
  //         if (clicked) {
  //           localStorage.setItem("selectedDestination", JSON.stringify(clicked.location));
  //           navigate("/navigation");
  //         }
  //       }
  //     };

  //     renderer.domElement.addEventListener("click", handleClick);
  //   };

  //   startMindAR();

  //   return () => {
  //     if (mindarThree?.stop) {
  //       mindarThree.stop();
  //       renderer.setAnimationLoop(null);
  //       renderer.domElement.removeEventListener("click", handleClick);
  //     }
  //   };
  // }, [navigate]);



import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";
import { MindARThree } from "mind-ar/dist/mindar-image-three.prod.js";

import { shops } from "../utils/shopData";

const RecognitionPage = () => {
  const navigate = useNavigate();
  const containerRef = useRef();



  useEffect(() => {
  let mindarThree;
  let renderer, scene, camera;

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const clickableObjects = [];


  const handleClick = (event) => {
    console.log("Canvas clicked");

  if (!renderer || !camera) return;

  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  clickableObjects.forEach((obj) => obj.updateMatrixWorld());


   const intersects = raycaster.intersectObjects(clickableObjects, true
      );



   if (intersects.length > 0) {

        const object = intersects[0].object;
        console.log("Clicked object:", object);
        object.userData.clicked = !object.userData.clicked;

        const destination = object.userData.location;
        if (destination) {
          localStorage.setItem("selectedDestination", JSON.stringify(destination));
          navigate("/navigation");
        }
      }
};


  const startMindAR = async () => {
  mindarThree = new MindARThree({
    container: containerRef.current,

    imageTargetSrc: "/data/targets.mind",
    maxTrack: 3,
    uiScanning: false,
    uiLoading: false,
  });


    ({ renderer, scene, camera } = mindarThree);

    camera.near = 0.01;
    camera.far = 100;
    camera.updateProjectionMatrix();

     const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
      scene.add(light);

    const group = new THREE.Group();
    scene.add(group);


    scene.add(new THREE.AmbientLight(0xffffff, 1));

    window.addEventListener( 'resize', onWindowResize );
    shops.forEach((shop, i) => {
      const anchor = mindarThree.addAnchor(i);
      anchor.visible = true;


      // === Description Text Plane ===
      const descCanvas = document.createElement("canvas");
      descCanvas.width = 512;
      descCanvas.height = 128;
      const descCtx = descCanvas.getContext("2d");

      descCtx.fillStyle = "rgba(255,255,255,0.9)";
      descCtx.fillRect(0, 0, descCanvas.width, descCanvas.height);
      descCtx.fillStyle = "#1b062c";
      descCtx.font = "24px Arial";
      descCtx.fillText(shop.description, 20, 120);


      const descTexture = new THREE.CanvasTexture(descCanvas);
      const descMaterial = new THREE.MeshBasicMaterial({
        map: descTexture,
        transparent: true,
      });
      const descPlane = new THREE.Mesh(new THREE.PlaneGeometry(2, 0.5), descMaterial);
      descPlane.visible = true;

      descPlane.scale.set(1, 1, 1);
      descPlane.position.set(0, 0.4, 0.1);

      anchor.group.add(descPlane);

      // === Button Plane ===
      const btnCanvas = document.createElement("canvas");
      btnCanvas.width = 256;
      btnCanvas.height = 128;
      const btnCtx = btnCanvas.getContext("2d");

      btnCtx.fillStyle = "#2e0362";
      btnCtx.fillRect(0, 0, btnCanvas.width, btnCanvas.height);
      btnCtx.fillStyle = "white";
      btnCtx.font = "bold 20px Arial";
      btnCtx.fillText("It is my Destination", 50, 70);

      const btnTexture = new THREE.CanvasTexture(btnCanvas);
      btnTexture.needsUpdate = true;

      const btnMaterial = new THREE.MeshBasicMaterial({
        map: btnTexture,
        transparent: true,
        depthTest: false,
        depthWrite: false,
      });
      btnMaterial.depthTest = false;
      btnMaterial.depthWrite = false;
      btnMaterial.side = THREE.DoubleSide;

      const btnPlane = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.4), btnMaterial);
      btnPlane.position.set(0, -0.3, 0.5);
      btnPlane.userData.clicked = false; // like useState(false)
      btnPlane.userData.hovered = false;

      btnPlane.userData.location = shop.location;
      btnPlane.frustumCulled = false;
      btnPlane.matrixAutoUpdate = true;

      anchor.group.add(btnPlane);
      btnPlane.visible = true;


      btnPlane.scale.set(0.5, 0.25, 1);

      descTexture.needsUpdate = true;
      btnTexture.needsUpdate = true;


      clickableObjects.push(btnPlane);

      // Anchor activation
      anchor.onTargetFound = () => {
        console.log(`Target found: ${shop.description}`);

        btnPlane.visible = true;
        descPlane.visible = true;
      };

      anchor.onTargetLost = () => {
        console.log(`Target lost: ${shop.description}`);

        btnPlane.visible = false;
        descPlane.visible = false;
      };

    });
    await mindarThree.start();
    renderer.domElement.classList.add("pointer-events-auto");
    const canvas = renderer.domElement;

    // Ensure canvas is styled to receive pointer events
    canvas.style.pointerEvents = "auto";
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.zIndex = "50"; // Make sure it's above others

    // Optional: explicitly set class in case your Tailwind layout is interfering
    canvas.classList.add("pointer-events-auto");
    canvas.addEventListener("click", handleClick);
    console.log("Canvas click listener added");

    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });

    renderer.domElement.addEventListener("click", handleClick);
  };

  function onWindowResize() {

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize( window.innerWidth, window.innerHeight );

	}

  startMindAR();

  return () => {

    if (mindarThree) {
    try {
      mindarThree.stop();
    } catch (e) {
      console.warn("Error stopping MindAR:", e);
    }
    }
    if (renderer) {
      renderer.setAnimationLoop(null);
      if (renderer.domElement) {
        renderer.domElement.removeEventListener("click", handleClick);
      }
    }
  };
}, [navigate]);

  return (
    <div ref={containerRef} id="mindar-container" className="w-full h-full fixed absolute top-0 left-0 z-10 ">
    </div>
  );
};

export default RecognitionPage;
