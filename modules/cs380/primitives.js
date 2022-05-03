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

export function generateEllipsoid(longitudes = 16, latitudes = 8, rx = 0.5, ry = 1, rz = 1.5) {
  const data = {
    vertices: [],
    vertexNormals: [],
    textures: [],
    indices: [],
  };

  // TODO: Implement sphere generation
  const addTri = (p0, p1, p2) => {
    data.vertices.push(...p0, ...p1, ...p2);
    data.vertexNormals.push(...[
      p0[0]/rx**2, p0[1]/ry**2, p0[2]/rz**2,
      p1[0]/rx**2, p1[1]/ry**2, p1[2]/rz**2,
      p2[0]/rx**2, p2[1]/ry**2, p2[2]/rz**2,
    ]);
  };

  const addQuad = (p0, p1, p2, p3) => {
    addTri(p0, p1, p2);
    addTri(p0, p2, p3);
  };

  const angle2xyz = (theta, phi) => [
    Math.cos(theta) * Math.sin(phi) * rx,
    Math.cos(phi) * ry,
    Math.sin(theta) * Math.sin(phi) * rz,
  ]

  // top pole
  for (let i = 0; i < longitudes; ++i) {
    const p0 = [0, ry, 0];
    const p1 = angle2xyz(
      i / longitudes * Math.PI * 2,
      1 / latitudes * Math.PI,
    );
    const p2 = angle2xyz(
      (i + 1) / longitudes * Math.PI * 2,
      1 / latitudes * Math.PI,
    );
    addTri(p0, p2, p1);
  }

  // bottom pole
  for (let i = 0; i < longitudes; ++i) {
    const p0 = [0, -ry, 0];
    const p1 = angle2xyz(
      (i + 1) / longitudes * Math.PI * 2,
      (latitudes - 1) / latitudes * Math.PI,
    );
    const p2 = angle2xyz(
      i / longitudes * Math.PI * 2,
      (latitudes - 1) / latitudes * Math.PI,
    );
    addTri(p0, p2, p1);
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

      addQuad(p0, p3, p2, p1);
    }
  }
  
  return data;
}

export function generateSphere(longitudes = 16, latitudes = 8, radius = 1) {
  return generateEllipsoid(longitudes, latitudes, radius, radius, radius);
}

function isFront(i, longitudes) {
  const deg = (i+0.5) / longitudes * 360;
  return (55 <= deg) && (deg <= 125);
}

