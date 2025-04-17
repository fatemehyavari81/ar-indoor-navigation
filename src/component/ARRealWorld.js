import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { ARButton } from "three/addons/webxr/ARButton.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import ARmap from './ARmap';
import { MindARThree } from 'mind-ar/dist/mindar-image-three.prod.js';



const ARNavigation = () => {
  const containerRef = useRef();
  const [distance, setDistance] = useState(0);


  useEffect(() => {
    let camera, scene, renderer, controller, originGroup,scanInterval ;


    const pathPoints = [
      [0, 0, -1, 0],
      [1, 0, -1.1, 1],
      [1, 0, -1.25, 1],
      [0, 0, -1.4, 2],
      [0, 0, -1.6, 2],
      [-1, 0, -1.8, 2],
      [-1, 0, -2, 2]
    ];

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
        // console.log("angle", angleY);

            gltfLoader.load("/models/direction_arrows.glb", (gltf) => {
          const arrowModel = gltf.scene.clone();
          arrowModel.position.set(x, y, z);
          arrowModel.scale.set(0.02, 0.02, 0.02);
          arrowModel.rotation.y = angleY + Math.PI/2 ;

          if (x < 0) {
            arrowModel.traverse((child) => {
              if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({ color: 0xe64a19 }); // RGB(230, 74, 25)
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
      context.fillStyle = "rgb(231, 70, 70)";
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
      context.fillStyle = "rgb(16, 6, 27)";
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
      context.fillStyle = "rgb(47, 8, 88)";
      context.fillRect(0, 0, 128, 32);
      context.fillStyle = "white";
      context.font = "bold 18px Arial";
      context.textAlign = "center";
      context.fillText(`${distance.toFixed(2)}m`, 64, 22);

      distanceTexture.needsUpdate = true;
    };

    const init = async () => {
      const container = containerRef.current;
      const mindarThree = new MindARThree({
        container,
        imageTargetSrc: "/data/targets.mind",
        maxTrack: 3,
        uiScanning: false,
        uiLoading: false
      });
      const { renderer: mindRenderer, scene: mindScene, camera: mindCamera } = mindarThree;

      // scene = new THREE.Scene();
      // originGroup = new THREE.Group();
      // scene.add(originGroup);

      scene = mindScene; // 👈 Use MindAR’s scene
      camera = mindCamera;
      renderer = mindRenderer;

      originGroup = new THREE.Group();
      scene.add(originGroup);

      camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
      directionalLight.position.set(0, 1, 0);
      scene.add(directionalLight);


      // renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
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
      addDestinationMarker(pathPoints[pathPoints.length - 1]);

      window.addEventListener("resize", onWindowResize);
      // await mindarThree.start();
      try {
        await mindarThree.start();
        console.log("AR session started successfully");


      } catch (error) {
        console.error("Failed to start AR:", error);
        // Show user-friendly error message
      }

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
        "GameDen – Consoles and gaming accessories",
      ];

      for (let i = 0; i < 10; i++) {
        const anchor = mindarThree.addAnchor(i);
        anchor.visible = true;
        anchor.onTargetFound = () => console.log("Target found:", i);
        anchor.onTargetLost = () => console.log("Target lost:", i);
        const canvas = document.createElement("canvas");
        console.log("anchor: ",anchor);
        canvas.width = 1024;
        canvas.height = 256;
        const ctx = canvas.getContext("2d");

        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#fff";
        ctx.font = "bold 48px Arial";
        ctx.fillText(descriptions[i] || `Shop ${i + 1}`, 30, 120);


        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
        const plane = new THREE.Mesh(new THREE.PlaneGeometry(2, 0.5), material);
        plane.position.set(0, 0, 0.1);
        anchor.group.add(plane);
      }


    renderer.setAnimationLoop(() => {
      const userPosition = camera.position;
      const destinationPosition = new THREE.Vector3(...pathPoints[pathPoints.length - 1]);
      const dist = userPosition.distanceTo(destinationPosition);

      setDistance(dist.toFixed(2));
      updateDistanceDisplay(dist);

      const cameraDirection = new THREE.Vector3();
      camera.getWorldDirection(cameraDirection);

      const cameraUp = new THREE.Vector3();
      cameraUp.copy(camera.up).normalize();

      distanceSprite.position.copy(camera.position)
        .add(cameraDirection.multiplyScalar(1.5))
        .add(cameraUp.multiplyScalar(0.7));

      renderer.render(scene, camera);
    });
  };


     init();

    return () => {
      window.removeEventListener("resize", onWindowResize);
      renderer.setAnimationLoop(null);
      clearInterval(scanInterval);

    };
  }, []);

  return (
    <div ref={containerRef}>
      <div className="min-h-screen bg-gray-50 flex flex-col items-left p-6">
        <p className="px-6 py-3 bg-violet-900 text-white font-medium rounded-lg hover:bg-violet-950 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2">
          See Map
        </p>
        <ARmap />
        <div className="text-center m-10">
          <h1 className="text-3xl font-bold text-violet-950">
            Welcome to AR Indoor Navigation
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Navigate indoors seamlessly with Augmented Reality. Follow the path to
            your destination!
          </p>
          <p className="text-sm text-gray-500 italic mt-4">
            Make sure your device supports AR for the best experience.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ARNavigation;