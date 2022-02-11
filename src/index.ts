import UTty, { LineContext, UTtyConfig } from "utty";
import stripAnsi from "strip-ansi";
import NodeLikeTty, { Direction } from "nodeliketty";
import chalk, { Color, ChalkInstance } from "chalk";

const color2chalk = new Map<Color, ChalkInstance>([
  ["black", chalk.black],
  ["red", chalk.red],
  ["green", chalk.green],
  ["yellow", chalk.yellow],
  ["blue", chalk.blue],
  ["magenta", chalk.magenta],
  ["cyan", chalk.cyan],
  ["white", chalk.white],
  ["gray", chalk.gray],
  ["grey", chalk.grey],
  ["blackBright", chalk.blackBright],
  ["redBright", chalk.redBright],
  ["greenBright", chalk.greenBright],
  ["yellowBright", chalk.yellowBright],
  ["blueBright", chalk.blueBright],
  ["magentaBright", chalk.magentaBright],
  ["cyanBright", chalk.cyanBright],
  ["whiteBright", chalk.whiteBright],
  ["bgBlack", chalk.bgBlack],
  ["bgRed", chalk.bgRed],
  ["bgGreen", chalk.bgGreen],
  ["bgYellow", chalk.bgYellow],
  ["bgBlue", chalk.bgBlue],
  ["bgMagenta", chalk.bgMagenta],
  ["bgCyan", chalk.bgCyan],
  ["bgWhite", chalk.bgWhite],
  ["bgGray", chalk.bgGray],
  ["bgGrey", chalk.bgGrey],
  ["bgBlackBright", chalk.bgBlackBright],
  ["bgRedBright", chalk.bgRedBright],
  ["bgGreenBright", chalk.bgGreenBright],
  ["bgYellowBright", chalk.bgYellowBright],
  ["bgBlueBright", chalk.bgBlackBright],
  ["bgMagentaBright", chalk.bgMagentaBright],
  ["bgCyanBright", chalk.bgCyanBright],
  ["bgWhiteBright", chalk.bgWhiteBright],
]);

export default class UNodeTty implements UTty {
  constructor(tty: NodeLikeTty) {
    this.tty = tty;
    this.config = {
      color: "NJS:" + tty.getColorDepth(),
    };
  }

  config: UTtyConfig;

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

  _resolve(str: string, ctx: LineContext): string {
    let result = str;

    if (ctx["colors"] !== undefined) {
      // Resolve colors.
      const colors = ctx["colors"] as
        | Array<{
            name: string;
            start: string;
            end: string;
          }>
        | undefined;
      if (colors !== undefined) {
        for (let color of colors) {
          const c = color2chalk.get(color.name as Color);
          if (c === undefined) {
            throw new Error("Unknown color name!");
          }
        }
      }
    }
    return result;
  }

  get columns(): number {
    return this.tty.columns;
  }

  get rows(): number {
    return this.tty.rows;
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

  pushLine(str: string, ctx: LineContext = {}): void {
    this._toNewLine();
    this._write(this._resolve(str, ctx) + "\n", true);
  }

  popLine(): void {
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
