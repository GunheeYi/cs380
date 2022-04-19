import gl from "../gl.js";
import { vec3, mat4, quat } from "../cs380/gl-matrix.js";

import * as cs380 from "../cs380/cs380.js";

import  { SolidShader }  from "../solid_shader.js";
import { VertexColorShader } from "../vertex_color_shader.js";

function between(a, b) {
  return Math.random() * (b - a) + a;
}

const start = 0.1;
const fernNum = 50;
const treeNum = 20;

const deerLegStompRate = 1.5; // time for its leg to return back to original position
const deerSpeed = 0.6; // units per second
const deerScale = 0.001;

const black = vec3.fromValues(0.25, 0, 0);

const greens = [
  vec3.fromValues(14/256, 64/256, 45/256),
  vec3.fromValues(41/256, 81/256, 53/256),
  vec3.fromValues(31/256, 39/256, 27/256),
  vec3.fromValues(63/256, 69/256, 49/256),
  vec3.fromValues(28/256, 58/256, 19/256),
  vec3.fromValues(87/256, 79/256, 42/256),
  vec3.fromValues(132/256, 115/256, 43/256),
]
const browns = [
  vec3.fromValues(68/256, 54/256, 39/256),
  vec3.fromValues(58/256, 38/256, 24/256),
  vec3.fromValues(23/256, 22/256, 20/256),
  vec3.fromValues(15/256, 12/256, 12/256),
  // vec3.fromValues(54/256, 31/256, 39/256),
]

// body
const bodyVertices1 = [
  392.74, 517.47, 0,
  362.74, 402.92, 0,
  143.1 ,445.42, 0,
  8.74, 562.92, 0,
  2.74, 614.92, 0,
  25.74, 619.92, 0,
  115.74, 782.92, 0,
  210.74, 853.92, 0,
  354.74, 835.92, 0,
  539.74, 887.92, 0,
  748.24, 835.92, 0,
  896.74, 848.92, 0,
  1021.74, 814.92, 0,
  1099.74, 720.92, 0,
  1231.74, 600.92, 0,
  1302.74, 499.92, 0,
  1325.77, 423.42, 0,
  1309.74, 387.92, 0,
  1066.74, 359.92, 0,
  1011.74, 393.92, 0,
  801.74, 384.92, 0,
  624.74, 428.92, 0,
  354.74, 401.92, 0,
];
// head & right ear
const bodyVertices2 = [
  1154.74, 183.92, 0,
  1180.74, 138.92, 0,
  1159.74, 125.92, 0,
  1147.74, 82.92, 0,
  1107.74, 35.92, 0,
  1073.74, 36.92, 0,
  1066.74, 95.92, 0,
  1087.74, 154.92, 0,
  1128.74, 196.92, 0,
  1133.74, 215.92, 0,
  1111.74, 279.92, 0,
  1066.74, 359.92, 0,
  1309.74, 387.92, 0,
  1325.77, 361.86, 0,
  1372.74, 361.92, 0,
  1393.74, 367.92, 0,
  1422.74, 354.92, 0,
  1443.74, 336.92, 0,
  1443.74, 293.37, 0,
  1406.74, 262.92, 0,
  1378.74, 232.92, 0,
  1378.74, 185.92, 0,
  1371.74, 164.92, 0,
  1344.74, 144.92, 0,
  1313.74, 138.92, 0,
  1263.74, 134.92, 0,
  1178.74, 138.92, 0,
]
// left ear
const bodyVertices3 = [
  1361.74, 88.92, 0,
  1344.74, 144.92, 0,
  1373.74, 130.92, 0,
  1389.61, 130.92, 0,
  1423.74, 94.92, 0,
  1443.74, 58.18, 0,
  1449.74, 23.92, 0,
  1422.74, 2.92, 0,
  1369.74, 27.92, 0,
  1334.74, 64.92, 0,
  1313.74, 138.92, 0,
  1345.74, 144.92, 0,
]
const hindLegVertices = [
  285.74, 753.92, 0,
  359.74, 800.92, 0,
  222.74, 817.92, 0,
  266.24, 997.24, 0,
  139.74, 1019.92, 0,
  241.74, 1036.92, 0,
  197.64, 1161.04, 0,
  239.74, 1094.92, 0,
  281.74, 1376.92, 0,
  327.15, 1309.94, 0,
  298.74, 1366.92, 0,
  339.74, 1340.92, 0,
  311.46, 1376.92, 0,
  392.74, 1406.92, 0,
  311.46, 1403.85, 0,
  354.41, 1423.42, 0,
];

