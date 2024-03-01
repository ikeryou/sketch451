import GUI from 'lil-gui';
import Stats from 'three/examples/jsm/libs/stats.module';
import { Conf } from './conf';
import { Update } from '../libs/update';
import { FPS } from '../core/fps';
import { Color } from 'three';

export class Param {
  private static _instance: Param;

  public fps: number = FPS.MIDDLE;
  public debug:HTMLElement = document.querySelector('.l-debug') as HTMLElement;
  public scrollRate:number = 0;
  public isHover:boolean = false;
  public hoverRate:number = 0;
  public baseColor:Color = new Color(0, 0, 0);
  public baseColorB:Color = new Color(0, 0, 0);

  private _dat: any;
  private _stats: any;

  public main = {
    bg:{value:0x000000, type:'color'},
  }

  public light = {
    x:{value:-45, min:-100, max:100},
    y:{value:-45, min:-100, max:100},
    z:{value:80, min:-100, max:100},
  }

  public block = {
    size:{value:13, min:1, max:100},
    max:{value:46, min:1, max:100},
    maxRange:{value:10, min:1, max:100},
    bgColor:{value:0xffff00, type:'color'},
}

  constructor() {
    if (Conf.instance.FLG_PARAM) {
      this.makeParamGUI();
    }

    if (Conf.instance.FLG_STATS) {
      this._stats = Stats();
      document.body.appendChild(this._stats.domElement);
    }

    Update.instance.add(() => {
      this._update();
    });
  }

  private _update(): void {
    if (this._stats != undefined) {
      this._stats.update();
    }
  }

  public static get instance(): Param {
    if (!this._instance) {
      this._instance = new Param();
    }
    return this._instance;
  }

  public makeParamGUI(): void {
    if (this._dat != undefined) return;

    this._dat = new GUI();
    this._add(this.block, 'block');
  }

  private _add(obj: any, folderName: string): void {
    const folder = this._dat.addFolder(folderName);
    for (var key in obj) {
      const val: any = obj[key];
      if (val.use == undefined) {
        if (val.type == 'color') {
          folder.addColor(val, 'value').name(key);
        } else {
          if (val.list != undefined) {
            folder.add(val, 'value', val.list).name(key);
          } else {
            folder.add(val, 'value', val.min, val.max).name(key);
          }
        }
      }
    }
  }
}
