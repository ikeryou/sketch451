const ItemShader = {
  uniforms: {},

  vertexShader: /* glsl */ `
    uniform float rot;
    uniform float fix;
    uniform float rate;
    attribute vec3 imgpoint;
    attribute vec3 imgpointFix;

    varying vec2 vUv;

    vec3 rotate(vec3 p, float angle, vec3 axis){
      vec3 a = normalize(axis);
      float s = sin(angle);
      float c = cos(angle);
      float r = 1.0 - c;
      mat3 m = mat3(
        a.x * a.x * r + c,
        a.y * a.x * r + a.z * s,
        a.z * a.x * r - a.y * s,
        a.x * a.y * r - a.z * s,
        a.y * a.y * r + c,
        a.z * a.y * r + a.x * s,
        a.x * a.z * r + a.y * s,
        a.y * a.z * r - a.x * s,
        a.z * a.z * r + c
      );
      return m * p;
    }

    void main(){
      vUv = rotate(mix(imgpoint, imgpointFix, 1.0), mix(rot, 0.0, fix), vec3(0.0, 0.0, 1.0)).xy;

      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * mvPosition;
    }`,

  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform vec3 colorA;
    uniform vec3 colorB;
    uniform float rate;

    varying vec2 vUv;

    void main(void) {
      vec4 dest = texture2D(tDiffuse, vUv);
      // dest.rgb = mix(colorA, colorB, rate);
      // dest.a = 1.0;
      gl_FragColor = dest;
    }`,
}

export { ItemShader }
