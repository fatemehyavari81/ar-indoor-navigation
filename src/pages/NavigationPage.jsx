import  { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { ARButton } from "three/addons/webxr/ARButton.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { useNavigate } from 'react-router-dom';


const NavigationPage = () => {
  const containerRef = useRef();
  const [distance, setDistance] = useState(0);
  const navigate = useNavigate();


  useEffect(() => {
    let camera, scene, renderer, controller, originGroup;

    // const pathPoints = [
    //   [0, 0, -1, 0],
    //   [1, 0, -1.1, 1],
    //   [1, 0, -1.25, 1],
    //   [0, 0, -1.4, 2],
    //   [0, 0, -1.6, 2],
    //   [-1, 0, -1.8, 2],
    //   [-1, 0, -2, 2]
    // ];
    const startPoint = [0, 0, 0, 0];

    const getStoredDestination = () => {
      try {
        const stored = localStorage.getItem('selectedDestination');
        if (!stored) return [0, 0, 0, 0];
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length >= 3) {
          if (parsed.length === 3) return [...parsed, 0];
          return parsed;
        }
        return [0, 0, 0, 0];
      } catch (err) {
        console.error('Failed to parse selectedDestination from localStorage', err);
        return [0, 0, 0, 0];
      }
    };

    const endPoint = getStoredDestination();

    console.log("end point: ", endPoint);

    const generatePathPoints = (start, end, count = 10) => {
      const points = [];
      for (let i = 0; i <= count; i++) {
        const t = i / count;
        const x = start[0] + t * (end[0] - start[0]);
        const y = start[1] + t * (end[1] - start[1]);
        const z = start[2] + t * (end[2] - start[2]);
        points.push([x, y, z]);
      }
      return points;
    };

    const pathPoints = generatePathPoints(startPoint, endPoint);
    console.log("path", pathPoints);

    const init = () => {
      const container = containerRef.current;

      // Scene setup
      scene = new THREE.Scene();
      originGroup = new THREE.Group();
      scene.add(originGroup);

      camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

      const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 3);
      light.position.set(0.5, 1, 0.25);
      scene.add(light);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.xr.enabled = true;
      container.appendChild(renderer.domElement);

      container.appendChild(ARButton.createButton(renderer));
      renderer.domElement.style.display = "none";

      controller = renderer.xr.getController(0);
      scene.add(controller);

      initDistanceDisplay();

      visualizePath(smoothPathPoints);
      addDestinationMarker(smoothPathPoints[smoothPathPoints.length - 1]);

      window.addEventListener("resize", onWindowResize);
      renderer.setAnimationLoop(animate);
    };

    const generateIntermediatePoints = (points) => {
      const newPoints = [];
      for (let i = 0; i < points.length - 1; i++) {
        const start = points[i];
        const end = points[i + 1];
        const num = Math.sqrt(
          Math.pow(end[0] - start[0], 2) +
            Math.pow(end[1] - start[1], 2) +
            Math.pow(end[2] - start[2], 2)
        );
        const numCubes = 8 * num;

        for (let j = 0; j <= numCubes; j++) {
          const x = start[0] + (j * (end[0] - start[0])) / (numCubes + 1);
          const y = start[1] + (j * (end[1] - start[1])) / (numCubes + 1);
          const z = start[2] + (j * (end[2] - start[2])) / (numCubes + 1);
          newPoints.push([x, y, z]);
        }
      }
      return newPoints;
    };

    const smoothPathPoints = generateIntermediatePoints(pathPoints);



    const visualizePath = (smoothPathPoints) => {
      const gltfLoader = new GLTFLoader();
      let messageShown = false;


      smoothPathPoints.forEach(([x, y, z, d], index) => {
        if (index === 0) return;
        const currentPoint = new THREE.Vector3(x, y, z);
        const previousPoint = new THREE.Vector3(
          smoothPathPoints[index - 1][0],
          smoothPathPoints[index - 1][1],
          smoothPathPoints[index - 1][2]
        );
        const direction = new THREE.Vector3(
          currentPoint.x - previousPoint.x,
          currentPoint.y - previousPoint.y,
          currentPoint.z - previousPoint.z
        );

        const angleY = Math.atan2(direction.x, direction.z);
        console.log("angle", angleY);

          gltfLoader.load("/models/direction_arrows.glb", (gltf) => {
          const arrowModel = gltf.scene.clone();
          arrowModel.position.set(x, y, z);
          arrowModel.scale.set(0.02, 0.02, 0.02);
          arrowModel.rotation.y = angleY + Math.PI/2 ;
          arrowModel.traverse((child) => {
            if (child.isMesh) {
              child.material = new THREE.MeshBasicMaterial({ color: 0x9370DB });
            }
          });

          console.log("rotation", arrowModel.rotation.y);

          // Change color if x < 0
          if (x < 0) {
            arrowModel.traverse((child) => {
              if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({ color: 0xe64a19 });
              }
            });

            if (!messageShown) {
              const spriteMaterial = new THREE.SpriteMaterial({
                map: createTextTexture("The path is only for managers!", 256, 64),
                transparent: true,
              });
              const sprite = new THREE.Sprite(spriteMaterial);
              sprite.position.set(x, y + 0.3, z);
              sprite.scale.set(0.5, 0.15, 1);
              scene.add(sprite);

              messageShown = true;
            }
          }
          else {
            messageShown = false;
          }
          scene.add(arrowModel);
        });
      });
    };

    const addDestinationMarker = (endPoint) => {
      const [x, y, z] = endPoint;

      const gltfLoader = new GLTFLoader();
      gltfLoader.load("/models/map_pointer_3d_icon.glb", (gltf) => {
        const model = gltf.scene;
        model.position.set(x, y + 0.1, z);
        model.scale.set(0.02, 0.02, 0.02);
        model.traverse((child) => {
            if (child.isMesh) {
              child.material = new THREE.MeshBasicMaterial({ color: 0x4B0082 });
            }
        });
        originGroup.add(model);

        const spriteMaterial = new THREE.SpriteMaterial({
          map: createTextTexture("Destination", 128, 32),
          transparent: true,
        });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.position.set(x, y + 0.2, z);
        sprite.scale.set(0.3, 0.1, 1);


        originGroup.add(sprite);
      });
    };

    const createTextTexture = (text, width, height) => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");
      context.fillStyle = "#4B0082";
      context.font = "16px Arial";
      context.textAlign = "center";
      context.fillText(text, width / 2, height / 2 + 6);

      return new THREE.CanvasTexture(canvas);
    };

    const createDistanceTexture = (text) => {
      const canvas = document.createElement("canvas");
      canvas.width = 128;
      canvas.height = 32;

      const context = canvas.getContext("2d");
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "rgb(43, 5, 83)";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "white";
      context.font = "bold 18px Arial";
      context.textAlign = "center";
      context.fillText(text, canvas.width / 2, canvas.height / 2 + 6);

      return new THREE.CanvasTexture(canvas);
    };


    let distanceSprite, distanceTexture;

    const initDistanceDisplay = () => {
      distanceTexture = createDistanceTexture("0.00m");

      const spriteMaterial = new THREE.SpriteMaterial({
        map: distanceTexture,
        transparent: true,
      });

      distanceSprite = new THREE.Sprite(spriteMaterial);
      distanceSprite.scale.set(0.3, 0.1, 1);
      scene.add(distanceSprite);
    };

    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    const updateDistanceDisplay = (distance) => {
      const context = distanceTexture.image.getContext("2d");
      context.clearRect(0, 0, 128, 32);
      context.fillStyle = "rgb(43, 5, 83)";
      context.fillRect(0, 0, 128, 32);
      context.fillStyle = "white";
      context.font = "bold 18px Arial";
      context.textAlign = "center";
      context.fillText(`${distance.toFixed(2)}m`, 64, 22);

      distanceTexture.needsUpdate = true;
    };
    const animate = () => {
      const userPosition = camera.position;
      const destinationPosition = new THREE.Vector3(...smoothPathPoints[smoothPathPoints.length - 1]);
      const distance = userPosition.distanceTo(destinationPosition);

      setDistance(distance.toFixed(2));
      updateDistanceDisplay(distance);

      const cameraDirection = new THREE.Vector3();
      camera.getWorldDirection(cameraDirection);

      const cameraRight = new THREE.Vector3();
      cameraRight.crossVectors(camera.up, cameraDirection).normalize();

      const cameraUp = new THREE.Vector3();
      cameraUp.copy(camera.up).normalize();

      distanceSprite.position.copy(camera.position)
        .add(cameraDirection.multiplyScalar(1.5))
        .add(cameraUp.multiplyScalar(0.7))

      renderer.render(scene, camera);
    };

    init();

    return () => {
      window.removeEventListener("resize", onWindowResize);
      renderer.setAnimationLoop(null);
    };
  }, []);

  return (
    <div ref={containerRef}>
      <button type="button" class="text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 shadow-lg shadow-purple-500/50 dark:shadow-lg dark:shadow-purple-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 " onClick={() => navigate('/recognition')}> Change Destination </button>

     </div>
  );
};

