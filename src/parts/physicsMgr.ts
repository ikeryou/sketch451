import Matter, { Body, Composite, Engine, Render, Runner } from "matter-js";
import { Conf } from "../core/conf";
import { Func } from "../core/func";
import { MyObject3D } from "../webgl/myObject3D";
import { Util } from "../libs/util";
import { Vector2 } from "three";

export class PhysicsMgr extends MyObject3D {

  private _runner:Runner;
  private _isStart:boolean = false;

  // 外枠
  // private _frame:Array<Body> = [];
  // private _frameSize:number = 100;

  public engine:Engine;
  public render:Render;
  // public mouse:Body;
  public isUpdate:boolean = true;
  public bodies:Array<Body> = [];
  public startBodiesPosition:Array<Vector2> = [];

  private _bCnt:number = 0;

  constructor(opt: any) {
    super()

    // エンジン
    this.engine = Engine.create();
    this.engine.gravity.x = 0;
    this.engine.gravity.y = 0.5;

    // レンダラー
    this.render = Render.create({
      element: opt.body,
      engine: this.engine,
      options: {
        width: Func.sw(),
        height: Func.sh(),
        showAngleIndicator: false,
        showCollisions: false,
        showVelocity: false,
        pixelRatio:Conf.instance.FLG_SHOW_MATTERJS ? 1 : 0.1
      }
    });
    this.render.canvas.classList.add('l-matter');

    if(!Conf.instance.FLG_SHOW_MATTERJS) {
      this.render.canvas.classList.add('-hide');
    }

    // this._makeLine(sh * 0.2);

    // マウス
    // const mouseSize = Func.sw() * Func.val(0.2, 0.1) * 1;
    // this.mouse = Bodies.circle(0, 0, mouseSize, {isStatic:true, render:{visible: Conf.FLG_SHOW_MATTERJS}});
    // Composite.add(this.engine.world, [
    //   this.mouse,
    // ]);
    // Body.setPosition(this.mouse, {x:9999, y:9999});

    this._runner = Runner.create();

    this._resize()
  }

  private _convert(x: number, y:number): Vector2 {
    const sw = Math.min(Func.sw(), Func.sh()) * 1
    const sh = sw
    return new Vector2(
      Util.map(x, 0, sw, -0.5, 0.5),
      Util.map(y, sh, 0, -0.5, 0.5)
    )
  }

  public makeBody(v: Array<Array<Vector2>>): void {
    // const sw = Math.min(Func.sw(), Func.sh()) * 1
    // const sh = sw

    v.forEach((val) => {
      const p:any = [
        this._convert(val[0].x, val[0].y),
        this._convert(val[1].x, val[1].y),
        this._convert(val[2].x, val[2].y),
      ];

      const start = this._convert(val[3].x, val[3].y)

      const b = Matter.Body.create({
        position: start,
        vertices: p,
        mass: 0.1,
        isStatic: true,
        render:{visible: Conf.instance.FLG_SHOW_MATTERJS},
      });

      this.bodies.push(b)
      this.startBodiesPosition.push(start.clone())

      Composite.add(this.engine.world, [
        b,
      ]);
    })

    this.start()
    this.isUpdate = true
  }


  public start(): void {
    if(this._isStart) return
    this._isStart = true

    Render.run(this.render);
    Runner.run(this._runner, this.engine);
  }


  public stop(): void {
    if(!this._isStart) return
    this._isStart = false

    Render.stop(this.render);
    Runner.stop(this._runner);
  }


  public reset(): void {
    console.log('reset')
    this.bodies.forEach((val, i) => {
      Body.setStatic(val, true)
      Body.setAngle(val, 0)
      Body.setVelocity(val, {
        x:0,
        y:0
      });
      Body.setPosition(val, this.startBodiesPosition[i]);
    })
  }


  public break(): void {
    this.bodies.forEach((val) => {
      if(val.isStatic) {
        if(!Util.hit(3)) {
          Body.setStatic(val, false)
          // val.restitution = 0.01
          // val.friction = 0.01
          // val.mass = 0.01

          const r = 5
          // const noiseX = Util.range(r)
          const noiseY = Util.random(0, r)
          Body.setVelocity(val, {
            x:0,
            y:noiseY
          });
          Body.setMass(val, Util.random(0.1, 0.75))
        }
      }
    })

    this._bCnt++
    if(this._bCnt > 6) {
      this._bCnt = 0
      this.reset()
    }
  }


  // ---------------------------------
  // 更新
  // ---------------------------------
  protected _update():void {
    super._update();

    if(!this.isUpdate) return

    // let mx = MousePointer.instance.x
    // let my = MousePointer.instance.y
    // if(Conf.USE_TOUCH && MousePointer.instance.isDown == false) {
    //   mx = 9999
    //   my = 9999
    // }

    // Body.setPosition(this.mouse, {x:mx, y:my});
  }


  // private _makeFrame(): void {
  //   // 一旦破棄
  //   if(this._frame.length > 0) {
  //     Composite.remove(this.engine.world, this._frame[0])
  //     Composite.remove(this.engine.world, this._frame[1])
  //     Composite.remove(this.engine.world, this._frame[2])
  //     Composite.remove(this.engine.world, this._frame[3])
  //     this._frame = [];
  //   }

  //   const sw = Func.sw();
  //   const sh = Func.sh();

  //   // 外枠
  //   this._frameSize = Func.val(10, 100);
  //   const width = this._frameSize

  //   this._frame[0] = Bodies.rectangle(0, -9999, 9999, width, {isStatic:true, render:{visible: Conf.instance.FLG_SHOW_MATTERJS}});
  //   this._frame[1] = Bodies.rectangle(sw + width * 0.5, 0, width, 9999, {isStatic:true, render:{visible: Conf.instance.FLG_SHOW_MATTERJS}});

  //   this._frame[2] = Bodies.rectangle(sw, sh * 0.5, 9999, width, {isStatic:true, render:{visible: Conf.instance.FLG_SHOW_MATTERJS}});

  //   this._frame[3] = Bodies.rectangle(-width * 0.5, 0, width, 9999, {isStatic:true, render:{visible: Conf.instance.FLG_SHOW_MATTERJS}});

  //   if(this._frame.length > 0) {
  //     Composite.add(this.engine.world, [
  //       this._frame[0],
  //       this._frame[1],
  //       this._frame[2],
  //       this._frame[3],
  //     ])
  //   }
  // }


  protected _resize(): void {
    super._resize();

    this.render.canvas.width = Func.sw()
    this.render.canvas.height = Func.sh()

    // this._makeFrame()
  }
}