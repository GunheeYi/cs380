import gl from './gl.js'

import { vec3, vec4 } from "./cs380/gl-matrix.js"

import * as cs380 from './cs380/cs380.js'

export class CustomBlinnPhongShader extends cs380.BaseShader {
  static get source() {
    // Define shader codes here
    return [
      [gl.VERTEX_SHADER, "resources/custom_blinn_phong.vert"],
      [gl.FRAGMENT_SHADER, "resources/custom_blinn_phong.frag"],
    ];
  }

  generateUniformLocations() {
    return {
      // Below three are must-have uniform variables,
      projectionMatrix: gl.getUniformLocation(this.program, "projectionMatrix"),
      cameraTransform: gl.getUniformLocation(this.program, "cameraTransform"),
      modelTransform: gl.getUniformLocation(this.program, "modelTransform"),

      // Shader-specific uniforms
      mainColor: gl.getUniformLocation(this.program, "mainColor"),
      numLights: gl.getUniformLocation(this.program, "numLights"),
      reflectivity: gl.getUniformLocation(this.program, "reflectivity"),
    };
  }

  setUniforms(kv) {
    this.setUniformMat4(kv, "projectionMatrix");
    this.setUniformMat4(kv, "cameraTransform");
    this.setUniformMat4(kv, "modelTransform");

    // Set shader-specific uniforms here
    this.setUniformVec3(kv, "mainColor", 1, 1, 1);
    this.setUniformVec3(kv, "reflectivity", 1, 1, 1);

    if ('lights' in kv) {
      const lights = kv['lights'];
      const lightProperties = ['type', 'enabled', 'pos', 'illuminance', 'color', 'dir', 'angle', 'angleSmoothness'];
      const numLights = Math.min(lights.length, 10);
      gl.uniform1i(this.uniformLocations.numLights, numLights);
      for (let i=0; i < numLights; i++) {
        const light = lights[i];
        const locations = lightProperties.reduce(
            (obj, x) => {
              obj[x] = gl.getUniformLocation(this.program, `lights[${i}].${x}`);
              return obj;
            }, {}
        );
        gl.uniform1i(locations.type, light.type);
        gl.uniform1i(locations.enabled, light.enabled);
        gl.uniform3f(locations.pos, ...light.pos);
        gl.uniform3f(locations.dir, ...light.dir);
        gl.uniform1f(locations.illuminance, light.illuminance);
        gl.uniform3f(locations.color, ...light.color);
        gl.uniform1f(locations.angle, light.angle);
        gl.uniform1f(locations.angleSmoothness, light.angleSmoothness);
      }
    }
    else {
      gl.uniform1i(this.uniformLocations.numLights, 0);
    }
  }
}
