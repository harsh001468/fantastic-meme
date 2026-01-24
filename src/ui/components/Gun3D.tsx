import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const Gun3D: React.FC = () => {
    const mountRef = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = React.useState(false);

    useEffect(() => {
        const handleToggle = (e: any) => {
            setVisible(e.detail.visible);
        };
        window.addEventListener('toggle-3d-gun', handleToggle);
        return () => window.removeEventListener('toggle-3d-gun', handleToggle);
    }, []);

    useEffect(() => {
        if (!mountRef.current || !visible) return;

        // Scene
        const scene = new THREE.Scene();
        // background is transparent by default if logic is correct below

        // Camera
        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
        camera.position.set(0, 0, 2);

        // Renderer
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        mountRef.current.appendChild(renderer.domElement);

        // Lights
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
        hemiLight.position.set(0, 20, 0);
        scene.add(hemiLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(3, 10, 10);
        dirLight.castShadow = true;
        scene.add(dirLight);

        // --- GUN MODEL (Procedural AK-47) ---
        const gunGroup = new THREE.Group();

        // Materials
        const woodMat = new THREE.MeshStandardMaterial({ color: 0x5c3a21, roughness: 0.6 });
        const metalMat = new THREE.MeshStandardMaterial({ color: 0x2b2b2b, metalness: 0.8, roughness: 0.2 });
        const blackMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });

        // Receiver
        const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.15, 0.6), metalMat);
        gunGroup.add(receiver);

        // Top Cover
        const topCover = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.6, 8, 1, false, 0, Math.PI), metalMat);
        topCover.rotation.z = Math.PI / 2;
        topCover.rotation.y = Math.PI / 2;
        topCover.position.y = 0.075;
        gunGroup.add(topCover);

        // Barrel
        const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 1.0, 16), metalMat);
        barrel.rotation.x = Math.PI / 2;
        barrel.position.set(0, 0.05, -0.6); // Extends forward (-z)
        gunGroup.add(barrel);

        // Gas Tube (above barrel)
        const gasTube = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.6, 16), woodMat);
        gasTube.rotation.x = Math.PI / 2;
        gasTube.position.set(0, 0.1, -0.5);
        gunGroup.add(gasTube);

        // Handguards
        const handguardLower = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.45), woodMat);
        handguardLower.position.set(0, -0.02, -0.55);
        gunGroup.add(handguardLower);

        // Stock
        const stock = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.2, 0.6), woodMat);
        stock.position.set(0, -0.1, 0.6);
        stock.rotation.x = -0.2; // Angled down
        gunGroup.add(stock);

        // Magazine (Curved approximation)
        const magShape = new THREE.BoxGeometry(0.08, 0.6, 0.25);
        const mag = new THREE.Mesh(magShape, new THREE.MeshStandardMaterial({ color: 0xd35400 })); // Bakelite Orange/Brown
        mag.position.set(0, -0.35, 0.1);
        mag.rotation.x = 0.4; // Curved forward Look
        gunGroup.add(mag);

        // Grip
        const grip = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.3, 0.12), woodMat);
        grip.position.set(0, -0.25, 0.35);
        grip.rotation.x = -0.3;
        gunGroup.add(grip);

        // Front Sight
        const fs = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.1, 0.02), metalMat);
        fs.position.set(0, 0.12, -1.0);
        gunGroup.add(fs);

        // Position the entire gun for FPS view (Bottom Right)
        gunGroup.position.set(0.4, -0.4, -0.8);
        gunGroup.rotation.y = -0.05; // Point slightly inwards
        scene.add(gunGroup);


        // Animation Loop
        let frameId = 0;
        const clock = new THREE.Clock();

        const animate = () => {
            frameId = requestAnimationFrame(animate);
            const time = clock.getElapsedTime();

            // Breathing / Idle Sway
            const swayX = Math.sin(time * 1.0) * 0.005;
            const swayY = Math.sin(time * 2.0) * 0.005;

            gunGroup.position.x = 0.4 + swayX;
            gunGroup.position.y = -0.4 + swayY;
            gunGroup.rotation.z = swayX * 0.5;

            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            cancelAnimationFrame(frameId);
            window.removeEventListener('resize', handleResize);
            if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
            renderer.dispose();
            // Dispose geometries/materials ideally
        };
    }, []);

    return (
        <div
            ref={mountRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 5
            }}
        />
    );
};

export default Gun3D;