const foreLegVertices = [
  818.74, 727.92, 0,
  761.74, 796.92, 0,
  914.74, 791.92, 0,
  761.74, 980.35, 0,
  811.04, 1088.67, 0,
  747.84, 1036.35, 0,
  779.74, 1137.92, 0,
  726.24, 1178.34, 0,
  741.74, 1298.92, 0,
  667.74, 1316.92, 0,
  748.24, 1322.32, 0,
  673.74, 1343.92, 0,
  748.24, 1348.32, 0,
  681.74, 1363.92, 0,
  768.74, 1386.92, 0,
  700.74, 1394.92, 0,
  756.04, 1404.32, 0,
  726.24, 1404.32, 0,
];

const leafThickness = 0.6 / 2;

function leafVertices(root, tip) {
  let center = vec3.create();
  vec3.lerp(center, root, tip, 0.2);
  
  let radial = vec3.create();
  vec3.sub(radial, tip, root);

  let lateral = vec3.create();
  vec3.cross(lateral, radial, vec3.fromValues(0, 0, 1));
  // vec3.normalize(lateral, lateral);

  let left = vec3.create();
  vec3.scaleAndAdd(left, center, lateral, -leafThickness);
  let right = vec3.create();
  vec3.scaleAndAdd(right, center, lateral, leafThickness);

  return [
    root[0], root[1], root[2],
    tip[0], tip[1], tip[2],
    left[0], left[1], left[2],
    root[0], root[1], root[2],
    tip[0], tip[1], tip[2],
    right[0], right[1], right[2]
  ];
}

function fernVertices(root, tip, level) {
  if (level === 0) return leafVertices(root, tip);
  
  let leaves = [];

  let center = vec3.create();
  vec3.lerp(center, root, tip, 0.2);
  
  let radial = vec3.create();
  vec3.sub(radial, tip, root);

  let lateral = vec3.create();
  vec3.cross(lateral, radial, vec3.fromValues(0, 0, 1));

  for (let i = start; i < 1; i+=0.1) {
    let newRoot = vec3.create();
    vec3.lerp(newRoot, root, tip, i);
    let scaler = (1-i) / (1-start);
    let newTipLeft = vec3.create();
    vec3.scaleAndAdd(newTipLeft, newRoot, lateral, -leafThickness * scaler);
    vec3.scaleAndAdd(newTipLeft, newTipLeft, radial, 0.1);
    let newTipRight = vec3.create();
    vec3.scaleAndAdd(newTipRight, newRoot, lateral, leafThickness * scaler);
    vec3.scaleAndAdd(newTipRight, newTipRight, radial, 0.1);

    leaves = leaves.concat(fernVertices(newRoot, newTipLeft, level - 1));
    leaves = leaves.concat(fernVertices(newRoot, newTipRight, level - 1));
  }
  return leaves;
}

const branchThickness = 0.1;
const branchAngle = 120;

function treeVertices(root,  tip, level) {

  let radial = vec3.create();
  vec3.sub(radial, tip, root);
  let tiptip = vec3.create();
  vec3.scaleAndAdd(tiptip, tip, radial, 0.1);
  let lateral = vec3.create();
  vec3.cross(lateral, radial, vec3.fromValues(0, 0, 1));
  let topLeft = vec3.create();
  vec3.scaleAndAdd(topLeft, tip, lateral, -branchThickness);
  let topRight = vec3.create();
  vec3.scaleAndAdd(topRight, tip, lateral, branchThickness);
  let bottomLeft = vec3.create();
  vec3.scaleAndAdd(bottomLeft, root, lateral, -branchThickness);
  let bottomRight = vec3.create();
  vec3.scaleAndAdd(bottomRight, root, lateral, branchThickness);
  
  let vertices = [
    tiptip[0], tiptip[1], tiptip[2], topLeft[0], topLeft[1], topLeft[2], bottomLeft[0], bottomLeft[1], bottomLeft[2],
    tiptip[0], tiptip[1], tiptip[2], bottomLeft[0], bottomLeft[1], bottomLeft[2], bottomRight[0], bottomRight[1], bottomRight[2],
    tiptip[0], tiptip[1], tiptip[2], bottomRight[0], bottomRight[1], bottomRight[2], topRight[0], topRight[1], topRight[2]
  ];

  if (level != 0) {
    const branchCount = Math.floor(between(2, 5));
    for (let i = 0; i < branchCount; i++) {
      const angle = Math.PI / 180 * between(-branchAngle/2 + i * branchAngle/branchCount, -branchAngle/2 + (i+1) * branchAngle/branchCount);
      const scaler = between(0.5, 0.75);
      let newRadial = vec3.fromValues(
        radial[0] * Math.cos(angle) + lateral[0] * Math.sin(angle),
        radial[1] * Math.cos(angle) + lateral[1] * Math.sin(angle),
        radial[2] * Math.cos(angle) + lateral[2] * Math.sin(angle)
      );
      let newTip = vec3.create();
      vec3.scaleAndAdd(newTip, tip, newRadial, scaler);
      vertices = vertices.concat(treeVertices(tip, newTip, level - 1));
    }
  }
  
  return vertices;
}

