import { vec2, vec3, vec4 } from "./gl-matrix.js";
export function generatePlane(xlen = 1, ylen = 1) {
  const data = {
    vertices: [],
    vertexNormals: [],
    textures: [],
    indices: [],
  };

  //      ^ y
  // 2---------1
  // |    |    |
  // |----+----|-> x
  // |    |    |
  // 3---------0
  // ( facing -z direction)

  xlen *= 0.5;
  ylen *= 0.5;

  data.vertices.push(
    +xlen,
    -ylen,
    0,
    -xlen,
    -ylen,
    0,
    -xlen,
    +ylen,
    0,
    +xlen,
    +ylen,
    0
  );

  data.textures.push(
    // from bottom-left, CCW
    0,
    0,
    1,
    0,
    1,
    1,
    0,
    1
  );

  data.vertexNormals.push(0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1);

  data.indices.push(0, 1, 2, 0, 2, 3);

  return data;
}

export function generateCube(xlen = 1, ylen = 1, zlen = 1) {
  const data = {
    vertices: [],
    vertexNormals: [],
    textures: [],
    indices: [],
  };

  xlen *= 0.5;
  ylen *= 0.5;
  zlen *= 0.5;

  /*
   **      3-----4
   **     /|    /|
   **    2-----5 |
   **    | 0---|-7
   **    |/    |/
   **    1-----6
   **/
  const points = [
    vec3.fromValues(-xlen, -ylen, -zlen),
    vec3.fromValues(-xlen, -ylen, +zlen),
    vec3.fromValues(-xlen, +ylen, +zlen),
    vec3.fromValues(-xlen, +ylen, -zlen),
    vec3.fromValues(+xlen, +ylen, -zlen),
    vec3.fromValues(+xlen, +ylen, +zlen),
    vec3.fromValues(+xlen, -ylen, +zlen),
    vec3.fromValues(+xlen, -ylen, -zlen),
  ];

  const uv = [
    // from bottom-left, CCW
    vec2.fromValues(0, 0),
    vec2.fromValues(1, 0),
    vec2.fromValues(1, 1),
    vec2.fromValues(0, 1),
  ];

  const normals = {
    posX: vec3.fromValues(+1, 0, 0),
    negX: vec3.fromValues(-1, 0, 0),
    posY: vec3.fromValues(0, +1, 0),
    negY: vec3.fromValues(0, -1, 0),
    posZ: vec3.fromValues(0, 0, +1),
    negZ: vec3.fromValues(0, 0, -1),
  };

  let index = 0;
  const addTri = (n, ...idx) => {
    for (const [pi, ui] of idx) {
      data.vertices.push(...points[pi]);
      data.vertexNormals.push(...n);
      data.textures.push(...uv[ui]);
      data.indices.push(index++);
    }
  };

  const addQuad = (f0, f1, f2, f3, n) => {
    addTri(n, [f0, 0], [f1, 1], [f2, 2]);
    addTri(n, [f0, 0], [f2, 2], [f3, 3]);
  };

  addQuad(1, 6, 5, 2, normals.posZ);
  addQuad(3, 2, 5, 4, normals.posY);
  addQuad(5, 6, 7, 4, normals.posX);
  addQuad(3, 4, 7, 0, normals.negZ);
  addQuad(7, 6, 1, 0, normals.negY);
  addQuad(3, 0, 1, 2, normals.negX);

  return data;
}

