import gl from "../gl.js";
import { vec3, mat4, quat, glMatrix } from "../cs380/gl-matrix.js";

import * as cs380 from "../cs380/cs380.js";

import  { SolidShader }  from "../solid_shader.js";
import { VertexColorShader } from "../vertex_color_shader.js";

import { LightType, Light, BlinnPhongShader } from "../blinn_phong.js";

import { Skybox, SkyboxShader } from "../skybox_shader.js";

import { UnlitTextureShader } from "../unlit_texture_shader.js";
import { PipEdgeShader } from "../pip_edge_shader.js";

function between(a, b) {
  return Math.random() * (b - a) + a;
}

const start = 0.1;
const fernNum = 50;
const treeNum = 20;

const deerLegStompRate = 1.5; // time for its leg to return back to original position
const deerSpeed = 0.6; // units per second
const deerScale = 0.001;

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
]

// body
const bodyVertices1 = [
  392.74, 517.47, 0.02,
  362.74, 402.92, 0.02,
  143.1 ,445.42, 0.02,
  8.74, 562.92, 0.02,
  2.74, 614.92, 0.02,
  25.74, 619.92, 0.02,
  115.74, 782.92, 0.02,
  210.74, 853.92, 0.02,
  354.74, 835.92, 0.02,
  539.74, 887.92, 0.02,
  748.24, 835.92, 0.02,
  896.74, 848.92, 0.02,
  1021.74, 814.92, 0.02,
  1099.74, 720.92, 0.02,
  1231.74, 600.92, 0.02,
  1302.74, 499.92, 0.02,
  1325.77, 423.42, 0.02,
  1309.74, 387.92, 0.02,
  1066.74, 359.92, 0.02,
  1011.74, 393.92, 0.02,
  801.74, 384.92, 0.02,
  624.74, 428.92, 0.02,
  354.74, 401.92, 0.02,
];
// head & right ear
const bodyVertices2 = [
  1154.74, 183.92, 0.02,
  1180.74, 138.92, 0.02,
  1159.74, 125.92, 0.02,
  1147.74, 82.92, 0.02,
  1107.74, 35.92, 0.02,
  1073.74, 36.92, 0.02,
  1066.74, 95.92, 0.02,
  1087.74, 154.92, 0.02,
  1128.74, 196.92, 0.02,
  1133.74, 215.92, 0.02,
  1111.74, 279.92, 0.02,
  1066.74, 359.92, 0.02,
  1309.74, 387.92, 0.02,
  1325.77, 361.86, 0.02,
  1372.74, 361.92, 0.02,
  1393.74, 367.92, 0.02,
  1422.74, 354.92, 0.02,
  1443.74, 336.92, 0.02,
  1443.74, 293.37, 0.02,
  1406.74, 262.92, 0.02,
  1378.74, 232.92, 0.02,
  1378.74, 185.92, 0.02,
  1371.74, 164.92, 0.02,
  1344.74, 144.92, 0.02,
  1313.74, 138.92, 0.02,
  1263.74, 134.92, 0.02,
  1178.74, 138.92, 0.02,
]
// left ear
const bodyVertices3 = [
  1361.74, 88.92, 0.02,
  1344.74, 144.92, 0.02,
  1373.74, 130.92, 0.02,
  1389.61, 130.92, 0.02,
  1423.74, 94.92, 0.02,
  1443.74, 58.18, 0.02,
  1449.74, 23.92, 0.02,
  1422.74, 2.92, 0.02,
  1369.74, 27.92, 0.02,
  1334.74, 64.92, 0.02,
  1313.74, 138.92, 0.02,
  1345.74, 144.92, 0.02,
]
const hindLegVertices = [
  359.74, 800.92, 0.02,
  285.74, 753.92, 0.02,
  266.24, 997.24, 0.02,
  222.74, 817.92, 0.02,
  241.74, 1036.92, 0.02,
  139.74, 1019.92, 0.02,
  239.74, 1094.92, 0.02,
  197.64, 1161.04, 0.02,
  327.15, 1309.94, 0.02,
  281.74, 1376.92, 0.02,
  339.74, 1340.92, 0.02,
  298.74, 1366.92, 0.02,
  392.74, 1406.92, 0.02,
  311.46, 1376.92, 0.02,
  354.41, 1423.42, 0.02,
  311.46, 1403.85, 0.02,
];