export default NavigationPage;



// import { useEffect, useRef, useState } from "react";
// import * as THREE from "three";
// import { ARButton } from "three/addons/webxr/ARButton.js";
// import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
// import { useNavigate } from "react-router-dom";

// const NavigationPage = () => {
//   const containerRef = useRef();
//   const [distance, setDistance] = useState(0);
//   const navigate = useNavigate();

//   useEffect(() => {
//     let camera, scene, renderer, controller, originGroup;
//     let arrowsGroup;
//     let destinationMarker;
//     let distanceSprite, distanceTexture;
//     let lastPathUpdateTime = 0;

//     // Get destination once
//     const getStoredDestination = () => {
//       try {
//         const stored = localStorage.getItem("selectedDestination");
//         if (!stored) return [0, 0, 0, 0];
//         const parsed = JSON.parse(stored);
//         if (Array.isArray(parsed) && parsed.length >= 3) {
//           if (parsed.length === 3) return [...parsed, 0];
//           return parsed;
//         }
//         return [0, 0, 0, 0];
//       } catch (err) {
//         console.error("Failed to parse selectedDestination from localStorage", err);
//         return [0, 0, 0, 0];
//       }
//     };

//     const endPoint = getStoredDestination();

//     // Path generation function remains same
//     const generatePathPoints = (start, end, count = 10) => {
//       const points = [];
//       for (let i = 0; i <= count; i++) {
//         const t = i / count;
//         const x = start[0] + t * (end[0] - start[0]);
//         const y = start[1] + t * (end[1] - start[1]);
//         const z = start[2] + t * (end[2] - start[2]);
//         points.push([x, y, z]);
//       }
//       return points;
//     };

