import gl from "../gl.js";
import { vec3, mat4, quat, glMatrix } from "../cs380/gl-matrix.js";

import * as cs380 from "../cs380/cs380.js";

import { SimpleShader } from "../simple_shader.js";

export default class Lab5App extends cs380.BaseApp {
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

    // things to finalize()
    this.thingsToClear = [];

    // SimpleOrbitControl
    const orbitControlCenter = vec3.fromValues(0, 0, 0);
    this.simpleOrbitControl = new cs380.utils.SimpleOrbitControl(
      this.camera,
      orbitControlCenter
    );
    this.thingsToClear.push(this.simpleOrbitControl);

    // TODO: initialize mesh and shader
    this.thingsToClear.push(/*mesh & shader...*/);

    // initialize picking shader & buffer
    const pickingShader = await cs380.buildShader(cs380.PickingShader);
    const simpleShader = await cs380.buildShader(SimpleShader);
    this.pickingBuffer = new cs380.PickingBuffer();
    this.pickingBuffer.initialize(width, height);
    this.thingsToClear.push(pickingShader, simpleShader, this.pickingBuffer);

    // TODO: initialize PickableObject for your solar system
    this.spheres = [
      {
        name: "sun",
        id: 1,
        radius: 1,
        color: [1.0, 0.5, 0.0],
      },
      {
        name: "earth",
        id: 2,
        radius: 0.4,
        color: [0.0, 0.5, 1.0],
      },
      {
        name: "moon",
        id: 3,
        radius: 0.2,
        color: [0.5, 0.5, 0.5],
      }
    ];

    for (const s of this.spheres) {
      const sphereMeshData = cs380.primitives.generateSphere(16, 8, s.radius);
      const sphereMesh = cs380.Mesh.fromData(sphereMeshData);
      s.pickableObject = new cs380.PickableObject(
        sphereMesh,
        simpleShader,
        pickingShader,
        s.id
      );
      this.thingsToClear.push(s.pickableObject);
      s.pickableObject.uniforms.mainColor = vec3.fromValues(...s.color);
    }
    for (let i = 1; i < this.spheres.length; i++) this.spheres[i].pickableObject.transform.setParent(this.spheres[i-1].pickableObject.transform);

    // Event listener for interactions
    this.handleMouseDown = (e) => {
      // e.button = 0 if it is left mouse button
      if (e.button !== 0) return;
      this.onMouseDown(e);
    };
    gl.canvas.addEventListener("mousedown", this.handleMouseDown);

    // HTML interaction
    document.getElementById("settings").innerHTML = `
      <ul>
        <li>
          <strong>Submission:</strong> 3 screenshots with your solar system;
          the camera should move around the sun, earth, and moon, respectively.
        </li>
      </ul>
    `;

    // GL settings
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.frontFace(gl.CCW);
  }

  onMouseDown(e) {
    const { left, bottom } = gl.canvas.getBoundingClientRect();
    const x = e.clientX - left;
    const y = bottom - e.clientY;

    // Object with this index has just picked
    const index = this.pickingBuffer.pick(x, y);

    // TODO : write down your code
    console.log(`onMouseDown() got index ${index}`);

    if (index) {
      const pickedObject = this.spheres.find(s => s.id === index);
      if (pickedObject) {
        console.log(`picked ${pickedObject.name}`);
        this.camera.transform.setParent(pickedObject.pickableObject.transform);
      }
    }
  }

  finalize() {
    gl.canvas.removeEventListener("mousedown", this.handleMouseDown);
    this.thingsToClear.forEach((it) => it.finalize());
    gl.disable(gl.CULL_FACE);
  }

  update(elapsed, dt) {
    // TODO: update your solar system movement here
    this.simpleOrbitControl.update(dt);

    vec3.set(this.spheres[1].pickableObject.transform.localPosition,
      3 * Math.cos(elapsed / 1),
      3 * Math.sin(elapsed / 1),
      0
    );
    vec3.set(this.spheres[2].pickableObject.transform.localPosition,
      1 * Math.cos(elapsed * 5),
      1 * Math.sin(elapsed * 5),
      0
    );

    // 1. Render picking information first
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.pickingBuffer.fbo);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    for (const s of this.spheres) {
      s.pickableObject.renderPicking(this.camera);
    }

    // 2. Render real scene
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    for (const s of this.spheres) {
      s.pickableObject.render(this.camera);
    }
  }
}
