import gl from './gl.js'

import * as cs380 from './cs380/cs380.js'

export class BumpMapShader extends cs380.BaseShader {
  static get source() {
    return [
      [gl.VERTEX_SHADER, 'resources/bump_map.vert'],
      [gl.FRAGMENT_SHADER, 'resources/bump_map.frag']
    ];
  }

  generateUniformLocations() {
    return {
      projectionMatrix: gl.getUniformLocation(this.program, 'projectionMatrix'),
      cameraTransform: gl.getUniformLocation(this.program, 'cameraTransform'),
      modelTransform: gl.getUniformLocation(this.program, 'modelTransform'),
      mainTexture: gl.getUniformLocation(this.program, 'mainTexture'),
      mainColor: gl.getUniformLocation(this.program, 'mainColor'),
    };
  }

  setUniforms(kv) {
    this.setUniformMat4(kv, 'projectionMatrix');
    this.setUniformMat4(kv, 'cameraTransform');
    this.setUniformMat4(kv, 'modelTransform');
    this.setUniformTexture(kv, 'mainTexture', 0);
    this.setUniformVec3(kv, 'mainColor', 1, 1, 1);
  }
}
