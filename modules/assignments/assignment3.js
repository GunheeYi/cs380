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
    // const simpleShader = await cs380.buildShader(SimpleShader);
    const blinnPhongShader = await cs380.buildShader(BlinnPhongShader);
    this.pickingBuffer = new cs380.PickingBuffer();
    this.pickingBuffer.initialize(width, height);
    // this.thingsToClear.push(pickingShader, simpleShader, this.pickingBuffer);
    this.thingsToClear.push(pickingShader, blinnPhongShader, this.pickingBuffer);

    // CODE START -------------------------------

    // initialize light sources
    this.lights = [];
    const lightDir = vec3.create();

    const light0 = new Light(); 
    light0.illuminance = 0.1;
    light0.type = LightType.AMBIENT;
    this.lights.push(light0);

    const light1 = new Light();
    vec3.set(lightDir, -1, -1, -1);
    light1.illuminance = 0.9;
    light1.transform.lookAt(lightDir);
    light1.type = LightType.DIRECTIONAL;
    this.lights.push(light1);

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
        color: flesh
      },
      head: {
        id: 5,
        meshData: cs380.primitives.generateEllipsoid(32, 32, 0.25, 0.28, 0.25),
        parent: "neck",
        color: flesh,
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
        color: flesh
      },
      leftLowerArm: {
        id: 11,
        meshData: cs380.primitives.generateCylinder(32, lowerArmRadius, lowerArmLength),
        parent: "leftElbow",
        color: flesh
      },
      leftHand: {
        id: 12,
        meshData: cs380.primitives.generateSphere(32, 32, handRadius),
        parent: "leftLowerArm",
        color: flesh
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
        color: flesh
      },
      rightLowerArm: {
        id: 15,
        meshData: cs380.primitives.generateCylinder(32, lowerArmRadius, lowerArmLength),
        parent: "rightElbow",
        color: flesh
      },
      rightHand: {
        id: 16,
        meshData: cs380.primitives.generateSphere(32, 32, handRadius),
        parent: "rightLowerArm",
        color: flesh
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
        color: flesh
      },
      leftLowerLeg: {
        id: 20,
        meshData: cs380.primitives.generateCylinder(32, lowerLegRadius, lowerLegLength-bootsHeight),
        parent: "leftKnee",
        color: flesh
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
        color: flesh
      },
      rightLowerLeg: {
        id: 25,
        meshData: cs380.primitives.generateCylinder(32, lowerLegRadius, lowerLegLength-bootsHeight),
        parent: "rightKnee",
        color: flesh
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
        // simpleShader,
        blinnPhongShader,
        pickingShader,
        value.id
      );
      // this.objects[key].transform.localPosition = [0, 0, 0];
      // this.objects[key].transform.localScale = [1, 1, 1];
      // this.objects[key].transform.localRotation = [0, 0, 0];
      this.objects[key].uniforms.mainColor = vec3.fromValues(...value.color);
      this.objects[key].uniforms.lights = this.lights;

      if (value.parent && this.objects[value.parent]) this.objects[key].transform.setParent(this.objects[value.parent].transform);
      
    }

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
    gl.canvas.addEventListener("mousedown", this.handleMouseDown);

    document.getElementById("settings").innerHTML = `
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
    
    // if (this.pressed.t) quat.rotateZ(this.objects.leftUpperArm.transform.localRotation, this.objects.leftUpperArm.transform.localRotation, -partRotSpeed * dt);
    // if (this.pressed.y) quat.rotateZ(this.objects.leftUpperArm.transform.localRotation, this.objects.leftUpperArm.transform.localRotation, partRotSpeed * dt);
    // if (this.pressed.u) quat.rotateZ(this.objects.leftLowerArm.transform.localRotation, this.objects.leftLowerArm.transform.localRotation, -partRotSpeed * dt);
    // if (this.pressed.i) quat.rotateZ(this.objects.leftLowerArm.transform.localRotation, this.objects.leftLowerArm.transform.localRotation, partRotSpeed * dt);
    // if (this.pressed.o) quat.rotateZ(this.objects.rightUpperArm.transform.localRotation, this.objects.rightUpperArm.transform.localRotation, -partRotSpeed * dt);
    // if (this.pressed.p) quat.rotateZ(this.objects.rightUpperArm.transform.localRotation, this.objects.rightUpperArm.transform.localRotation, partRotSpeed * dt);
    // if (this.pressed['[']) quat.rotateZ(this.objects.rightLowerArm.transform.localRotation, this.objects.rightLowerArm.transform.localRotation, -partRotSpeed * dt);
    // if (this.pressed[']']) quat.rotateZ(this.objects.rightLowerArm.transform.localRotation, this.objects.rightLowerArm.transform.localRotation, partRotSpeed * dt);
    // if (this.pressed.f) quat.rotateZ(this.objects.leftUpperLeg.transform.localRotation, this.objects.leftUpperLeg.transform.localRotation, -partRotSpeed * dt);
    // if (this.pressed.g) quat.rotateZ(this.objects.leftUpperLeg.transform.localRotation, this.objects.leftUpperLeg.transform.localRotation, partRotSpeed * dt);
    // if (this.pressed.h) quat.rotateZ(this.objects.leftLowerLeg.transform.localRotation, this.objects.leftLowerLeg.transform.localRotation, -partRotSpeed * dt);
    // if (this.pressed.j) quat.rotateZ(this.objects.leftLowerLeg.transform.localRotation, this.objects.leftLowerLeg.transform.localRotation, partRotSpeed * dt);
    // if (this.pressed.k) quat.rotateZ(this.objects.body.transform.localRotation, this.objects.body.transform.localRotation, partRotSpeed * dt);
    // if (this.pressed.l) quat.rotateZ(this.objects.body.transform.localRotation, this.objects.body.transform.localRotation, -partRotSpeed * dt);

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
  }
}
