import UNodeTty, { NodeLikeTty } from "./index";
class FakeNodeTty implements NodeLikeTty {
  lines: string[] = [""];
  y = 0;
  x = 0;
  resizeListeners: (() => void)[] = [];
  _columns: number = 100;
  set columns(col: number) {
    this._columns = col;
    this.resizeListeners.forEach((value) => value());
  }
  _rows: number = 100;
  set rows(row: number) {
    this._rows = row;
    this.resizeListeners.forEach((value) => value());
  }
  on(_event: "resize", listener: () => void): this {
    this.resizeListeners.push(listener);
    return this;
  }
  getColorDepth(): number {
    return 24;
  }
  write(buffer: Uint8Array | string, cb?: (err?: Error) => void): boolean {
    for (let c of buffer) {
      if (c === "\n") {
        this.y++;
        this.x = 0;
        this.lines.push("");
      } else {
        this.x++;
        this.lines[this.y] += c;
      }
    }
    return true;
  }
  clearLine(dir: -1 | 0 | 1): boolean {
    this.lines[this.y] = "";
    this.x = 0;
    return true;
  }
  moveCursor(dx: number, dy: number): boolean {
    this.x += dx;
    this.y += dy;
    return true;
  }
  cursorTo(x: number, y?: number): boolean {
    this.x = x;
    if (y !== null) this.y = y;
    return true;
  }
}

const fake = new FakeNodeTty();
const t = new UNodeTty(fake);
let lines: string[] = [];

describe("Test UNodeTty", () => {
  it("should be able to push line correctly", () => {
    for (let i = 0; i < 10; i++) {
      t.pushLine("L" + i);
    }
    for (let i = 0; i < 10; i++) {
      lines.push("L" + i);
    }
    lines.push("");
    expect(fake.lines).toEqual(lines);
  });
  it("should be able to replace line correctly", () => {
    t.replace(3, "L3-new");
    lines[3] = "L3-new";
    expect(fake.lines).toEqual(lines);
  });
  it("should be able to clear line correctly", () => {
    t.clearLine(4);
    lines[4] = "";
    expect(fake.lines).toEqual(lines);
  });
  it("should be able to be resized correctly", () => {
    let called = false;
    let fn = () => {
      called = true;
    };
    t.onResize(fn);
    fake.rows++;
    expect(called).toBeTruthy();
  });
});
