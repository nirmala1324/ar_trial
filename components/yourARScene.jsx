"use client";

import React, { useEffect } from "react";
import * as THREE from "three";
import { ARButton } from "three/examples/jsm/webxr/ARButton";

const YourARScene = () => {
  let camera, scene, renderer;
  let mesh;

  useEffect(() => {
    init();
    animate();

    // Cleanup function
    return () => {
      // Clean up resources if needed
    };
  }, []);

  function init() {
    const container = document.createElement("div");
    document.body.appendChild(container);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.01,
      40
    );

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true; // Enable WebXR
    container.appendChild(renderer.domElement);

    var light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    light.position.set(0.5, 1, 0.25);
    scene.add(light);

    const geometry = new THREE.IcosahedronGeometry(0.1, 1);
    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color("rgb(226,35,213)"),
      shininess: 6,
      flatShading: true,
      transparent: 1,
      opacity: 0.8,
    });

    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, 0, -0.5);
    scene.add(mesh);

    document.body.appendChild(ARButton.createButton(renderer));

    window.addEventListener("resize", onWindowResize, false);

  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function animate() {
    renderer.setAnimationLoop(render);
  }

  function render() {
    renderer.render(scene, camera);
  }

  return null; // You can return any JSX here if needed
};

export default YourARScene;