export default class Assignment1 extends cs380.BaseApp {
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

    document.getElementById("settings").innerHTML = `
      <h3>Basic requirements</h3>
      <ul>
        <li>Add a background with color gradient</li>
        <li>Add 2 or more types of fractal-like natural objects</li>
        <li>Add framerate-independent natural animation</li>
        <li>Show some creativity in your scene</li>
      </ul>
    `;

    // mesh, startPosition, endPosition, startAngle, endAngle, phase
    this.deerParts = [
      {
        vertices: bodyVertices1,
        keyframes: [
          {
            timestamp: 0,
            pos: vec3.fromValues(0, 0, 0),
            angle: 0,
            scale: deerScale
          },
          {
            timestamp: deerLegStompRate/2,
            pos: vec3.fromValues(0, 0, 0),
            angle: 0,
            scale: deerScale
          },
          {
            timestamp: deerLegStompRate,
            pos: vec3.fromValues(0, 0, 0),
            angle: 0,
            scale: deerScale
          },
        ],
        phase: 0,
        mode: gl.TRIANGLE_FAN,
      },
      {
        vertices: bodyVertices2,
        keyframes: [
          {
            timestamp: 0,
            pos: vec3.fromValues(0, 0, 0),
            angle: 0,
            scale: deerScale
          },
          {
            timestamp: deerLegStompRate/2,
            pos: vec3.fromValues(0, 0, 0),
            angle: 0,
            scale: deerScale
          },
          {
            timestamp: deerLegStompRate,
            pos: vec3.fromValues(0, 0, 0),
            angle: 0,
            scale: deerScale
          },
        ],
        phase: 0,
        mode: gl.TRIANGLE_FAN,
      },
      {
        vertices: bodyVertices3,
        keyframes: [
          {
            timestamp: 0,
            pos: vec3.fromValues(0, 0, 0),
            angle: 0,
            scale: deerScale
          },
          {
            timestamp: deerLegStompRate/2,
            pos: vec3.fromValues(0, 0, 0),
            angle: 0,
            scale: deerScale
          },
          {
            timestamp: deerLegStompRate,
            pos: vec3.fromValues(0, 0, 0),
            angle: 0,
            scale: deerScale
          },
        ],
        phase: 0,
        mode: gl.TRIANGLE_FAN,
      },
      {
        vertices: hindLegVertices,
        keyframes: [
          {
            timestamp: 0,
            pos: vec3.fromValues(0.15, 0.05, 0),
            angle: -15,
            scale: deerScale
          },
          {
            timestamp: deerLegStompRate/2,
            pos: vec3.fromValues(-0.10, -0.15, 0),
            angle: 15,
            scale: deerScale
          },
          {
            timestamp: deerLegStompRate,
            pos: vec3.fromValues(0.15, 0.05, 0),
            angle: -15,
            scale: deerScale
          }
        ],
        phase: 0,
        mode: gl.TRIANGLE_STRIP,
      },
      {
        vertices: hindLegVertices,
        keyframes: [
          {
            timestamp: 0,
            pos: vec3.fromValues(-0.20, -0.15, 0),
            angle: 15,
            scale: deerScale
          },
          {
            timestamp: deerLegStompRate/2,
            pos: vec3.fromValues(0.05, 0.05, 0),
            angle: -15,
            scale: deerScale
          },
          {
            timestamp: deerLegStompRate,
            pos: vec3.fromValues(-0.20, -0.15, 0),
            angle: 15,
            scale: deerScale
          },
        ],
        phase: 0.5,
        mode: gl.TRIANGLE_STRIP,
      },
      {
        vertices: foreLegVertices,
        keyframes: [
          {
            timestamp: 0,
            pos: vec3.fromValues(0.15, 0.10, 0),
            angle: -5,
            scale: deerScale
          },
          {
            timestamp: deerLegStompRate/2,
            pos: vec3.fromValues(-0.10, -0.20, 0),
            angle: 25,
            scale: deerScale
          },
          {
            timestamp: deerLegStompRate,
            pos: vec3.fromValues(0.15, 0.10, 0),
            angle: -5,
            scale: deerScale
          },
        ],
        phase: 0,
        mode: gl.TRIANGLE_STRIP,
      },
      {
        vertices: foreLegVertices,
        keyframes: [
          {
            timestamp: 0,
            pos: vec3.fromValues(-0.20, -0.20, 0),
            angle: 25,
            scale: deerScale
          },
          {
            timestamp: deerLegStompRate/2,
            pos: vec3.fromValues(0.05, 0.10, 0),
            angle: -5,
            scale: deerScale
          },
          {
            timestamp: deerLegStompRate,
            pos: vec3.fromValues(-0.20, -0.20, 0),
            angle: 25,
            scale: deerScale
          },
        ],
        phase: 0.5,
        mode: gl.TRIANGLE_STRIP,
      },
    ];
    