const foreLegVertices = [
  818.74, 727.92, 0.02,
  761.74, 796.92, 0.02,
  914.74, 791.92, 0.02,
  761.74, 980.35, 0.02,
  811.04, 1088.67, 0.02,
  747.84, 1036.35, 0.02,
  779.74, 1137.92, 0.02,
  726.24, 1178.34, 0.02,
  741.74, 1298.92, 0.02,
  667.74, 1316.92, 0.02,
  748.24, 1322.32, 0.02,
  673.74, 1343.92, 0.02,
  748.24, 1348.32, 0.02,
  681.74, 1363.92, 0.02,
  768.74, 1386.92, 0.02,
  700.74, 1394.92, 0.02,
  756.04, 1404.32, 0.02,
  726.24, 1404.32, 0.02,
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
    root[0], root[1], 0.03,
    tip[0], tip[1], 0.03,
    left[0], left[1], 0.03,
    root[0], root[1], 0.03,
    tip[0], tip[1], 0.03,
    right[0], right[1], 0.03,
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

function treeVertices(root,  tip, level, z) {

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
    tiptip[0], tiptip[1], 0.01 + z,
    topLeft[0], topLeft[1], 0.01 + z,
    bottomLeft[0], bottomLeft[1], 0.01 + z,
    tiptip[0], tiptip[1], 0.01 + z,
    bottomLeft[0], bottomLeft[1], 0.01 + z,
    bottomRight[0], bottomRight[1], 0.01 + z,
    tiptip[0], tiptip[1], 0.01 + z,
    bottomRight[0], bottomRight[1], 0.01 + z,
    topRight[0], topRight[1], 0.01 + z,
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
      vertices = vertices.concat(treeVertices(tip, newTip, level - 1, z));
    }
  }
  
  return vertices;
}

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

class Framebuffer {
  constructor() {
    this.finalize();
  }

  finalize() {
    gl.deleteTexture(this.colorTexture);
    gl.deleteRenderbuffer(this.dbo);
    gl.deleteFramebuffer(this.fbo);
    this.initialized = false;
  }

  initialize(width, height) {
    if (this.initialized) this.finalize();

    this.fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    this.colorTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.colorTexture);
    // Unlike picking buffer, it uses linear sampling
    // so that the sampled image is less blocky under extreme distortion
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGB,
      width,
      height,
      0,
      gl.RGB,
      gl.UNSIGNED_BYTE,
      null
    );

    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      this.colorTexture,
      0
    );

    this.dbo = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.dbo);
    gl.renderbufferStorage(
      gl.RENDERBUFFER,
      gl.DEPTH_COMPONENT16,
      width,
      height
    );

    gl.framebufferRenderbuffer(
      gl.FRAMEBUFFER,
      gl.DEPTH_ATTACHMENT,
      gl.RENDERBUFFER,
      this.dbo
    );

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }
}

