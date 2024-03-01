import { BufferAttribute, Color, DoubleSide, Mesh, ShaderMaterial, Shape, ShapeGeometry, Vector2, Vector3 } from "three"
import { MyObject3D } from "../webgl/myObject3D"
import { Util } from "../libs/util";
import { MousePointer } from "../core/mousePointer";
import { Func } from "../core/func";
import { ItemShader } from "../glsl/itemShader";
import { TexLoader } from "../webgl/texLoader";
import { Conf } from "../core/conf";

export class Item extends MyObject3D {

  private _mesh: Array<Mesh> = []
  private _center: Vector3 = new Vector3()
  private _points: Array<Vector2> = []
  private _colTable: Array<Color> = [
    new Color(0xa75967),
      new Color(0xc2bdb0),
      new Color(0xc8ac34),
      new Color(0x352f25),
      new Color(0xb4341f),
      new Color(0x688879),
  ]

  public get center():Vector3 { return this._center }
  public get points():Array<Vector2> { return this._points }

  constructor(_id:number, v0:Vector2, v1:Vector2, v2:Vector2) {
    super()

    this._c = _id * 0.5

    const center = this._getCenter(v0, v1, v2)
    this._center.set(center.x, center.y, center.r)

    this._points.push(v0)
    this._points.push(v1)
    this._points.push(v2)
    // this._points.push(new Vector2(center.x, center.y))

    const newV0 = v0.clone()
    const newV1 = v1.clone()
    const newV2 = v2.clone()

    const offsetRange = Util.random(0.01, 1)
    const num = 1
    for(let i = 0; i < num; i++) {
      const offset = Util.map(i, 0, offsetRange, 0, num)

      newV0.x += (center.x - newV0.x) * offset
      newV0.y += (center.y - newV0.y) * offset

      newV1.x += (center.x - newV1.x) * offset
      newV1.y += (center.y - newV1.y) * offset

      newV2.x += (center.x - newV2.x) * offset
      newV2.y += (center.y - newV2.y) * offset

      const shape = new Shape();
      shape.moveTo(newV0.x, newV0.y);
      shape.lineTo(newV1.x, newV1.y);
      shape.lineTo(newV2.x, newV2.y);
      shape.lineTo(newV0.x, newV0.y);
      const geo = new ShapeGeometry(shape);

      const centerX = (newV0.x + newV1.x + newV2.x) / 3;
      const centerY = (newV0.y + newV1.y + newV2.y) / 3;

      this._points.push(new Vector2(centerX, centerY))

      // const col = new Color(0x000000).offsetHSL(Util.random(0.25, 0.95), 1, 0.5)
      const col = Util.randomArr(this._colTable).clone().offsetHSL(0.5, 1, 0)

      const num2 = geo.attributes.position.count;
      const imgpoint = new Float32Array(num2 * 3)
      const imgpointFix = new Float32Array(num2 * 3)
      // const areaSize = this._getMaxSize(p) * 2;
      const areaSizeFix = 0.5; // ここが固定
      let i2 = 0
      while(i2 < num2) {
        const baseP = new Vector3(
          geo.attributes.position.array[i2*3+0] - centerX * 0.3,
          geo.attributes.position.array[i2*3+1] - centerY * 0.3,
          geo.attributes.position.array[i2*3+2]
        );

        const baseP2 = new Vector3(
          geo.attributes.position.array[i2*3+0],
          geo.attributes.position.array[i2*3+1],
          geo.attributes.position.array[i2*3+2]
        );

        imgpoint[i2*3+0] = ((baseP.x * 1 + areaSizeFix) * 0.5) / areaSizeFix;
        imgpoint[i2*3+1] = ((baseP.y * 1 + areaSizeFix) * 0.5) / areaSizeFix;
        imgpoint[i2*3+2] = 0;

        imgpointFix[i2*3+0] = ((baseP2.x * 1 + areaSizeFix) * 0.5) / areaSizeFix;
        imgpointFix[i2*3+1] = ((baseP2.y * 1 + areaSizeFix) * 0.5) / areaSizeFix;
        imgpointFix[i2*3+2] = 0;

        i2++
      }
      geo.setAttribute('imgpoint', new BufferAttribute(imgpoint, 3));
      geo.setAttribute('imgpointFix', new BufferAttribute(imgpointFix, 3));

      const m = new Mesh(
        geo,
        new ShaderMaterial({
          vertexShader:ItemShader.vertexShader,
          fragmentShader:ItemShader.fragmentShader,
          transparent:true,
          depthTest:false,
          side:DoubleSide,
          uniforms:{
            tDiffuse:{value:TexLoader.instance.get(Conf.instance.PATH_IMG + 'sample.png')},
            rot:{value: 0},
            fix:{value:0},
            rate:{value: 0},
            colorA:{value:new Color(0xffffff)},
            colorB:{value:col},
          },
        })
      )
      this.add(m)
      this._mesh.push(m)
    }

    this._resize()
  }


  public setRot(r: number):void {
    this._mesh.forEach((m) => {
      const uni = this._getUni(m)
      uni.rot.value = Util.radian(r)
    })
  }


  // ---------------------------------
  // 更新
  // ---------------------------------
  protected _update():void {
    super._update()

    // this._flushVal.val = Util.map(Math.sin(this._c * 0.1 * this._speed), 0, 1, -1, 1)

    // const col = this._baseCol.clone().lerp(this._tgCol, this._flushVal.val)
    // ;(this._mesh.material as MeshBasicMaterial).color = col
    // ;(this._mesh.material as MeshBasicMaterial).opacity = Util.map(this._flushVal.val, 0, 1, 0, 1)



    const sw = Func.sw()
    const sh = Func.sh()

    const center = new Vector2(
      this._center.x * sw * 0.5,
      this._center.y * sh * 0.5
    )

    const mx = MousePointer.instance.normal.x * sw * 0.5
    const my = MousePointer.instance.normal.y * sh * -0.5
    const d = center.distanceTo(new Vector2(mx, my))

    const area = sw * 0.15

    // const s = Util.map(d, 1.1, 1, 0, area)
    // this.scale.set(s, s, s)

    const noise = 0
    const noiseOffset = Util.map(d, 1, 0, 0, area)
    const noiseX = Util.range(noise) * noiseOffset
    const noiseY = Util.range(noise) * noiseOffset

    const range = Util.map(d, 1, 0, 0, area) * 0
    this.position.x = range * (mx - this._center.x) * -1 + noiseX
    this.position.y = range * (my - this._center.y) * -1 + noiseY

    this._mesh.forEach((m) => {
      const uni = this._getUni(m)
      uni.rate.value = 0
    })
  }

  //
  private _getCenter(pA:Vector2, pB:Vector2, pC:Vector2):any {
    const a = pB.distanceTo(pC)
    const b = pC.distanceTo(pA)
    const c = pA.distanceTo(pB)

    const p = a + b + c

    const x = (a * pA.x + b * pB.x + c * pC.x) / p
    const y = (a * pA.y + b * pB.y + c * pC.y) / p

    const s = p / 2
    const r = Math.sqrt((s - a) * (s - b) * (s - c) / s)

    const max = 0

    return {
        x:x,
        y:y,
        r:r,
        isSoto:(a > max || b > max || c > max)
    }
  }
}