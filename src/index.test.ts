import UNodeTty from "./index";
import TestImpl from "nodeliketty-testimpl";

const fake = new TestImpl();
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
