import { Texture, TextureLoader } from "three"


export class TexLoader {
  private static _instance: TexLoader

  private _list: Array<any> = []
  private _tex: Array<any> = []
  private _loadedNum: number = 0

  public onComplete: any
  public onProgress: any

  constructor() {}

  public static get instance(): TexLoader {
    if (!this._instance) {
      this._instance = new TexLoader()
    }
    return this._instance
  }

  // -----------------------------------
  //
  // -----------------------------------
  public load(opt: any): void {
    this.onComplete = opt.onComplete
    this.onProgress = opt.onProgress

    if (opt.list.length == 0) {
      if (this.onComplete != undefined) {
        this.onComplete()
      }
      return
    }

    this._list = opt.list
    this._loadedNum = 0

    this._load()
  }

  // -----------------------------------
  //
  // -----------------------------------
  private _load(): void {
    const data = this._list[this._loadedNum]

    if (this.check(data.src)) {
      this._loadedImg()
      return
    }

    const texloader = new TextureLoader()
    texloader.crossOrigin = '*'
    const tex = texloader.load(data.src, () => {
      this._loadedImg()
    })

    this._tex.push({
      tex: tex,
      src: data.src,
    })
  }

  // -----------------------------------
  //
  // -----------------------------------
  private _loadedImg(): void {
    this._loadedNum++

    if (this.onProgress != undefined) {
      this.onProgress(this._loadedNum / this._list.length)
    }

    if (this._loadedNum >= this._list.length) {
      if (this.onComplete != undefined) {
        this.onComplete()
      }
      return
    }

    this._load()
  }

  // -----------------------------------
  //
  // -----------------------------------
  public get(src: string): Texture {
    let preTex: any = null
    this._tex.forEach((item) => {
      if (item.src == src) {
        preTex = item.tex
      }
    })

    if (preTex != null) {
      return preTex
    }

    const t = new TextureLoader()
    t.crossOrigin = 'anonymous'
    const tex = t.load(src)

    this._tex.push({
      tex: tex,
      src: src,
    })

    return tex
  }

  // -----------------------------------
  //
  // -----------------------------------
  public check(src: string): boolean {
    let flg = false
    this._tex.forEach((item) => {
      if (item.src == src) {
        flg = true
      }
    })
    return flg
  }
}
