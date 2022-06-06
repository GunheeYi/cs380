import gl from "../gl.js";
import { vec3, mat4, quat, glMatrix } from "../cs380/gl-matrix.js";

import * as cs380 from "../cs380/cs380.js";

import { SimpleShader } from "../simple_shader.js";
import { LightType, Light, BlinnPhongShader } from "../blinn_phong.js";

const DEG = Math.PI / 180;

const shoulderWidth = 0.8;
const upperArmLength = 0.6;
const lowerArmLength = 0.6;
const upperArmRadius = 0.13;
const elbowRadius = 0.1;
const lowerArmRadius = 0.09;
const handRadius = 0.11;
const upperLegLength = 0.45;
const lowerLegLength = 0.9;
const upperLegRadius = 0.14;
const lowerLegRadius = 0.11;
const bootsHeight = 0.5;
const bootsLength = 0.3;
const bootsRadius = 0.13;

const flesh = [255/255, 204/255, 153/255];
const lavender = [120/255, 30/255, 255/255];
const black = [2/255, 2/255, 2/255];

export default class Assignment3 extends cs380.BaseApp {
  async initialize() {
    // Basic setup for camera
    const { width, height } = gl.canvas.getBoundingClientRect();
    const aspectRatio = width / height;
    this.camera = new cs380.Camera();
    vec3.set(this.camera.transform.localPosition, 0, 0, 8);
    mat4.perspective(
      this.camera.projectionMatrix,
      glMatrix.toRadian(45),
      aspectRatio,
      0.01,
      100
    );

    this.thingsToClear = [];

    // SimpleOrbitControl
    const orbitControlCenter = vec3.fromValues(0, 0, 0);
    this.simpleOrbitControl = new cs380.utils.SimpleOrbitControl(
      this.camera,
      orbitControlCenter
    );
    this.thingsToClear.push(this.simpleOrbitControl);

    // initialize picking shader & buffer
    const pickingShader = await cs380.buildShader(cs380.PickingShader);
    const blinnPhongShader = await cs380.buildShader(BlinnPhongShader);
    this.pickingBuffer = new cs380.PickingBuffer();
    this.pickingBuffer.initialize(width, height);
    this.thingsToClear.push(pickingShader, blinnPhongShader, this.pickingBuffer);

    // CODE START -------------------------------

    this.pressed = {};

    this.recipes = {
      body: {
        id: 1,
        meshData: cs380.primitives.generateCylinder(32, 0.3, 0.5),
        parent: null,
        color: lavender
      },
      upperBody: {
        id: 2,
        meshData: cs380.primitives.generateCone(32, shoulderWidth/2, 2),
        parent: 'body',
        color: lavender
      },
      shoulder: {
        id: 3,
        meshData: cs380.primitives.generateCone(32, shoulderWidth/2, 0.15),
        parent: 'body',
        color: flesh
      },
      neck: {
        id: 4,
        meshData: cs380.primitives.generateCylinder(32, 0.12, 0.3),
        parent: 'body',
        color: flesh,
        shininess: 200,
      },
      head: {
        id: 5,
        meshData: cs380.primitives.generateEllipsoid(32, 32, 0.25, 0.28, 0.25),
        parent: "neck",
        color: flesh,
        shininess: 200,
      },
      leftEye: {
        id: 6,
        meshData: cs380.primitives.generateCube(0.02, 0.05, 0.01),
        parent: "head",
        color: black
      },
      rightEye: {
        id: 7,
        meshData: cs380.primitives.generateCube(0.02, 0.05, 0.01),
        parent: "head",
        color: black
      },
      hair: {
        id: 8,
        meshData: cs380.primitives.generateHair(32, 32, 0.26, 0.28, 0.26, 0.4, 0.5),
        parent: "head",
        color: black
      },
      leftUpperArm: {
        id: 9,
        meshData: cs380.primitives.generateCylinder(32, upperArmRadius, upperArmLength),
        parent: "body",
        color: lavender
      },
      leftElbow: {
        id: 10,
        meshData: cs380.primitives.generateSphere(32, 32, elbowRadius),
        parent: "leftUpperArm",
        color: flesh,
        shininess: 200,
      },
      leftLowerArm: {
        id: 11,
        meshData: cs380.primitives.generateCylinder(32, lowerArmRadius, lowerArmLength),
        parent: "leftElbow",
        color: flesh,
        shininess: 200,
      },
      leftHand: {
        id: 12,
        meshData: cs380.primitives.generateSphere(32, 32, handRadius),
        parent: "leftLowerArm",
        color: flesh,
        shininess: 200,
      },
      rightUpperArm: {
        id: 13,
        meshData: cs380.primitives.generateCylinder(32, upperArmRadius, upperArmLength),
        parent: "body",
        color: lavender
      },
      rightElbow: {
        id: 14,
        meshData: cs380.primitives.generateSphere(32, 32, elbowRadius),
        parent: "rightUpperArm",
        color: flesh,
        shininess: 200,
      },
      rightLowerArm: {
        id: 15,
        meshData: cs380.primitives.generateCylinder(32, lowerArmRadius, lowerArmLength),
        parent: "rightElbow",
        color: flesh,
        shininess: 200,
      },
      rightHand: {
        id: 16,
        meshData: cs380.primitives.generateSphere(32, 32, handRadius),
        parent: "rightLowerArm",
        color: flesh,
        shininess: 200,
      },
      lowerBody: {
        id: 17,
        meshData: cs380.primitives.generateCone(32, 0.8, 2),
        parent: "body",
        color: lavender
      },
      leftUpperLeg: {
        id: 18,
        meshData: cs380.primitives.generateCylinder(32, upperLegRadius, upperLegLength),
        parent: "body",
        color: flesh
      },
      leftKnee: {
        id: 19,
        meshData: cs380.primitives.generateSphere(32, 32, upperLegRadius),
        parent: "leftUpperLeg",
        color: flesh,
        shininess: 200,
      },
      leftLowerLeg: {
        id: 20,
        meshData: cs380.primitives.generateCylinder(32, lowerLegRadius, lowerLegLength-bootsHeight),
        parent: "leftKnee",
        color: flesh,
        shininess: 200,
      },
      leftBootNeck: {
        id: 21,
        meshData: cs380.primitives.generateCylinder(32, lowerLegRadius, bootsHeight),
        parent: "leftLowerLeg",
        color: black
      },
      leftBoot: {
        id: 22,
        meshData: cs380.primitives.generateEllipsoid(32, 32, bootsRadius, bootsRadius, bootsLength),
        parent: "leftLowerLeg",
        color: black
      },
      rightUpperLeg: {
        id: 23,
        meshData: cs380.primitives.generateCylinder(32, upperLegRadius, upperLegLength),
        parent: null,
        color: flesh
      },
      rightKnee: {
        id: 24,
        meshData: cs380.primitives.generateSphere(32, 32, upperLegRadius),
        parent: "rightUpperLeg",
        color: flesh,
        shininess: 200,
      },
      rightLowerLeg: {
        id: 25,
        meshData: cs380.primitives.generateCylinder(32, lowerLegRadius, lowerLegLength-bootsHeight),
        parent: "rightKnee",
        color: flesh,
        shininess: 200,
      },
      rightBootNeck: {
        id: 26,
        meshData: cs380.primitives.generateCylinder(32, lowerLegRadius, bootsHeight),
        parent: "rightLowerLeg",
        color: black
      },
      rightBoot: {
        id: 27,
        meshData: cs380.primitives.generateEllipsoid(32, 32, bootsRadius, bootsRadius, bootsLength),
        parent: "rightLowerLeg",
        color: black
      },
    };

    this.objects = {};
    for (const [key, value] of Object.entries(this.recipes)) {
      this.objects[key] = new cs380.PickableObject(
        cs380.Mesh.fromData(value.meshData),
        blinnPhongShader,
        pickingShader,
        value.id
      );
      this.objects[key].uniforms.mainColor = vec3.fromValues(...value.color);
      // this.objects[key].uniforms.reflectivity = [1, 1, 1];
      if (value.shininess) this.objects[key].uniforms.shininess = value.shininess;

      if (value.parent && this.objects[value.parent]) this.objects[key].transform.setParent(this.objects[value.parent].transform);
      
    }


    // initialize light sources
    this.lights = [];
    const lightDir = vec3.create();

    this.ambientLight = new Light(); 
    this.ambientLight.illuminance = 0.1;
    this.ambientLight.type = LightType.AMBIENT;
    this.ambientLight.color = vec3.fromValues(1, 1, 1);
    this.lights.push(this.ambientLight);

    this.directionalLight = new Light();
    vec3.set(lightDir, -1, -1, -1);
    this.directionalLight.illuminance = 0.3;
    this.directionalLight.transform.lookAt(lightDir);
    this.directionalLight.type = LightType.DIRECTIONAL;
    this.directionalLight.color = vec3.fromValues(1, 1, 1);
    this.lights.push(this.directionalLight);

    this.pointLight = new Light();
    vec3.set(this.pointLight.transform.localPosition, 0, 1, 1);
    this.pointLight.illuminance = 0.3;
    this.pointLight.type = LightType.POINT;
    this.pointLight.color = vec3.fromValues(1, 1, 1);
    this.lights.push(this.pointLight);

    this.spotLight = new Light();
    vec3.set(this.spotLight.transform.localPosition, 0, 1, 1);
    this.spotLight.illuminance = 0.3;
    vec3.set(lightDir, 0, -1, -1);
    this.spotLight.transform.lookAt(lightDir);
    this.spotLight.type = LightType.SPOTLIGHT;
    this.spotLight.color = vec3.fromValues(1, 1, 1);
    this.spotLight.angle = glMatrix.toRadian(10);
    this.spotLight.angleSmoothness = 100;
    this.lights.push(this.spotLight);

    this.fire = new Light();
    this.fire.transform.setParent(this.objects['leftHand'].transform);
    vec3.set(this.fire.transform.localPosition, 0, 0.3, 0);
    this.fire.illuminance = 0.3;
    this.fire.type = LightType.POINT;
    this.fire.color = vec3.fromValues(1, 0, 0);
    this.lights.push(this.fire);

    for (const [key, _] of Object.entries(this.recipes)) this.objects[key].uniforms.lights = this.lights;

    quat.setAxisAngle( this.objects.upperBody.transform.localRotation, vec3.fromValues(0, 0, 1), 180 * DEG );
    vec3.set(this.objects.upperBody.transform.localPosition, 0, 1, 0);
    vec3.set(this.objects.shoulder.transform.localPosition, 0, 1, 0);
    vec3.set(this.objects.neck.transform.localPosition, 0, 1, 0);
    vec3.set(this.objects.head.transform.localPosition, 0, 0.4, 0);
    vec3.set(this.objects.hair.transform.localPosition, 0, 0, 0);
    vec3.set(this.objects.leftEye.transform.localPosition, -0.06, 0, 0.24);
    vec3.set(this.objects.rightEye.transform.localPosition, 0.06, 0, 0.24);
    vec3.set(this.objects.lowerBody.transform.localPosition, 0, -1, 0);

    quat.setAxisAngle( this.objects.leftUpperArm.transform.localRotation, vec3.fromValues(0, 0, 1), 160 * DEG );
    vec3.set(this.objects.leftUpperArm.transform.localPosition, -(shoulderWidth/2-0.1), 0.9, 0);
    vec3.set(this.objects.leftElbow.transform.localPosition, 0, upperArmLength+0.03, 0);
    quat.setAxisAngle( this.objects.leftLowerArm.transform.localRotation, vec3.fromValues(0, 0, 1), 20 * DEG );
    vec3.set(this.objects.leftLowerArm.transform.localPosition, 0, upperArmRadius-lowerArmRadius, 0);
    vec3.set(this.objects.leftHand.transform.localPosition, 0, lowerArmLength, 0);

    quat.setAxisAngle( this.objects.rightUpperArm.transform.localRotation, vec3.fromValues(0, 0, 1), -160 * DEG );
    vec3.set(this.objects.rightUpperArm.transform.localPosition, (shoulderWidth/2-0.1), 0.9, 0);
    vec3.set(this.objects.rightElbow.transform.localPosition, 0, upperArmLength+0.03, 0);
    quat.setAxisAngle( this.objects.rightLowerArm.transform.localRotation, vec3.fromValues(0, 0, 1), -20 * DEG );
    vec3.set(this.objects.rightLowerArm.transform.localPosition, 0, upperArmRadius-lowerArmRadius, 0);
    vec3.set(this.objects.rightHand.transform.localPosition, 0, lowerArmLength, 0);

    quat.setAxisAngle(this.objects.leftUpperLeg.transform.localRotation, vec3.fromValues(0, 0, 1), 180 * DEG );
    vec3.set(this.objects.leftUpperLeg.transform.localPosition, -0.13, -0.6, 0);
    vec3.set(this.objects.leftKnee.transform.localPosition, 0, upperLegLength, 0);
    vec3.set(this.objects.leftLowerLeg.transform.localPosition, 0, upperLegRadius-lowerLegRadius, 0);
    vec3.set(this.objects.leftBootNeck.transform.localPosition, 0, lowerLegLength-bootsHeight, 0);
    vec3.set(this.objects.leftBoot.transform.localPosition, 0, lowerLegLength-bootsRadius, bootsLength-lowerLegRadius);
    
    quat.setAxisAngle(this.objects.rightUpperLeg.transform.localRotation, vec3.fromValues(0, 0, 1), 180 * DEG );
    vec3.set(this.objects.rightUpperLeg.transform.localPosition, 0.13, -0.6, 0);
    vec3.set(this.objects.rightKnee.transform.localPosition, 0, upperLegLength, 0);
    vec3.set(this.objects.rightLowerLeg.transform.localPosition, 0, upperLegRadius-lowerLegRadius, 0);
    vec3.set(this.objects.rightBootNeck.transform.localPosition, 0, lowerLegLength-bootsHeight, 0);
    vec3.set(this.objects.rightBoot.transform.localPosition, 0, lowerLegLength-bootsRadius, bootsLength-lowerLegRadius);

    const floorMeshData = cs380.primitives.generateCube();
    const floorMesh = cs380.Mesh.fromData(floorMeshData);
    this.thingsToClear.push(floorMesh);
    this.floor = new cs380.PickableObject(
      floorMesh, 
      blinnPhongShader,
      pickingShader,
      101
    );

    vec3.set(this.floor.transform.localPosition, 0, -2, 0);
    vec3.set(this.floor.transform.localScale, 10, 0.05, 10);
    this.floor.uniforms.lights = this.lights; 
   
    // Event listener for interactions
    this.handleKeyDown = (e) => {
      // e.repeat is true when the key has been helded for a while
      if (e.repeat) return;
      this.onKeyDown(e.key);
    };
    this.handleKeyUp = (e) => {
      this.onKeyUp(e.key);
    };
    this.handleMouseDown = (e) => {
      // e.button = 0 if it is left mouse button
      if (e.button !== 0) return;
      this.onMouseDown(e);
    };

    document.addEventListener("keydown", this.handleKeyDown);
    document.addEventListener("keyup", this.handleKeyUp);
    gl.canvas.addEventListener("mousedown", this.handleMouseDown);

    document.getElementById("settings").innerHTML = `
      <h3>Ambient Light</h3>
      <label for="ambient-illuminance">illuminance</label>
      <input type="range" min=0 max=0.3 value=0.1 step=0.01 id="ambient-illuminance">

      <h3>Directional Light</h3>
      <label for="directional-illuminance">illuminance</label>
      <input type="range" min=0 max=1 value=0.3 step=0.01 id="directional-illuminance"><br/>

      <h3>Point Light</h3>
      <label for="point-illuminance">illuminance</label>
      <input type="range" min=0 max=1 value=0.3 step=0.01 id="point-illuminance"><br/>
      <label for="point-pos-x">pos-x</label>
      <input type="range" min=-2 max=2 value=0 step=0.01 id="point-pos-x"><br/>
      <label for="point-pos-y">pos-y</label>
      <input type="range" min=-2 max=2 value=1 step=0.01 id="point-pos-y"><br/>
      <label for="point-pos-z">pos-z</label>
      <input type="range" min=-2 max=2 value=1 step=0.01 id="point-pos-z">

      <h3>Spotlight</h3>
      <label for="spot-illuminance">illuminance</label>
      <input type="range" min=0 max=1 value=0.3 step=0.01 id="spot-illuminance"><br/>
      <label for="spot-pos-x">pos-x</label>
      <input type="range" min=-2 max=2 value=0 step=0.01 id="spot-pos-x"><br/>
      <label for="spot-pos-y">pos-y</label>
      <input type="range" min=-2 max=2 value=1 step=0.01 id="spot-pos-y"><br/>
      <label for="spot-pos-z">pos-z</label>
      <input type="range" min=-2 max=2 value=1 step=0.01 id="spot-pos-z"><br/>
      <label for="spot-angle">angle</label>
      <input type="range" min=1 max=30 value=10 step=0.1 id="spot-angle"><br/>
      <label for="spot-angle-smoothness">angle-smoothness</label>
      <input type="range" min=1 max=200 value=100 step=1 id="spot-angle-smoothness">

      <h3>Fire</h3>
      <label for="fire-illuminance">illuminance</label>
      <input type="range" min=0 max=1 value=0.3 step=0.01 id="fire-illuminance"><br/>

      <h3>Basic requirements</h3>
      <ul>
        <li>Implement point light, and spotlight [2 pts]</li>
        <li>Update the implementation to support colored (RGB) light [1 pts]</li>
        <li>Update the implementation to support materials (reflection coefficients, shineness) [2 pts] </li>
        <li>Show some creativity in your scene [1 pts]</li>
      </ul>
      Import at least two models to show material differnece <br/>
      Use your creativity (animation, interaction, etc.) to make each light source is recognized respectively. <br/>
      <strong>Start early!</strong>
    `;

    // Setup GUIs
    const setInputBehavior = (id, onchange, initialize, callback) => {
      const input = document.getElementById(id);
      const callbackWrapper = 
          () => callback(input.value); // NOTE: must parse to int/float for numeric values
      if (onchange) {
        input.onchange = callbackWrapper;
        if (initialize) input.onchange();
      } else {
        input.oninput = callbackWrapper;
        if (initialize) input.oninput();
      }
    }

    setInputBehavior('ambient-illuminance', true, true, (val) => { this.ambientLight.illuminance=val;});
    setInputBehavior('directional-illuminance', true, true, (val) => { this.directionalLight.illuminance=val;});
    setInputBehavior('point-illuminance', true, true, (val) => { this.pointLight.illuminance=val;});
    setInputBehavior('point-pos-x', true, true, (val) => { this.pointLight.transform.localPosition[0]=val; });
    setInputBehavior('point-pos-y', true, true, (val) => { this.pointLight.transform.localPosition[1]=val; });
    setInputBehavior('point-pos-z', true, true, (val) => { this.pointLight.transform.localPosition[2]=val; });
    setInputBehavior('spot-illuminance', true, true, (val) => { this.spotLight.illuminance=val; });
    setInputBehavior('spot-pos-x', true, true, (val) => { this.spotLight.transform.localPosition[0]=val; });
    setInputBehavior('spot-pos-y', true, true, (val) => { this.spotLight.transform.localPosition[1]=val; });
    setInputBehavior('spot-pos-z', true, true, (val) => { this.spotLight.transform.localPosition[2]=val; });
    setInputBehavior('spot-angle', true, true, (val) => { console.log(val);this.spotLight.angle=glMatrix.toRadian(val); });
    setInputBehavior('spot-angle-smoothness', true, true, (val) => { this.spotLight.angleSmoothness=val; });
    setInputBehavior('fire-illuminance', true, true, (val) => { this.fire.illuminance=val; });


    // GL settings
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.frontFace(gl.CCW);
  }

