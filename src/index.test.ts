import UStdTty, { StdTty } from "./index";

class FakeStdTty implements StdTty {
  lines: string[] = [""];
  y = 0;
  x = 0;
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
const fake = new FakeStdTty();
const t = new UStdTty(fake);
let lines: string[] = [];

describe("Test UStdTty", () => {
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
});