class PhotoFilm {
  async initialize(width, height) {
    this.enabled = false;
    this.printFinished = false;
    this.width = width;
    this.height = height;

    this.framebuffer = new Framebuffer();
    this.framebuffer.initialize(width, height);

    const planeMeshData = cs380.primitives.generatePlane(1,1);
    const planeMesh = cs380.Mesh.fromData(planeMeshData);
    const shader = await cs380.buildShader(UnlitTextureShader);
    
    this.transform = new cs380.Transform();
    quat.rotateY(this.transform.localRotation, quat.create(), Math.PI);

    this.background = new cs380.RenderObject(planeMesh, shader);
    this.background.uniforms.useScreenSpace = true;
    this.background.uniforms.useColor = true;
    this.background.uniforms.solidColor = vec3.fromValues(1,1,1);
    vec3.set(this.background.transform.localScale, 1.2, 1.4, 1);
    this.background.transform.setParent(this.transform);

    this.image = new cs380.RenderObject(planeMesh, shader);
    this.image.uniforms.useScreenSpace = true;
    this.image.uniforms.useColor = false;
    this.image.uniforms.mainTexture = this.framebuffer.colorTexture;
    vec3.set(this.image.transform.localPosition, 0, 0.1, 0);
    this.image.transform.setParent(this.transform);

    this.thingsToClear = [shader, planeMesh, this.framebuffer];

    this.handleMouseDown = (e) => {
      if (this.printFinished) this.hide();
    }
    document.addEventListener("mousedown", this.handleMouseDown);
  }

  render(camera) {
    if (!this.enabled) return;
    const prevDepthFunc = gl.getParameter(gl.DEPTH_FUNC);
    gl.depthFunc(gl.ALWAYS);
    this.background.render(camera);
    this.image.render(camera);
    gl.depthFunc(prevDepthFunc);
  }

  finalize() {
    for (const thing of this.thingsToClear) {
      thing.finalize();
    }

    document.removeEventListener("mousedown", this.handleMouseDown);
  }

  show(elapsed) {
    this.enabled = true;
    this.printFinished = false;
    this.showStartTime = elapsed;
  }

  update(elapsed) {
    if (!this.enabled) return;
    const time = elapsed - this.showStartTime;
    let yPos = 2 - Math.min(2, time * 0.8);
    this.transform.localPosition[1] = yPos;

    this.printFinished = yPos < 0.001;
  }

  hide() {
    this.enabled = false;
  }
}