  onKeyDown(key) {
    if (key===' ') key = 'space';
    console.log(`key down: ${key}`);
    this.pressed[key.toLowerCase()] = true;
  }

  onKeyUp(key) {
    if (key===' ') key = 'space';
    console.log(`key up: ${key}`);
    this.pressed[key.toLowerCase()] = false;
  }

  onMouseDown(e) {
    const { left, bottom } = gl.canvas.getBoundingClientRect();
    const x = e.clientX - left;
    const y = bottom - e.clientY;

    // Object with this index has just picked
    const index = this.pickingBuffer.pick(x, y);

    console.log(`onMouseDown() got index ${index}`);

    if (index <= 8 || index == 17 || index >= 23) quat.setAxisAngle(this.objects.body.transform.localRotation, vec3.fromValues(0, 0, 1), -15 * DEG );
    else if (index <= 10) quat.setAxisAngle(this.objects.leftUpperArm.transform.localRotation, vec3.fromValues(0, 0, 1), 120 * DEG );
    else if (index <= 12) quat.setAxisAngle(this.objects.leftLowerArm.transform.localRotation, vec3.fromValues(0, 0, 1), -120 * DEG );
    else if (index <= 14) quat.setAxisAngle(this.objects.rightUpperArm.transform.localRotation, vec3.fromValues(0, 0, 1), -60 * DEG );
    else if (index <= 16) quat.setAxisAngle(this.objects.rightLowerArm.transform.localRotation, vec3.fromValues(0, 0, 1), 5 * DEG );
    else if (index >= 18 && index <= 22) quat.setAxisAngle(this.objects.leftUpperLeg.transform.localRotation, vec3.fromValues(0, 0, 1), 160 * DEG );
  }