//     // Generate intermediate points for smoother arrows
//     const generateIntermediatePoints = (points) => {
//       const newPoints = [];
//       for (let i = 0; i < points.length - 1; i++) {
//         const start = points[i];
//         const end = points[i + 1];
//         const num = Math.sqrt(
//           Math.pow(end[0] - start[0], 2) +
//             Math.pow(end[1] - start[1], 2) +
//             Math.pow(end[2] - start[2], 2)
//         );
//         const numCubes = 8 * num;

//         for (let j = 0; j <= numCubes; j++) {
//           const x = start[0] + (j * (end[0] - start[0])) / (numCubes + 1);
//           const y = start[1] + (j * (end[1] - start[1])) / (numCubes + 1);
//           const z = start[2] + (j * (end[2] - start[2])) / (numCubes + 1);
//           newPoints.push([x, y, z]);
//         }
//       }
//       return newPoints;
//     };

//     const createTextTexture = (text, width, height) => {
//       const canvas = document.createElement("canvas");
//       canvas.width = width;
//       canvas.height = height;

//       const context = canvas.getContext("2d");
//       context.fillStyle = "#4B0082";
//       context.font = "16px Arial";
//       context.textAlign = "center";
//       context.fillText(text, width / 2, height / 2 + 6);

//       return new THREE.CanvasTexture(canvas);
//     };