export function generateHair(longitudes = 16, latitudes = 8, rx = 0.5, ry = 1, rz = 1.5, coverage = 0.3, falloff = 0.5) {
  const data = {
    vertices: [],
    vertexNormals: [],
    textures: [],
    indices: [],
  };

  // TODO: Implement sphere generation
  const addTri = (p0, p1, p2) => {
    data.vertices.push(...p0, ...p1, ...p2);
    data.vertexNormals.push(...[
      p0[0]/rx**2, p0[1]/ry**2, p0[2]/rz**2,
      p1[0]/rx**2, p1[1]/ry**2, p1[2]/rz**2,
      p2[0]/rx**2, p2[1]/ry**2, p2[2]/rz**2,
    ]);
  };

  const addQuad = (p0, p1, p2, p3) => {
    addTri(p0, p1, p2);
    addTri(p0, p2, p3);
  };

  const angle2xyz = (theta, phi) => [
    Math.cos(theta) * Math.sin(phi) * rx,
    Math.cos(phi) * ry,
    Math.sin(theta) * Math.sin(phi) * rz,
  ]

  // top pole
  for (let i = 0; i < longitudes; ++i) {
    const condCoverage = isFront(i, longitudes) ? coverage : 0.5;
    const p0 = [0, ry, 0];
    const p1 = angle2xyz(
      i / longitudes * Math.PI * 2,
      1 / latitudes * Math.PI * condCoverage,
    );
    const p2 = angle2xyz(
      (i + 1) / longitudes * Math.PI * 2,
      1 / latitudes * Math.PI * condCoverage,
    );
    addTri(p0, p2, p1);
  }

  for (let i = 0; i < longitudes; ++i) {
    const front = isFront(i, longitudes);
    const condCoverage = front ? coverage : 0.5;
    for (let j = 1; j < latitudes; ++j) {
      const p0 = angle2xyz(
        i / longitudes * Math.PI * 2,
        j / latitudes * Math.PI * condCoverage,
      );
      const p1 = angle2xyz(
        i / longitudes * Math.PI * 2,
        (j + 1) / latitudes * Math.PI * condCoverage,
      );
      const p2 = angle2xyz(
        (i + 1) / longitudes * Math.PI * 2,
        (j+1) / latitudes * Math.PI * condCoverage,
      );
      const p3 = angle2xyz(
        (i + 1) / longitudes * Math.PI * 2,
        j / latitudes * Math.PI * condCoverage,
      );
      addQuad(p0, p3, p2, p1);
    }
    if (!front) {
      const p0 = [Math.cos(i / longitudes * Math.PI * 2) * rx, 0, Math.sin(i / longitudes * Math.PI * 2) * rz];
      const p1 = [Math.cos((i + 1) / longitudes * Math.PI * 2) * rx, 0, Math.sin((i + 1) / longitudes * Math.PI * 2) * rz];
      const p2 = [Math.cos((i + 1) / longitudes * Math.PI * 2) * rx, -ry*2*falloff, Math.sin((i + 1) / longitudes * Math.PI * 2) * rz];
      const p3 = [Math.cos(i / longitudes * Math.PI * 2) * rx, -ry*2*falloff, Math.sin(i / longitudes * Math.PI * 2) * rz];
      const p0n = p0.map(x => -x);
      const p1n = p1.map(x => -x);
      data.vertices.push(...p0, ...p1, ...p2);
      data.vertices.push(...p0, ...p2, ...p3);
      data.vertexNormals.push(...p0, ...p1, ...p1);
      data.vertexNormals.push(...p0, ...p1, ...p0);
      data.vertices.push(...p2, ...p1, ...p0);
      data.vertices.push(...p3, ...p2, ...p0);
      data.vertexNormals.push(...p1n, ...p1n, ...p0);
      data.vertexNormals.push(...p0n, ...p1n, ...p0n);
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
    // data.vertexNormals.push(...p0, ...p1, ...p2);
  };

  const origin = [0, 0, 0];
  const top = [0, height, 0];
  const topNeg = [0, -height, 0];

  for (let i = 0; i < sides; i++) {
    const theta1 = i / sides * Math.PI * 2;
    const theta2 = (i + 1) / sides * Math.PI * 2;
    const theta12 = (theta1 + theta2) / 2;
    const p0 = [ Math.cos(theta1) * radius, 0, Math.sin(theta1) * radius];
    const p1 = [ Math.cos(theta2) * radius, 0, Math.sin(theta2) * radius];
    const n0 = [ Math.cos(theta1) * radius, radius*radius/height, Math.sin(theta1) * radius];
    const n1 = [ Math.cos(theta2) * radius, radius*radius/height, Math.sin(theta2) * radius];
    const nTop = [ Math.cos(theta12) * radius, radius*radius/height, Math.sin(theta12) * radius];
    addTri(p1, p0, top);
    data.vertexNormals.push(...n0, ...n1, ...nTop);
    addTri(p0, p1, origin);
    data.vertexNormals.push(...topNeg, ...topNeg, ...topNeg);
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
    // data.vertexNormals.push(...p0, ...p1, ...p2);
  };
  const addQuad = (p0, p1, p2, p3) => {
    addTri(p0, p1, p2);
    addTri(p0, p2, p3);
  };

  const origin = [0, 0, 0];
  const top = [0, height, 0];
  const topNeg = [0, -height, 0];

  for (let i = 0; i < sides; i++) {
    const theta1 = i / sides * Math.PI * 2;
    const theta2 = (i + 1) / sides * Math.PI * 2;
    const p0 = [ Math.cos(theta1) * radius, 0, -Math.sin(theta1) * radius];
    const p1 = [ Math.cos(theta2) * radius, 0, -Math.sin(theta2) * radius];
    const p2 = [ Math.cos(theta2) * radius, height, -Math.sin(theta2) * radius];
    const p3 = [ Math.cos(theta1) * radius, height, -Math.sin(theta1) * radius];
    addQuad(p0, p1, p2, p3);
    data.vertexNormals.push(...p0, ...p1, ...p1, ...p0, ...p1, ...p0);
    addTri(p1, p0, origin);
    data.vertexNormals.push(...topNeg, ...topNeg, ...topNeg);
    addTri(p3, p2, top);
    data.vertexNormals.push(...top, ...top, ...top);
  }

  return data;
}
