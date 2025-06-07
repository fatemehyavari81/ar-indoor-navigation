import React, { useState, useEffect } from "react";
import "aframe";
import "aframe-extras";

const ARScene = () => {
  // const [start, setStart] = useState([-2.19537, 0, 1.50223]);
  // const [end, setEnd] = useState([1.901, 0.2, -1.328]);
  // const [userPosition, setUserPosition] = useState([-2.19537, 0, 1.50223]);
  // const [cameraPosition, setCameraPosition] = useState([-2.19537, -0.5, 2.5]);

  // const [pathPoints, setPathPoints] = useState([
  //   [-2.19537, 0, 1.50223],
  //   [-1.38386, 0, 0.91384],
  //   [-1.273, 0, 0.746],
  //   [-0.046, 0, 0.821],
  //   [1.08, 0, 0.821],
  //   [1.08, 0, 0.146],
  //   [1.08, 0, -0.623],
  //   [1.314, 0, -0.847],
  //   [2.163, 0, -1.436],
  //   [1.8, 0, -1.2], // Stop point near the destination
  // ]);


    // {/* Floor 2 Coordinates */}
    const [start, setStart] = useState([-2.311, 0, -1.413]);
    const [end, setEnd] = useState([2.261, 0.2, 1.121]);
    const [userPosition, setUserPosition] = useState([-2.311, 0, -1.413]);
    const [cameraPosition, setCameraPosition] = useState([-2.311, -0.5, 0.087]); // Camera starting position


    const [pathPoints, setPathPoints] = useState([
      [-2.311, 0, -1.413],
      [-1.654, 0, -0.783],
      [-1.312, 0, -0.783],
      [-1.312, 0, -0.140],
      [-1.312, 0, 0.730],
      [-0.255, 0, 0.730],
      [1.306, 0, 0.730],
      [2.265, 0, 1.102]]);

  // Function to generate intermediate points for smoother path
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
      const numCubes = 8 * num; // Number of cubes to add between each point

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

  // Movement Effect for User and Camera
  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < smoothPathPoints.length - 1) {
        const [x, , z] = smoothPathPoints[currentIndex];
        setUserPosition([x, 0, z]);
        // setCameraPosition([x - 1.2 , -0.8, z - 1]); //floor2
        // setCameraPosition([x - 0.5 , -0.8, z + 1.5]); // floor1

        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 2000 / (pathPoints.length * 4)); // Movement duration

    return () => clearInterval(interval);
  }, []);

  const textPosition = (point) => {
    return point === start
      ? [point[0], point[1] + 0.4, point[2]]
      : [point[0] - 2 , point[1] + 3, point[2] -1];
  };

  return (

    <a-scene embedded arjs>


      {/* Floor
      <a-entity
        geometry="primitive: plane; width: 7; height: 5"
        material="src: url(/maps/1.jpg); repeat: 1 1; shader: standard"
        rotation="-90 0 0"
        position="0 0 0"
      ></a-entity> */}

       {/* Floor 2  */}
       <a-entity geometry="primitive: plane; width: 7; height: 5"
                 material="src: url(/maps/2.jpg); repeat: 1 1; shader: standard"
                 rotation="-90 0 0" position="0 0 0"
      ></a-entity>


      {/* Camera */}

      <a-entity rotation="-20 0 0">
        <a-camera   id="camera" position="-0.5 2.5 6" ></a-camera>

      </a-entity>

      {/* Start Point */}
      <a-entity>
        <a-box
          width="0.15"
          height="0.15"
          depth="0.15"
          material="color: rgb(0, 203, 248); shader: standard"
          position={start.join(" ")}
          animation="property: rotation; to: 0 360 0; loop: true; dur: 4000"
        ></a-box>
        <a-text
          value="Start"
          scale="0.9 0.9 0.9"
          align="center"
          position={textPosition(start).join(" ")}
          color="rgb(3, 139, 173)"
          animation="property: rotation; to: 0 360 0; loop: true; dur: 4000"
        ></a-text>
      </a-entity>

      {smoothPathPoints.map((position, index) => (
        <a-entity
          key={`cube-${index}`}
          geometry="primitive: box; width: 0.1; height: 0.1; depth: 0.1"
          material={`color: ${
            position[0] < 0 ? "rgb(230, 74, 25)" : "rgb(187, 227, 236)"
          }; opacity: 0.9`}
          position={position.join(" ")}
          animation={`property: material.opacity; to: 0.2; dur: 100; delay: ${
            index * 100
          }`}
          animation__2={`property: material.opacity; to: 0.8; dur: 100; delay: ${
            smoothPathPoints.length / 2 + index * 100
          }`}
        ></a-entity>
      ))}


      {/* End Point */}
      <a-entity
        gltf-model="models/map_pointer_3d_icon.glb"
        position={end.join(" ")}
        scale="0.1 0.1 0.1"
        animation="property: scale; to: 0.14 0.14 0.14; loop: true; dur: 1000; easing: easeInOutSine"
      >
        <a-text
          value="Destination"
          scale="2.8 2.8 2.8"
          align="center"
          position={textPosition(end).join(" ")}
          color="rgb(169, 16, 16)"
          rotation="0 360 0"
        ></a-text>
      </a-entity>

      {/* User */}
      <a-entity
        position={userPosition.join(" ")}
        gltf-model="models/user_3d_icon.glb"
        scale="0.15 0.15 0.15"
      ></a-entity>

    </a-scene>
  );
};

export default ARScene;

