import gl from "../gl.js";
import { vec3, mat4, quat } from "../cs380/gl-matrix.js";

import * as cs380 from "../cs380/cs380.js";

import { SolidShader } from "../solid_shader.js";

export default class Lab2App extends cs380.BaseApp {
  async initialize() {
    // Basic setup for camera
    const aspectRatio = gl.canvas.clientWidth / gl.canvas.clientHeight;
    this.camera = new cs380.Camera();
    vec3.set(this.camera.transform.localPosition, 0, 0, 0);
    mat4.ortho(
        this.camera.projectionMatrix,
        -2 * aspectRatio,
        +2 * aspectRatio,
        -2,
        +2,
        -2,
        +2
    );

    this.mesh = new cs380.Mesh();

    const buildStar = (N, innerRadius) => {
      this.mesh.finalize();
      this.mesh.addAttribute(3); // position

      // TODO: complete the function
      const angleHalf = Math.PI / N;
      for (let i = 0; i < N; i++) {
        const angle = 2 * Math.PI * i / N;
        const p_i = vec3.fromValues(
          Math.cos(angle),
          Math.sin(angle),
          0
        );
        const p_i_1 = vec3.fromValues(
          Math.cos(angle + angleHalf) * innerRadius,
          Math.sin(angle + angleHalf) * innerRadius,
          0
        );
        const p_i_2 = vec3.fromValues(
          Math.cos(angle - angleHalf) * innerRadius,
          Math.sin(angle - angleHalf) * innerRadius,
          0
        );
        this.mesh.addVertexData(...p_i);
        this.mesh.addVertexData(...p_i_1);
        this.mesh.addVertexData(...vec3.fromValues(0, 0, 0));
        this.mesh.addVertexData(...p_i);
        this.mesh.addVertexData(...p_i_2);
        this.mesh.addVertexData(...vec3.fromValues(0, 0, 0));
      }
      this.mesh.drawMode = gl.TRIANGLES;

      this.mesh.initialize();
    };
    
    buildStar(5, 0.5);

    this.shader = await cs380.buildShader(SolidShader);

    this.star = new cs380.RenderObject(this.mesh, this.shader);
    this.star.uniforms.mainColor = vec3.create();

    // HTML interaction
    document.getElementById("settings").innerHTML = `
      <div>
      <label for="settings-sides">Star: Number of pointy bits</label>
      <input type="number" id="settings-sides" value="5" min="3" max="100" step="1">
      </div>
      <div>
      <label for="settings-inner-radius">Star: Inner radius ratio</label>
      <input type="range" id="settings-inner-radius" value="0.5" min="0" max="1" step="any">
      </div>
      <div>
      <label for="settings-color">Star: Color</label>
      <input type="color" id="settings-color" value="#FFFF00">
      </div>
    `;

    cs380.utils.setInputBehavior("settings-sides", (val) => {
      const N = parseInt(val);
      const r = parseFloat(document.getElementById("settings-inner-radius").value);
      buildStar(N, r);
    }, true, false);

    cs380.utils.setInputBehavior("settings-inner-radius", (val) => {
      const N = parseInt(document.getElementById("settings-sides").value);
      const r = parseFloat(val);
      buildStar(N, r);
    }, false, false);

    cs380.utils.setInputBehavior("settings-color", (val) =>
      cs380.utils.hexToRGB(this.star.uniforms.mainColor, val)
    );
  }

  finalize() {
    this.mesh.finalize()
    this.shader.finalize();
  }

  update(elapsed, dt) {
    // TODO: Add orbiting animation for the star
    const rotationFactor = 2;
    const orbitFactor = 1.2;
    const T = this.star.transform;
    quat.rotateZ(T.localRotation, T.localRotation, Math.PI * dt * rotationFactor);
    vec3.set(T.localPosition, Math.cos(elapsed * orbitFactor), Math.sin(elapsed * orbitFactor), 0);

    // Clear canvas
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    this.star.render(this.camera);
  }
}
