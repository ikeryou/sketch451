export class Rect {
  x: number = 0
  y: number = 0
  width: number = 0
  height: number = 0

  constructor(x: number = 0, y: number = 0, width: number = 0, height: number = 0) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
  }

  public copy(r: Rect) {
    this.x = r.x
    this.y = r.y
    this.width = r.width
    this.height = r.height
  }
}