    this.solidShader = await cs380.buildShader(SolidShader);
    this.vertexColorShader = await cs380.buildShader(VertexColorShader);
    
    const makeRenderObject = (vertices, shader, drawMode, color) => {
      this.mesh = new cs380.Mesh();
      this.mesh.finalize();
      this.mesh.addAttribute(3);
      if (shader===this.vertexColorShader) this.mesh.addAttribute(3);

      for (let i = 0; i < vertices.length; i+=3) {
        this.mesh.addVertexData(vertices[i], vertices[i+1], vertices[i+2]);
      }
      this.mesh.drawMode = drawMode;
      this.mesh.initialize();
      
      let renderObject = new cs380.RenderObject(this.mesh, shader);
      if (shader===this.solidShader) renderObject.uniforms.mainColor = color;
      return renderObject;
    }
    
    this.otherObjects = [];
    // rgb(11,41,91)
    // rgb(179,174,170)
    // rgb(249,139,30)
    this.otherObjects.push(makeRenderObject([
      -2, 2, 0, 11/256, 41/256, 91/256, // navy
      2, 2, 0, 11/256, 41/256, 91/256,
      // -2, 1.5, 0, 11/256, 41/256, 91/256,
      // 2, 1.5, 0, 11/256, 41/256, 91/256,
      -2, 0.4, 0, 175/256, 175/256, 175/256, // gray
      2, 0.4, 0, 175/256, 175/256, 175/256,
      -2,-0.5, 0, 249/256, 141/256, 27/256, // orange
      2, -0.5, 0, 249/256, 141/256, 27/256,
      -2,-0.7, 0, 249/256, 141/256, 27/256,
      2, -0.7, 0, 249/256, 141/256, 27/256
    ], this.vertexColorShader, gl.TRIANGLE_STRIP));

    // ground
    this.otherObjects.push(makeRenderObject([
      0, -2, 0,
      -2, -2, 0,
      -2, -0.55, 0,
      -1.5, -0.6, 0,
      -0.8, -0.62, 0,
      -0.2, -0.6, 0,
      0.3, -0.37, 0,
      0.7, -0.4, 0,
      1.0, -0.21, 0,
      1.3, -0.25, 0,
      1.5, -0.26, 0,
      1.7, -0.30, 0,
      2, -0.34, 0,
      2, -2, 0
    ], this.solidShader, gl.TRIANGLE_FAN, vec3.fromValues(0, 0, 0)));

    this.ferns = [];