export function generateSphere(longitudes = 16, latitudes = 8, radius = 1) {
  const data = {
    vertices: [],
    vertexNormals: [],
    textures: [],
    indices: [],
  };

  // TODO: Implement sphere generation
  const addTri = (p0, p1, p2) => {
    data.vertices.push(...p0, ...p1, ...p2);
    data.vertexNormals.push(...p0, ...p1, ...p2);
  };

  const addQuad = (p0, p1, p2, p3) => {
    addTri(p0, p1, p2);
    addTri(p0, p2, p3);
  };

  const angle2xyz = (theta, phi) => [
    Math.cos(theta) * Math.sin(phi) * radius,
    Math.cos(phi) * radius,
    Math.sin(theta) * Math.sin(phi) * radius,
  ]

  // top pole
  for (let i = 0; i < longitudes; ++i) {
    const p0 = [0, radius, 0];
    const p1 = angle2xyz(
      i / longitudes * Math.PI * 2,
      1 / latitudes * Math.PI,
    );
    const p2 = angle2xyz(
      (i + 1) / longitudes * Math.PI * 2,
      1 / latitudes * Math.PI,
    );
    addTri(p0, p1, p2);
  }

  // bottom pole
  for (let i = 0; i < longitudes; ++i) {
    const p0 = [0, -radius, 0];
    const p1 = angle2xyz(
      (i + 1) / longitudes * Math.PI * 2,
      (latitudes - 1) / latitudes * Math.PI,
    );
    const p2 = angle2xyz(
      i / longitudes * Math.PI * 2,
      (latitudes - 1) / latitudes * Math.PI,
    );
    addTri(p0, p1, p2);
  }

  for (let i = 0; i < longitudes; ++i) {
    for (let j = 1; j < latitudes-1; ++j) {
      const p0 = angle2xyz(
        i / longitudes * Math.PI * 2,
        j / latitudes * Math.PI,
      );
      const p1 = angle2xyz(
        i / longitudes * Math.PI * 2,
        (j + 1) / latitudes * Math.PI,
      );
      const p2 = angle2xyz(
        (i + 1) / longitudes * Math.PI * 2,
        (j+1) / latitudes * Math.PI,
      );
      const p3 = angle2xyz(
        (i + 1) / longitudes * Math.PI * 2,
        j / latitudes * Math.PI,
      );

      addQuad(p0, p1, p2, p3);
    }
  }
  
  return data;
}

export function generateCone(sides = 16, radius = 1, height = 1) {
  const data = {
    vertices: [],
    vertexNormals: [],
    textures: [],
    indices: [],
  };

  // TODO: Implement cone generation
  const addTri = (p0, p1, p2) => {
    data.vertices.push(...p0, ...p1, ...p2);
    data.vertexNormals.push(...p0, ...p1, ...p2);
  };

  const origin = [0, 0, 0];
  const top = [0, 0, height];

  for (let i = 0; i < sides; i++) {
    const theta1 = i / sides * Math.PI * 2;
    const theta2 = (i + 1) / sides * Math.PI * 2;
    const p0 = [ Math.cos(theta1) * radius, Math.sin(theta1) * radius, 0];
    const p1 = [ Math.cos(theta2) * radius, Math.sin(theta2) * radius, 0];
    addTri(p0, p1, top);
    addTri(p1, p0, origin);
  }

  return data;
}

export function generateCylinder(sides = 16, radius = 1, height = 1) {
  const data = {
    vertices: [],
    vertexNormals: [],
    textures: [],
    indices: [],
  };

  // TODO: Implement cylinder generation
  const addTri = (p0, p1, p2) => {
    data.vertices.push(...p0, ...p1, ...p2);
    data.vertexNormals.push(...p0, ...p1, ...p2);
  };
  const addQuad = (p0, p1, p2, p3) => {
    addTri(p0, p1, p2);
    addTri(p0, p2, p3);
  };

  const origin = [0, 0, 0];
  const top = [0, 0, height];

  for (let i = 0; i < sides; i++) {
    const theta1 = i / sides * Math.PI * 2;
    const theta2 = (i + 1) / sides * Math.PI * 2;
    const p0 = [ Math.cos(theta1) * radius, Math.sin(theta1) * radius, 0];
    const p1 = [ Math.cos(theta2) * radius, Math.sin(theta2) * radius, 0];
    const p2 = [ Math.cos(theta2) * radius, Math.sin(theta2) * radius, height];
    const p3 = [ Math.cos(theta1) * radius, Math.sin(theta1) * radius, height];
    addQuad(p0, p1, p2, p3);
    addTri(p1, p0, origin);
    addTri(p3, p2, top);
  }

  return data;
}
