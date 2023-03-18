import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

// const renderer = new THREE.WebGLRenderer({ antialias: true });
// renderer.setSize(window.innerWidth, window.innerHeight);
// document.body.appendChild(renderer.domElement);

const urlParams=new URLSearchParams(window.location.search);
const myParam = urlParams.get('texture');
console.log(myParam);

const TRAY = document.getElementById("js-tray-slide");


const colors = [
  {
    texture: "/assets/flowers.jpg",
    size: [2, 2, 2],
    shininess: 60,
  },
  {
    texture: "/assets/flower2.jpg",
    size: [3, 3, 3],
    shininess: 0,
  },
  {
    color: "66533C",
  },
  {
    color: "173A2F",
  },
  {
    color: "153944",
  },
  {
    color: "27548D",
  },
  {
    color: "438AAC",
  },
  {
    texture: myParam,
  }
];

const BACKGROUND_COLOR = 0xf1f1f1;

// Init the scene
const scene = new THREE.Scene();

// Set background
scene.background = new THREE.Color(BACKGROUND_COLOR);
//scene.fog = new THREE.Fog(BACKGROUND_COLOR, 20, 100);

const canvas = document.querySelector("#c");

// Init the renderer
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.shadowMap.enabled = true;
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Add a camera
var camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.set(0, 0, 250);


var theModel;
var gltfLoader = new GLTFLoader();

const INITIAL_MTL = new THREE.MeshPhongMaterial({ color: 0x808080, shininess: 10 });

const INITIAL_MAP = [{ childID: "defaultMaterial", mtl: INITIAL_MTL }];

// Function - Add the textures to the models
function initColor(parent, type, mtl) {
  parent.traverse((o) => {
    if (o.isMesh) {
      if (o.name.includes(type)) {
        o.material = mtl;
        o.nameID = type; // Set a new property to identify this object
      }
    }
  });
}

gltfLoader.load("/assets/gown/scene.gltf", function (gltf) {
  theModel = gltf.scene;
  theModel.position.y = -70;
  // Add the model to the scene
  theModel.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });

  // Set initial textures
  for (let object of INITIAL_MAP) {
    initColor(theModel, object.childID, object.mtl);
  }
  scene.add(theModel);
});

// Add lights
var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.61);
hemiLight.position.set(0, 50, 0);
// Add hemisphere light to scene
scene.add(hemiLight);

var dirLight = new THREE.DirectionalLight(0xffffff, 0.54);
dirLight.position.set(-8, 12, 8);
dirLight.castShadow = true;
dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
// Add directional Light to scene
scene.add(dirLight);

var floorGeometry = new THREE.PlaneGeometry(5000, 5000, 1, 1);
var floorMaterial = new THREE.MeshPhongMaterial({
  color: 0xeeeeee,
  shininess: 0,
});

// var floor = new THREE.Mesh(floorGeometry, floorMaterial);
// floor.rotation.x = -0.5 * Math.PI;
// floor.receiveShadow = true;
// floor.position.y = -60;
// scene.add(floor);

var orbit = new OrbitControls(camera, renderer.domElement);
// orbit.maxPolarAngle = Math.PI / 2;
// orbit.minPolarAngle = Math.PI / 3;
// orbit.enableDamping = true;
// orbit.enablePan = false;
// orbit.dampingFactor = 0.1;
// orbit.autoRotate = false; // Toggle this if you'd like the chair to automatically rotate
// orbit.autoRotateSpeed = 0.2; // 30
orbit.update();

function animate() {
  renderer.render(scene, camera);
  requestAnimationFrame(animate);

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }
}

animate();

function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  var width = window.innerWidth;
  var height = window.innerHeight;
  var canvasPixelWidth = canvas.width / window.devicePixelRatio;
  var canvasPixelHeight = canvas.height / window.devicePixelRatio;

  const needResize = canvasPixelWidth !== width || canvasPixelHeight !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}

// Function - Build Colors
function buildColors(colors) {
  for (let [i, color] of colors.entries()) {
    let swatch = document.createElement("div");
    swatch.classList.add("tray__swatch");

    if (color.texture) {
      swatch.style.backgroundImage = "url(" + color.texture + ")";
    } else {
      swatch.style.background = "#" + color.color;
    }

    swatch.setAttribute("data-key", i);
    TRAY.append(swatch);
  }
}
buildColors(colors);
// Swatches
const swatches = document.querySelectorAll(".tray__swatch");

for (const swatch of swatches) {
  swatch.addEventListener("click", selectSwatch);
}

function selectSwatch(e) {
  let color = colors[parseInt(e.target.dataset.key)];
  let new_mtl;

  if (color.texture) {
    let txt = new THREE.TextureLoader().load(color.texture);

    txt.repeat.set(color.size[0], color.size[1], color.size[2]);
    txt.wrapS = THREE.RepeatWrapping;
    txt.wrapT = THREE.RepeatWrapping;

    new_mtl = new THREE.MeshPhongMaterial({
      map: txt,
      shininess: color.shininess ? color.shininess : 10,
    });
  } else {
    new_mtl = new THREE.MeshPhongMaterial({
      color: parseInt("0x" + color.color),
      shininess: color.shininess ? color.shininess : 10,
    });
  }

  setMaterial(theModel, "defaultMaterial", new_mtl);
}

function setMaterial(parent, type, mtl) {
  parent.traverse((o) => {
    if (o.isMesh && o.nameID != null) {
      if (o.nameID == type) {
        o.material = mtl;
      }
    }
  });
}

// camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 1000);
// camera.position.set(300, 100, 0);

// renderer.setClearColor(0xa3a3a3);

// const axesHelper = new THREE.AxesHelper(5);
// scene.add(axesHelper);

// const orbit = new OrbitControls(camera, renderer.domElement);
// orbit.update();

// const gltfLoader = new GLTFLoader();
// let dress;
// gltfLoader.load("./assets/scene.gltf", function (gltf) {
//   const model = gltf.scene;
//   scene.add(model);
//   dress = model;
// });

// function animate(time) {
//   if (dress) dress.rotation.y = -time / 3000;
//   renderer.render(scene, camera);
// }

// window.addEventListener("resize", function () {
//     camera.aspect = window.innerWidth / window.innerHeight;
//     camera.updateProjectionMatrix();
//     renderer.setSize(window.innerWidth, window.innerHeight);
//   });

// renderer.setAnimationLoop(animate);