export default class Assignment4 extends cs380.BaseApp {
  async initialize() {
    // Basic setup for camera
    const { width, height } = gl.canvas.getBoundingClientRect();
    const aspectRatio = width / height;
    this.camera = new cs380.Camera();
    vec3.set(this.camera.transform.localPosition, 0, 2, 9);
    this.camera.transform.lookAt(vec3.fromValues(0, -1, -9));
    mat4.perspective(
      this.camera.projectionMatrix,
      (45 * Math.PI) / 180,
      aspectRatio,
      0.01,
      1000
    );

    this.width = width;
    this.height = height;

    // Rest of initialization below
    this.thingsToClear = [];

    this.photo = new PhotoFilm()
    await this.photo.initialize(width, height);
    this.thingsToClear.push(this.photo);
    
    // SimpleOrbitControl
    const orbitControlCenter = vec3.fromValues(0, 0, 0);
    this.simpleOrbitControl = new cs380.utils.SimpleOrbitControl(
      this.camera,
      orbitControlCenter
    );
    this.thingsToClear.push(this.simpleOrbitControl);

    // SKYBOX #########################################################

    // Rest of initialization below
    const textureLoader = cs380.TextureLoader.load({
      // posX: 'resources/skybox/right.jpg',
      // negX: 'resources/skybox/left.jpg',
      // posY: 'resources/skybox/top.jpg',
      // negY: 'resources/skybox/bottom.jpg',
      // posZ: 'resources/skybox/front.jpg',
      // negZ: 'resources/skybox/back.jpg',
      posX: 'resources/skybox/right.png',
      negX: 'resources/skybox/left.png',
      posY: 'resources/skybox/top.png',
      negY: 'resources/skybox/bottom.png',
      posZ: 'resources/skybox/front.png',
      negZ: 'resources/skybox/back.png',
    });

    const shaderLoader = cs380.ShaderLoader.load({
      skyboxShader: SkyboxShader.source,
    });

    const loaderResult = await Promise.all([textureLoader, shaderLoader]);
    const textureLoaderResult = loaderResult[0];
    const shaderLoaderResult = loaderResult[1];

    // create Skybox
    // generate cubemap texture
    const cubemap = new cs380.Cubemap();
    this.thingsToClear.push(cubemap);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    cubemap.initialize([
      [gl.TEXTURE_CUBE_MAP_POSITIVE_X, textureLoaderResult.posX],
      [gl.TEXTURE_CUBE_MAP_NEGATIVE_X, textureLoaderResult.negX],
      [gl.TEXTURE_CUBE_MAP_POSITIVE_Y, textureLoaderResult.posY],
      [gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, textureLoaderResult.negY],
      [gl.TEXTURE_CUBE_MAP_POSITIVE_Z, textureLoaderResult.posZ],
      [gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, textureLoaderResult.negZ]
    ]);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    const skyboxShader = new SkyboxShader();
    this.thingsToClear.push(skyboxShader);
    skyboxShader.initialize(shaderLoaderResult.skyboxShader);


    const cubeMeshData = cs380.primitives.generateCube();
    const skyboxMesh = cs380.Mesh.fromData(cubeMeshData);

    this.thingsToClear.push(skyboxMesh);
    this.skybox = new Skybox(skyboxMesh, skyboxShader);
    this.skybox.uniforms.mainTexture = cubemap.id;


    // initialize picking shader & buffer
    const pickingShader = await cs380.buildShader(cs380.PickingShader);
    const blinnPhongShader = await cs380.buildShader(BlinnPhongShader);
    this.pickingBuffer = new cs380.PickingBuffer();
    this.pickingBuffer.initialize(width, height);
    this.thingsToClear.push(pickingShader, blinnPhongShader, this.pickingBuffer);
    
    this.pressed = {};

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
      2, 2, -0.01, 11/256, 41/256, 91/256,  // navy
      -2, 2, -0.01, 11/256, 41/256, 91/256,
      2, 0.4, -0.01, 175/256, 175/256, 175/256, // gray
      -2, 0.4, -0.01, 175/256, 175/256, 175/256,
      2, -0.5, -0.01, 249/256, 141/256, 27/256, // orange
      -2,-0.5, -0.01, 249/256, 141/256, 27/256,
      2, -0.7, -0.01, 249/256, 141/256, 27/256,
      -2,-0.7, -0.01, 249/256, 141/256, 27/256
      
    ], this.vertexColorShader, gl.TRIANGLE_STRIP));

    // ground
    this.otherObjects.push(makeRenderObject([
      2, -2, 0,
      2, -0.34, 0,
      1.7, -0.30, 0,
      1.5, -0.26, 0,
      1.3, -0.25, 0,
      1.0, -0.21, 0,
      0.7, -0.4, 0,
      0.3, -0.37, 0,
      -0.2, -0.6, 0,
      -0.8, -0.62, 0,
      -1.5, -0.6, 0,
      -2, -0.55, 0,
      -2, -2, 0,
      0, -2, 0,
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
        treeVertices(vec3.fromValues(0, 0, 0), vec3.fromValues(tipX-rootX, tipY-rootY, 0), 5, 0.009 * i / treeNum),
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

    // Setup GUIs
    // TODO: add camera effects of your own
    // Change "my-effect" and "My camera effect" to fitting name for your effect.
    // You can add multiple options.
    document.getElementById("settings").innerHTML = `
      <!-- Camera shutter UI --> 
      <audio id="shutter-sfx">
        <source src="resources/shutter_sfx.ogg" type="audio/ogg">
      </audio> 
      <button type="button" id="shutter">Take a picture!</button><br/>

      <!-- TODO: Add camera effect lists here --> 
      <label for="setting-effect">Camera effect</label>
      <select id="setting-effect">
        <option value="none">None</option>
        <option value="my-effect">My camera effect</option>
      </select> <br/>

      <!-- OPTIONAL: Add more UI elements here --> 

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
        <li>Reuse HW1 Animated Background [1 pt]</li>
        <li>Reuse HW2: Avatar with adjustable pose [0.5 pt]</li>
        <li>Reuse HW3: Phong shading lightings [1 pt]</li>
        <li>Skybox [0.5 pt] </li>
        <li>Camera Effects [2 pt] </li>
        <li>Show some creativity in your scene [1 pts]</li>
      </ul>
      Implement creative camera effects for your virtual camera booth. <br/>
      <strong>Have fun!</strong>
    `;

    const shutterAudio = document.getElementById('shutter-sfx');
    document.getElementById('shutter').onclick = () => {
      this.shutterPressed = true;
      shutterAudio.play();
    };

    this.camereEffect = 'none';
    cs380.utils.setInputBehavior(
      'setting-effect',
      (val) => { this.camereEffect = val; },
      true,
      false
    );

    cs380.utils.setInputBehavior('ambient-illuminance', (val) => { this.ambientLight.illuminance=val;}, true, true);
    cs380.utils.setInputBehavior('directional-illuminance', (val) => { this.directionalLight.illuminance=val;}, true, true);
    cs380.utils.setInputBehavior('point-illuminance', (val) => { this.pointLight.illuminance=val;}, true, true);
    cs380.utils.setInputBehavior('point-pos-x', (val) => { this.pointLight.transform.localPosition[0]=val; }, true, true);
    cs380.utils.setInputBehavior('point-pos-y', (val) => { this.pointLight.transform.localPosition[1]=val; }, true, true);
    cs380.utils.setInputBehavior('point-pos-z', (val) => { this.pointLight.transform.localPosition[2]=val; }, true, true);
    cs380.utils.setInputBehavior('spot-illuminance', (val) => { this.spotLight.illuminance=val; }, true, true);
    cs380.utils.setInputBehavior('spot-pos-x', (val) => { this.spotLight.transform.localPosition[0]=val; }, true, true);
    cs380.utils.setInputBehavior('spot-pos-y', (val) => { this.spotLight.transform.localPosition[1]=val; }, true, true);
    cs380.utils.setInputBehavior('spot-pos-z', (val) => { this.spotLight.transform.localPosition[2]=val; }, true, true);
    cs380.utils.setInputBehavior('spot-angle', (val) => { console.log(val);this.spotLight.angle=glMatrix.toRadian(val); }, true, true);
    cs380.utils.setInputBehavior('spot-angle-smoothness', (val) => { this.spotLight.angleSmoothness=val; }, true, true);
    cs380.utils.setInputBehavior('fire-illuminance', (val) => { this.fire.illuminance=val; }, true, true);

    // GL settings
    // gl.enable(gl.CULL_FACE);
    // gl.cullFace(gl.BACK);
    // gl.frontFace(gl.CCW);
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

    this.mesh.finalize()
    this.solidShader.finalize();

    document.removeEventListener("keydown", this.handleKeyDown);
    document.removeEventListener("keyup", this.handleKeyUp);
    gl.canvas.removeEventListener("mousedown", this.handleMouseDown);
    this.thingsToClear.forEach((it) => it.finalize());
  }

  update(elapsed, dt) {
    this.simpleOrbitControl.update(dt);

    for (let i = 0; i < this.trees.length; i++) {
      const tree = this.trees[i];
      const T = tree.body.transform;
      quat.rotateZ(T.localRotation, quat.create(), Math.sin(2* Math.PI * elapsed / tree.period + tree.phase) * tree.amplitude);
      vec3.set(T.localPosition, tree.rootX, tree.rootY + 0.3, -1);
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
        0.5 + partPos[1] + 0.3,
        -1
      );
    }

    for (let i = 0; i < this.ferns.length; i++) {
      const fern = this.ferns[i];
      const T = fern.body.transform;
      quat.rotateZ(T.localRotation, quat.create(), Math.sin(2* Math.PI * elapsed / fern.period + fern.phase) * fern.amplitude);
      vec3.set(T.localPosition, fern.rootX, fern.rootY + 0.3, -1);
    }

    for (const otherObject of this.otherObjects) {
      otherObject.transform.localScale = vec3.fromValues(1.2, 1.2, 1);
      otherObject.transform.localPosition = vec3.fromValues(0, 0.5, -1);
    };

    const camMoveSpeed = 1;
    const camRotSpeed = 1;
    const partRotSpeed = 1;

    const CT = this.camera.transform;

    const right = [CT.worldMatrix[0], CT.worldMatrix[4], CT.worldMatrix[8]];
    const up = [CT.worldMatrix[1], CT.worldMatrix[5], CT.worldMatrix[9]];
    const forward = [CT.worldMatrix[2], CT.worldMatrix[6], -CT.worldMatrix[10]];

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
    
    // OPTIONAL: render PickableObject to the picking buffer here
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

    // Render effect-applied scene to framebuffer of the photo if shutter is pressed
    if (this.shutterPressed) {
      this.shutterPressed = false;
      this.renderImage(this.photo.framebuffer.fbo, this.photo.width, this.photo.height);
      this.photo.show(elapsed); // Initiates photo-printing animation
    }

    // // Render effect-applied scene to the screen
    this.renderImage(null);

    // Photos are rendered at the very last
    this.photo.update(elapsed);
    this.photo.render(this.camera);
  }

  renderScene() {
    // TODO: render scene *without* any effect
    // It would consist of every render(...) calls of objects in the scene

    /* Example code
    this.skybox.render(this.camera);
    this.animatedBackground.render(this.camera);
    this.avatar.render(this.camera);
    ...
    */

    this.skybox.render(this.camera);

    for (const otherObject of this.otherObjects) otherObject.render(this.camera);

    for (let i = 0; i < this.trees.length; i++) this.trees[i].body.render(this.camera);

    for (const part of this.deerParts) part.renderObject.render(this.camera);

    for (let i = 0; i < this.ferns.length; i++) this.ferns[i].body.render(this.camera);

    for (const o of Object.values(this.objects)) o.render(this.camera);
    
    this.floor.render(this.camera);
  }

  renderImage(fbo = null, width = null, height = null) {
    // Parameters:
    //  * fbo: Target framebuffer object, default is to the canvas
    //  * width: Width of the target framebuffer, default is canvas'
    //  * height: Height of the target framebuffer default is canvas'

    if (!width) width = this.width;
    if (!height) height = this.height;
    if (this.camereEffect == 'none') {
      // no camera effect - render directly to the scene
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.viewport(0, 0, width, height);
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clearDepth(1.0);
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LESS);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      this.renderScene();
    } else {
      // TODO: render the scene with some camera effect to the target framebuffer object (fbo)
      // Write at least one camera effect shader, which takes a rendered texture and draws modified version of the given texture
      //
      // Step-by-step guide:
      //  1) Bind a separate framebuffer that you initialized beforehand
      //  2) Render the scene to the framebuffer
      //    - You probably need to use this.renderScene() here
      //    - If the width/height differ from the target framebuffer, use gl.viewPort(..)
      //  3) Bind a target framebuffer (fbo)
      //  4) Render a plane that fits the viewport with a camera effect shader
      //    - The plane should perfectly fit the viewport regardless of the camera movement (similar to skybox)
      //    - You may change the shader for a RenderObject like below:
      //        this.my_object.render(this.camera, *my_camera_effect_shader*)

      // TODO: Remove the following line after you implemented.
      // (and please, remove any console.log(..) within the update loop from your submission)
      console.log("TODO: camera effect (" + this.camereEffect + ")");

      // Below codes will do no effectl it just renders the scene. You may (should?) delete this.
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.viewport(0, 0, width, height);
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clearDepth(1.0);
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LESS);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      this.renderScene();
    }
  }
}