  finalize() {
    // Finalize WebGL objects (mesh, shader, texture, ...)
    document.removeEventListener("keydown", this.handleKeyDown);
    document.removeEventListener("keyup", this.handleKeyUp);
    gl.canvas.removeEventListener("mousedown", this.handleMouseDown);
    this.thingsToClear.forEach((it) => it.finalize());
  }

  update(elapsed, dt) {
    // Updates before rendering here
    this.simpleOrbitControl.update(dt);

    const camMoveSpeed = 1;
    const camRotSpeed = 1;
    const partRotSpeed = 1;

    const CT = this.camera.transform;

    const right = [CT.worldMatrix[0], CT.worldMatrix[4], CT.worldMatrix[8]];
    const up = [CT.worldMatrix[1], CT.worldMatrix[5], CT.worldMatrix[9]];
    const forward = [CT.worldMatrix[2], CT.worldMatrix[6], -CT.worldMatrix[10]];
    
    // let dr = [0, 0, 0];
    // if (this.pressed.arrowleft) dr = right.map(_ => - _ * camMoveSpeed * dt);
    // if (this.pressed.arrowright) dr = right.map(_ => _ * camMoveSpeed * dt);
    // if (this.pressed.space) dr = up.map(_ => _ * camMoveSpeed * dt);
    // if (this.pressed.shift) dr = up.map(_ => - _ * camMoveSpeed * dt);
    // if (this.pressed.arrowup) dr = forward.map(_ => _ * camMoveSpeed * dt);
    // if (this.pressed.arrowdown) dr = forward.map(_ => - _ * camMoveSpeed * dt);
    // vec3.add(CT.localPosition, CT.localPosition, dr);
    
    // if (this.pressed.a || this.pressed.d || this.pressed.w || this.pressed.s || this.pressed.q || this.pressed.e) {
    //   let r = quat.create();
    //   if (this.pressed.a) quat.setAxisAngle(r, up, camRotSpeed * dt);
    //   if (this.pressed.d) quat.setAxisAngle(r, up, -camRotSpeed * dt);
    //   if (this.pressed.w) quat.setAxisAngle(r, right, camRotSpeed * dt);
    //   if (this.pressed.s) quat.setAxisAngle(r, right, -camRotSpeed * dt);
    //   if (this.pressed.q) quat.setAxisAngle(r, forward, -camRotSpeed * dt);
    //   if (this.pressed.e) quat.setAxisAngle(r, forward, camRotSpeed * dt);
    //   quat.multiply(CT.localRotation, r, CT.localRotation);
    // }
    
    if (this.pressed.t) quat.rotateZ(this.objects.leftUpperArm.transform.localRotation, this.objects.leftUpperArm.transform.localRotation, -partRotSpeed * dt);
    if (this.pressed.y) quat.rotateZ(this.objects.leftUpperArm.transform.localRotation, this.objects.leftUpperArm.transform.localRotation, partRotSpeed * dt);
    if (this.pressed.u) quat.rotateZ(this.objects.leftLowerArm.transform.localRotation, this.objects.leftLowerArm.transform.localRotation, -partRotSpeed * dt);
    if (this.pressed.i) quat.rotateZ(this.objects.leftLowerArm.transform.localRotation, this.objects.leftLowerArm.transform.localRotation, partRotSpeed * dt);
    if (this.pressed.o) quat.rotateZ(this.objects.rightUpperArm.transform.localRotation, this.objects.rightUpperArm.transform.localRotation, -partRotSpeed * dt);
    if (this.pressed.p) quat.rotateZ(this.objects.rightUpperArm.transform.localRotation, this.objects.rightUpperArm.transform.localRotation, partRotSpeed * dt);
    if (this.pressed['[']) quat.rotateZ(this.objects.rightLowerArm.transform.localRotation, this.objects.rightLowerArm.transform.localRotation, -partRotSpeed * dt);
    if (this.pressed[']']) quat.rotateZ(this.objects.rightLowerArm.transform.localRotation, this.objects.rightLowerArm.transform.localRotation, partRotSpeed * dt);
    if (this.pressed.f) quat.rotateZ(this.objects.leftUpperLeg.transform.localRotation, this.objects.leftUpperLeg.transform.localRotation, -partRotSpeed * dt);
    if (this.pressed.g) quat.rotateZ(this.objects.leftUpperLeg.transform.localRotation, this.objects.leftUpperLeg.transform.localRotation, partRotSpeed * dt);
    if (this.pressed.h) quat.rotateZ(this.objects.leftLowerLeg.transform.localRotation, this.objects.leftLowerLeg.transform.localRotation, -partRotSpeed * dt);
    if (this.pressed.j) quat.rotateZ(this.objects.leftLowerLeg.transform.localRotation, this.objects.leftLowerLeg.transform.localRotation, partRotSpeed * dt);
    if (this.pressed.k) quat.rotateZ(this.objects.body.transform.localRotation, this.objects.body.transform.localRotation, partRotSpeed * dt);
    if (this.pressed.l) quat.rotateZ(this.objects.body.transform.localRotation, this.objects.body.transform.localRotation, -partRotSpeed * dt);

    // Render picking information first
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.pickingBuffer.fbo);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // renderPicking() here
    for (const o of Object.values(this.objects)) {
      o.renderPicking(this.camera);
    }
    this.floor.renderPicking(this.camera);

    // Render real scene
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.clearColor(0.0, 0.3, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // render() here
    for (const o of Object.values(this.objects)) {
      o.render(this.camera);
    }
    this.floor.render(this.camera);
  }
}