//     const createDistanceTexture = (text) => {
//       const canvas = document.createElement("canvas");
//       canvas.width = 128;
//       canvas.height = 32;

//       const context = canvas.getContext("2d");
//       context.clearRect(0, 0, canvas.width, canvas.height);
//       context.fillStyle = "rgb(43, 5, 83)";
//       context.fillRect(0, 0, canvas.width, canvas.height);
//       context.fillStyle = "white";
//       context.font = "bold 18px Arial";
//       context.textAlign = "center";
//       context.fillText(text, canvas.width / 2, canvas.height / 2 + 6);

//       return new THREE.CanvasTexture(canvas);
//     };

//     const initDistanceDisplay = () => {
//       distanceTexture = createDistanceTexture("0.00m");

//       const spriteMaterial = new THREE.SpriteMaterial({
//         map: distanceTexture,
//         transparent: true,
//       });

//       distanceSprite = new THREE.Sprite(spriteMaterial);
//       distanceSprite.scale.set(0.3, 0.1, 1);
//       scene.add(distanceSprite);
//     };

//     // Create or update arrows for the path
//     const gltfLoader = new GLTFLoader();

//     // Remove old arrows if any
//     const clearArrows = () => {
//       if (arrowsGroup) {
//         originGroup.remove(arrowsGroup);
//         arrowsGroup.traverse((obj) => {
//           if (obj.geometry) obj.geometry.dispose();
//           if (obj.material) obj.material.dispose();
//         });
//       }
//       arrowsGroup = new THREE.Group();
//       originGroup.add(arrowsGroup);
//     };

//     const visualizePath = (smoothPathPoints) => {
//       clearArrows();
//       let messageShown = false;

//       smoothPathPoints.forEach(([x, y, z, d], index) => {
//         if (index === 0) return;
//         const currentPoint = new THREE.Vector3(x, y, z);
//         const previousPoint = new THREE.Vector3(
//           smoothPathPoints[index - 1][0],
//           smoothPathPoints[index - 1][1],
//           smoothPathPoints[index - 1][2]
//         );
//         const direction = new THREE.Vector3().subVectors(currentPoint, previousPoint);

//         const angleY = Math.atan2(direction.x, direction.z);

//         gltfLoader.load("/models/direction_arrows.glb", (gltf) => {
//           const arrowModel = gltf.scene.clone();
//           arrowModel.position.set(x, y, z);
//           arrowModel.scale.set(0.02, 0.02, 0.02);
//           arrowModel.rotation.y = angleY + Math.PI / 2;

//           arrowModel.traverse((child) => {
//             if (child.isMesh) {
//               child.material = new THREE.MeshBasicMaterial({ color: 0x9370db });
//             }
//           });

//           if (x < 0) {
//             arrowModel.traverse((child) => {
//               if (child.isMesh) {
//                 child.material = new THREE.MeshStandardMaterial({ color: 0xe64a19 });
//               }
//             });

//             if (!messageShown) {
//               const spriteMaterial = new THREE.SpriteMaterial({
//                 map: createTextTexture("The path is only for managers!", 256, 64),
//                 transparent: true,
//               });
//               const sprite = new THREE.Sprite(spriteMaterial);
//               sprite.position.set(x, y + 0.3, z);
//               sprite.scale.set(0.5, 0.15, 1);
//               arrowsGroup.add(sprite);

//               messageShown = true;
//             }
//           } else {
//             messageShown = false;
//           }

//           arrowsGroup.add(arrowModel);
//         });
//       });
//     };

//     // Add destination marker (only once)
//     const addDestinationMarker = () => {
//       if (destinationMarker) {
//         originGroup.remove(destinationMarker);
//         destinationMarker.traverse((obj) => {
//           if (obj.geometry) obj.geometry.dispose();
//           if (obj.material) obj.material.dispose();
//         });
//       }

