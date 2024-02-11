"use client"

import React, { useEffect, useRef } from "react";
import { ARButton } from "three/examples/jsm/webxr/ARButton";
import * as THREE from "three";

const HitTesting = () => {
  const containerRef = useRef();
  const camera = useRef();
  const scene = useRef();
  const renderer = useRef();
  const reticle = useRef();
  const controller = useRef();
  const hitTestSource = useRef(null);
  const localSpace = useRef(null);
  const hitTestSourceInitialized = useRef(false);

  useEffect(() => {
    const init = () => {
      containerRef.current = document.createElement("div");
      document.body.appendChild(containerRef.current);

      scene.current = new THREE.Scene();

      camera.current = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        0.01,
        20
      );

      renderer.current = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.current.setPixelRatio(window.devicePixelRatio);
      renderer.current.setSize(window.innerWidth, window.innerHeight);
      renderer.current.xr.enabled = true;
      containerRef.current.appendChild(renderer.current.domElement);

      var light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
      light.position.set(0.5, 1, 0.25);
      scene.current.add(light);

      controller.current = renderer.current.xr.getController(0);
      controller.current.addEventListener('select', onSelect);
      scene.current.add(controller.current);

      addReticleToScene();

      const button = ARButton.createButton(renderer.current, {
        requiredFeatures: ["hit-test"]
      });
      document.body.appendChild(button);
      renderer.current.domElement.style.display = "none";

      window.addEventListener("resize", onWindowResize, false);
    };

    const addReticleToScene = () => {
      const geometry = new THREE.RingGeometry(0.15, 0.2, 32).rotateX(
        -Math.PI / 2
      );
      const material = new THREE.MeshBasicMaterial();

      reticle.current = new THREE.Mesh(geometry, material);
      reticle.current.matrixAutoUpdate = false;
      reticle.current.visible = false;
      scene.current.add(reticle.current);
    };

    const onSelect = () => {
      if (reticle.current.visible) {
        const geometry = new THREE.CylinderGeometry(0, 0.05, 0.2, 32);
        const material = new THREE.MeshPhongMaterial({
          color: 0xffffff * Math.random()
        });
        const mesh = new THREE.Mesh(geometry, material);

        mesh.position.setFromMatrixPosition(reticle.current.matrix);
        mesh.quaternion.setFromRotationMatrix(reticle.current.matrix);

        scene.current.add(mesh);
      }
    };

    const onWindowResize = () => {
      camera.current.aspect = window.innerWidth / window.innerHeight;
      camera.current.updateProjectionMatrix();

      renderer.current.setSize(window.innerWidth, window.innerHeight);
    };

    const animate = () => {
      renderer.current.setAnimationLoop(render);
    };

    const initializeHitTestSource = async () => {
      const session = renderer.current.xr.getSession();
      const viewerSpace = await session.requestReferenceSpace("viewer");
      hitTestSource.current = await session.requestHitTestSource({ space: viewerSpace });
      localSpace.current = await session.requestReferenceSpace("local");
      hitTestSourceInitialized.current = true;

      session.addEventListener("end", () => {
        hitTestSourceInitialized.current = false;
        hitTestSource.current = null;
      });
    };

    const render = (timestamp, frame) => {
      if (frame) {
        if (!hitTestSourceInitialized.current) {
          initializeHitTestSource();
        }

        if (hitTestSourceInitialized.current) {
          const hitTestResults = frame.getHitTestResults(hitTestSource.current);

          if (hitTestResults.length > 0) {
            const hit = hitTestResults[0];
            const pose = hit.getPose(localSpace.current);

            reticle.current.visible = true;
            reticle.current.matrix.fromArray(pose.transform.matrix);
          } else {
            reticle.current.visible = false;
          }
        }

        renderer.current.render(scene.current, camera.current);
      }
    };

    init();
    animate();

    return () => {
      // Clean up code (if needed)
    };
  }, []);

  return <div ref={containerRef}></div>;
};

export default HitTesting;
