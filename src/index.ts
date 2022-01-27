import UTty from "utty";
import stripAnsi from "strip-ansi";
import NodeLikeTty, { Direction } from "nodeliketty";

export default class UNodeTty implements UTty {
  constructor(tty: NodeLikeTty) {
    this.tty = tty;
    process.env;
  }

  /**
   * The node lick tty.
   */
  tty: NodeLikeTty;

  /**
   * Curent line in terminal (start by 0).
   */
  line = 0;

  /**
   * The number of lines.
   */
  nLine = 0;

  /**
   * Get the number of lines of `str`.
   * It returns `1` when `str` has no `\n`.
   */
  _getLineNum(str: string): number {
    let lines = 1;
    for (let c of str) {
      if (c === "\n") {
        lines++;
      }
    }
    return lines;
  }

  _write(str: string, add: boolean): void {
    this.tty.write(str);
    let dLine = this._getLineNum(str) - 1;
    this.line += dLine;
    if (add) this.nLine += dLine;
  }

  _clearLine(dir: Direction = 0): void {
    this.tty.clearLine(dir);
  }

  _replace(str: string): void {
    this._clearLine();
    this._write(str, false);
  }

  _move(dChar: number, dLine: number) {
    this.tty.moveCursor(dChar, dLine);
    this.line += dLine;
  }

  _moveChar(dChar: number): void {
    this._move(dChar, 0);
  }

  _moveLine(dLine: number): void {
    this._move(0, dLine);
  }

  _toChar(char: number): void {
    this.tty.cursorTo(char);
  }

  _toLine(line: number): void {
    this._moveLine(-this.line + line);
    if (this.line != line)
      throw new Error(
        `fn _toLine error: wanted to move to line${line}, but at line${this.line}`
      );
  }

  _toNewLine(): void {
    this._toLine(this.nLine);
  }

  replace(line: number, str: string): void {
    this._toLine(line);
    this._replace(str);
  }

  moveToLine(line: number): void {
    this._toLine(line);
    this._toChar(0);
  }

  clearLine(line: number, dir: -1 | 0 | 1 = 0): void {
    this._toLine(line);
    this._clearLine(dir);
  }

  pushLine(str: string): void {
    this._toNewLine();
    this._write(str + "\n", true);
  }

  popLine():void{
    this.nLine--;
    this._toNewLine();
    this._clearLine();
  }

  getStrDisplayWidth(str: string): number {
    return stripAnsi(str).length;
    //return str.length;
  }

  onResize(listener: () => void): boolean {
    this.tty.on("resize", listener);
    return true;
  }
}