    for (let i = 0; i < fernNum; i++) {
      const rootX = between(-2, 2);
      const rootY = between(-2, -1);
      const tipX = rootX + between(-0.25, 0.25);
      const tipY = rootY + between(0.5, 1.5);

      const body = makeRenderObject(
        fernVertices(vec3.fromValues(0, 0, 0), vec3.fromValues(tipX-rootX, tipY-rootY, 0), 2),
        this.solidShader, gl.TRIANGLES, 
        greens[Math.floor(between(0, greens.length))]
      );

      this.ferns.push({
        body: body,
        rootX: rootX,
        rootY: rootY,
        period: between(5, 7),
        phase: between(0, 2 * Math.PI),
        amplitude: between(0, Math.PI / 4)
      });
    }
    this.ferns.sort((a, b) => {
      if (a.rootY < b.rootY) return 1;
      if (a.rootY > b.rootY) return -1;
      return 0;
    });

    this.trees = [];

    for (let i = 0; i < treeNum; i++) {
      const rootX = between(-2, 2);
      const rootY = between(-0.7, -0.6);
      const tipX = rootX + between(-0.1, 0.1);
      const tipY = rootY + between(0.25, 0.8);

      const body = makeRenderObject(
        treeVertices(vec3.fromValues(0, 0, 0), vec3.fromValues(tipX-rootX, tipY-rootY, 0), 5),
        this.solidShader, gl.TRIANGLES, 
        browns[Math.floor(between(0, browns.length))]
      );

      this.trees.push({
        body: body,
        rootX: rootX,
        rootY: rootY,
        tipX: tipX,
        tipY: tipY,
        period: between(7, 10),
        phase: between(0, 2 * Math.PI),
        amplitude: between(0, Math.PI / 150)
      });
    }

    for (const part of this.deerParts) {
      part.renderObject = makeRenderObject(
        part.vertices,
        this.solidShader, part.mode,
        vec3.fromValues(60/256, 10/256, 10/256)
      );
    }
  }

  finalize() {
    // Finalize WebGL objects (mesh, shader, texture, ...)
    this.mesh.finalize()
    this.solidShader.finalize();
  }

  update(elapsed, dt) {
    // Updates before rendering here
    // const rotationFactor = 2;
    // const orbitFactor = 1.2;
    // const T = this.fern.transform;
    // quat.rotateZ(T.localRotation, T.localRotation, Math.PI * dt * rotationFactor);
    // vec3.set(T.localPosition, Math.cos(elapsed * orbitFactor), Math.sin(elapsed * orbitFactor), 0);

    // Clear canvas
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Rest of rendering below
    for (const otherObject of this.otherObjects) {
      otherObject.render(this.camera);
    }

    for (let i = 0; i < this.trees.length; i++) {
      const tree = this.trees[i];
      const T = tree.body.transform;
      quat.rotateZ(T.localRotation, quat.create(), Math.sin(2* Math.PI * elapsed / tree.period + tree.phase) * tree.amplitude);
      vec3.set(T.localPosition, tree.rootX, tree.rootY, 0);
      
      tree.body.render(this.camera);
    }

    for (const part of this.deerParts) {
      const timestamps = part.keyframes.map(k => k.timestamp);
      const timeStampMax = Math.max(...timestamps);
      const time = elapsed % timeStampMax;
      let i = 1;
      for (; i < part.keyframes.length; i++) {
        if (time < part.keyframes[i].timestamp) break;
      }
      const keyframe1 = part.keyframes[i - 1];
      const keyframe2 = part.keyframes[i];

      const rate = (time - keyframe1.timestamp) / (keyframe2.timestamp - keyframe1.timestamp);

      const T = part.renderObject.transform;

      const scale = keyframe1.scale + (keyframe2.scale - keyframe1.scale) * rate;
      vec3.set(T.localScale, scale, -scale, 1);

      let partAngle = keyframe1.angle + (keyframe2.angle - keyframe1.angle) * rate;
      quat.rotateZ(T.localRotation, quat.create(), partAngle * Math.PI / 180);

      let partPos = vec3.create();
      vec3.lerp(partPos, keyframe1.pos, keyframe2.pos, rate);
      vec3.set(
        T.localPosition,
        elapsed * deerSpeed % 6 - 4 + partPos[0],
        0.5 + partPos[1],
        0
      );

      part.renderObject.render(this.camera);
    }

    for (let i = 0; i < this.ferns.length; i++) {
      const fern = this.ferns[i];
      const T = fern.body.transform;
      quat.rotateZ(T.localRotation, quat.create(), Math.sin(2* Math.PI * elapsed / fern.period + fern.phase) * fern.amplitude);
      vec3.set(T.localPosition, fern.rootX, fern.rootY, 0);
      
      fern.body.render(this.camera);
    }
    
    
    
  }
}
