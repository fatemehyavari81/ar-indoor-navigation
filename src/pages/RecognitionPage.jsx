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
      if (!renderer || !camera) return;
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      clickableObjects.forEach((obj) => obj.updateMatrixWorld());
      const intersects = raycaster.intersectObjects(clickableObjects, true);

      if (intersects.length > 0) {
        const object = intersects[0].object;
        const destination = object.userData.location;
        if (destination) {
          localStorage.setItem("selectedDestination", JSON.stringify(destination));
          navigate("/navigation");
        }
      }
    };

    const wrapText = (ctx, text, x, y, maxWidth, lineHeight) => {
      const words = text.split(" ");
      let line = "";
      let lines = [];

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + " ";
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
          lines.push(line);
          line = words[n] + " ";
        } else {
          line = testLine;
        }
      }
      lines.push(line);
      lines.forEach((l, i) => ctx.fillText(l, x, y + i * lineHeight));
      return lines.length;
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
      scene.add(new THREE.AmbientLight(0xffffff, 1));

      const group = new THREE.Group();
      scene.add(group);

      window.addEventListener("resize", onWindowResize);

      shops.forEach((shop, i) => {
        const anchor = mindarThree.addAnchor(i);
        anchor.visible = true;

        // === Description Canvas ===

        const descCanvas = document.createElement("canvas");
        descCanvas.width = 512;

        const tempCtx = descCanvas.getContext("2d");
        tempCtx.font = "bold 24px Arial";
        const lineHeight = 30;
        const lineCount = wrapText(tempCtx, shop.description, 0, 0, 460, lineHeight);
        const height = lineCount * lineHeight + 40; // 40 = top+bottom padding
        descCanvas.height = height;

        const descCtx = descCanvas.getContext("2d");
        descCtx.fillStyle = "rgba(255,255,255,0.9)";
        descCtx.fillRect(0, 0, descCanvas.width, descCanvas.height);
        descCtx.fillStyle = "#1b062c";
        descCtx.font = "bold 24px Arial";
        wrapText(descCtx, shop.description, 20, 40, 460, lineHeight);


        const descTexture = new THREE.CanvasTexture(descCanvas);
        const descMaterial = new THREE.MeshBasicMaterial({
          map: descTexture,
          transparent: true,
        });
        const planeHeight = (height / descCanvas.width) * 2.5;
        const descPlane = new THREE.Mesh(
          new THREE.PlaneGeometry(2.5, planeHeight),
          descMaterial
        );
        descPlane.position.set(0, planeHeight / 2 + 0.3, 0.1);

        anchor.group.add(descPlane);

        // === Button Canvas ===
        const btnCanvas = document.createElement("canvas");
        btnCanvas.width = 256;
        btnCanvas.height = 128;
        const btnCtx = btnCanvas.getContext("2d");

        btnCtx.fillStyle = "#2e0362";
        btnCtx.fillRect(0, 0, btnCanvas.width, btnCanvas.height);
        btnCtx.fillStyle = "white";
        btnCtx.font = "bold 24px Arial";
        btnCtx.fillText("It is my Destination", 20, 70);

        const btnTexture = new THREE.CanvasTexture(btnCanvas);
        const btnMaterial = new THREE.MeshBasicMaterial({
          map: btnTexture,
          transparent: true,
          depthTest: false,
          depthWrite: false,
          side: THREE.DoubleSide,
        });

        const btnPlane = new THREE.Mesh(
          new THREE.PlaneGeometry(1.5, 0.4),
          btnMaterial
        );
        btnPlane.position.set(0, -0.3, 0.5);
        btnPlane.userData.location = shop.location;

        anchor.group.add(btnPlane);
        clickableObjects.push(btnPlane);

        // Anchor events
        anchor.onTargetFound = () => {
          btnPlane.visible = true;
          descPlane.visible = true;
        };

        anchor.onTargetLost = () => {
          btnPlane.visible = false;
          descPlane.visible = false;
        };
      });

      await mindarThree.start();

      const canvas = renderer.domElement;
      canvas.style.position = "absolute";
      canvas.style.top = "0";
      canvas.style.left = "0";
      canvas.style.width = "100vw";
      canvas.style.height = "100vh";
      canvas.style.zIndex = "50";
      canvas.style.pointerEvents = "auto";

      canvas.addEventListener("click", handleClick);
      renderer.setAnimationLoop(() => {
        renderer.render(scene, camera);
      });
    };

    const onWindowResize = () => {
      if (!camera || !renderer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    startMindAR();

    return () => {
      if (mindarThree) {
        try {
          mindarThree.stop();
        } catch (e) {
          console.warn("MindAR stop error:", e);
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
    <div
      ref={containerRef}
      id="mindar-container"
      className="fixed inset-0 z-10 w-screen h-screen overflow-hidden bg-black"
    />
  );
};

export default RecognitionPage;