//       destinationMarker = new THREE.Group();

//       const [x, y, z] = endPoint;

//       gltfLoader.load("/models/map_pointer_3d_icon.glb", (gltf) => {
//         const model = gltf.scene;
//         model.position.set(x, y + 0.1, z);
//         model.scale.set(0.02, 0.02, 0.02);
//         model.traverse((child) => {
//           if (child.isMesh) {
//             child.material = new THREE.MeshBasicMaterial({ color: 0x4b0082 });
//           }
//         });

//         destinationMarker.add(model);

//         const spriteMaterial = new THREE.SpriteMaterial({
//           map: createTextTexture("Destination", 128, 32),
//           transparent: true,
//         });
//         const sprite = new THREE.Sprite(spriteMaterial);
//         sprite.position.set(x, y + 0.2, z);
//         sprite.scale.set(0.3, 0.1, 1);
//         destinationMarker.add(sprite);

//         originGroup.add(destinationMarker);
//       });
//     };

//     const onWindowResize = () => {
//       camera.aspect = window.innerWidth / window.innerHeight;
//   camera.updateProjectionMatrix();
//   renderer.setSize(window.innerWidth, window.innerHeight);
// };

// const animate = () => {
//   renderer.setAnimationLoop(render);
// };

// const render = () => {
//   const currentTime = performance.now();

//   const currentPosition = new THREE.Vector3();
//   camera.getWorldPosition(currentPosition);
//   const startPoint = [currentPosition.x, currentPosition.y, currentPosition.z, 0];

//   // Only update path if enough time passed
//   if (currentTime - lastPathUpdateTime > 2000) {
//     const pathPoints = generatePathPoints(startPoint, endPoint, 10);
//     const smoothPathPoints = generateIntermediatePoints(pathPoints);
//     visualizePath(smoothPathPoints);
//     lastPathUpdateTime = currentTime;
//   }

//   const destinationVector = new THREE.Vector3(endPoint[0], endPoint[1], endPoint[2]);
//   const distanceValue = currentPosition.distanceTo(destinationVector);

//   setDistance(distanceValue);
//   distanceTexture = createDistanceTexture(`${distanceValue.toFixed(2)} m`);
//   distanceSprite.material.map = distanceTexture;
//   distanceSprite.material.needsUpdate = true;

//   distanceSprite.position.set(
//     currentPosition.x,
//     currentPosition.y + 0.15,
//     currentPosition.z
//   );

//   renderer.render(scene, camera);
// };

// const init = () => {
//   scene = new THREE.Scene();
//   camera = new THREE.PerspectiveCamera(
//     70,
//     window.innerWidth / window.innerHeight,
//     0.01,
//     20
//   );

//   renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
//   renderer.setPixelRatio(window.devicePixelRatio);
//   renderer.setSize(window.innerWidth, window.innerHeight);
//   renderer.xr.enabled = true;

//   containerRef.current.appendChild(renderer.domElement);
//   document.body.appendChild(ARButton.createButton(renderer, { requiredFeatures: ["hit-test"] }));

//   originGroup = new THREE.Group();
//   scene.add(originGroup);

//   controller = renderer.xr.getController(0);
//   scene.add(controller);

//   initDistanceDisplay();
//   addDestinationMarker();

//   window.addEventListener("resize", onWindowResize);
// };

// init();
// animate();

// return () => {
//   if (containerRef.current?.contains(renderer.domElement)) {
//     containerRef.current.removeChild(renderer.domElement);
//   }
//   window.removeEventListener("resize", onWindowResize);
// };
// }, []);

// return (
// <div ref={containerRef}>
// <p style={{ color: "#4B0082", fontWeight: "bold", fontSize: "20px" }}>
// Distance to Destination: {distance.toFixed(2)} m
// </p>
// </div>
// );
// };

// export default NavigationPage;