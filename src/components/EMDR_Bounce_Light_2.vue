<script setup lang="ts">
import { onMounted, ShallowRef, shallowRef } from "vue";

//@ts-ignore
import { useRenderLoop, TresInstance } from "@tresjs/core";
import { OrbitControls } from "@tresjs/cientos";

import { useEMDRStore } from "../stores/EMDRStore";

import { useStore } from "../stores/StateStore";

import * as THREE from "three";

import gsap from "gsap";
import { PerspectiveCamera } from "three";

let bounceDirection = 1; // 1 for moving to the right, -1 for moving to the left
let bounceSpeed = 0.7; // Adjust this value to control the speed of the bounce

let Bloom_material = new THREE.MeshStandardMaterial({
  color: "#00F",
  emissive: "#00FFFF",
  emissiveIntensity: 17,
});

const boxRef: ShallowRef<TresInstance | null> = shallowRef(null);

const cameraRef: ShallowRef<PerspectiveCamera | null> = shallowRef(null);

const green = new THREE.Color("#0F0");

const red = new THREE.Color("#FF0000");

const materialColor = new THREE.Color("#00FF00"); // Set your desired material color here
const emissiveColor = new THREE.Color("#00FF00"); // Set your desired emissive color here
const emissiveIntensity = 17;

const { onLoop } = useRenderLoop();

const StateStore = useStore();

const EMDRStore = useEMDRStore();

let rotate_start = false;

function return_to_start() {
  if (!StateStore.hasChanged) {
    gsap.to(boxRef.value.position, {
      x: 0,
      duration: 0.5,
    });
  }
}

onLoop(({ delta, elapsed }) => {
  // if (boxRef.value && StateStore.hasChanged) {
  //   boxRef.value.rotation.y += delta;
  //   boxRef.value.rotation.z = elapsed * 0.2;
  // }
  if (StateStore.hasChanged) {
    boxRef.value.position.x += bounceDirection * bounceSpeed;

    // Check if Plane002 hits the right edge of the screen
    if (boxRef.value.position.x > 9) {
      bounceDirection = -1; // Reverse direction
      playFirstSound()
    }

    // Check if Plane002 hits the left edge of the screen
    if (boxRef.value.position.x < -9) {
      bounceDirection = 1; // Reverse direction
    }
  }
  if (
    (!StateStore.hasChanged && boxRef.value.position.x > 1) ||
    boxRef.value.position.x < -1
  ) {
    return_to_start();
  }
});

const soundUrls = [
  "src/assets/sounds/Broadwater Bowling Club.m4a",
  "src/assets/sounds/badlands_shorter_version.wav",
  "src/assets/sounds/Utopia_sound_short.mp3",
  // Add more sound URLs as needed
];

const audioBuffers: AudioBuffer[] = [];

const listener = new THREE.AudioListener();

function create_sound() {
  cameraRef.value?.add(listener);

  // create a global audio source
  const sound = new THREE.Audio(listener);

  // load a sound and set it as the Audio object's buffer
  soundUrls.forEach((url) => {
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load(url, function (buffer) {
      audioBuffers.push(buffer);
    });
  });
}

let currentSoundIndex = 0;

function playNextSound() {
  if (currentSoundIndex < audioBuffers.length) {
    const sound = new THREE.Audio(listener);
    sound.setBuffer(audioBuffers[currentSoundIndex]);
    sound.setLoop(false);
    sound.setVolume(0.5);
    sound.play();
    currentSoundIndex++;
  }
}

let hasStarted = false;

function playFirstSound() {
  if (!hasStarted && currentSoundIndex < audioBuffers.length) {
    const sound = new THREE.Audio(listener);
    sound.setBuffer(audioBuffers[currentSoundIndex]);
    sound.setLoop(false);
    sound.setVolume(0.5);
    sound.play();
    currentSoundIndex++;
    hasStarted = true;
  }
}


</script>

<template>
  <div
    class="canvasDiv"
    @click="
      StateStore.hasChanged = !StateStore.hasChanged;
      gsap.to('.startButtonDiv', {
        opacity: 0,
        height: '0px',
        duration: 0.0,
        onStart: () => {},
      });
      
      create_sound();
      playNextSound(); // Start playing the sounds
      
    "
    
  >
    <h1>Giant</h1>
    <TresCanvas clear-color="#000" shadows alpha>
      <TresPerspectiveCamera
        
        :position="[0, 0, 5]"
        :fov="75"
        :aspect="1"
        :near="0.1"
        :far="1000"
      />
      <TresMesh
        ref="boxRef"
        :scale="1"
        cast-shadow
        :material="Bloom_material"
        
      >
        <TresPlaneGeometry :args="[0.3, 0.3]" />
      </TresMesh>
    </TresCanvas>

    <div class="startButtonDiv" id="startButtonDivID">
      <h3>
        Suggestion: place browser in full screen mode to avoid distraction.
      </h3>
      <br />
      <h4>Click screen to start EMDR light moving.</h4>
      <br />
      Click screen again to stop EMDR light moving.
      <br />
    </div>
  </div>
</template>

<style>
.canvasDiv {
  position: relative;
  align-items: center;
  height: 100%;
  z-index: 5;
  margin: 0;
  padding: 0;
  border: 2px red solid;
}

.startButtonDiv {
  /* min-height: fit-content; */
  width: auto;
  height: auto;
  z-index: 5;
  margin: 0 auto;
  opacity: 1;
  border: 2px yellow solid;
}
</style>
