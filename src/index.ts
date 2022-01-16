import UTty from "utty";
import stripAnsi from "strip-ansi";
import { Direction } from "tty";

export interface NodeLikeTty {
  write(buffer: Uint8Array | string): boolean;
  on(event: "resize", listener: () => void): this;
  /**
   * `writeStream.clearLine()` clears the current line of this `WriteStream` in a
   * direction identified by `dir`.
   */
  clearLine(dir: Direction): boolean;
  /**
   * `writeStream.cursorTo()` moves this `WriteStream`'s cursor to the specified
   * position.
   * @since v0.7.7
   * @param callback Invoked once the operation completes.
   * @return `false` if the stream wishes for the calling code to wait for the `'drain'` event to be emitted before continuing to write additional data; otherwise `true`.
   */
  cursorTo(x: number, y?: number): boolean;
  /**
   * `writeStream.moveCursor()` moves this `WriteStream`'s cursor _relative_ to its
   * current position.
   * @since v0.7.7
   * @param callback Invoked once the operation completes.
   * @return `false` if the stream wishes for the calling code to wait for the `'drain'` event to be emitted before continuing to write additional data; otherwise `true`.
   */
  moveCursor(dx: number, dy: number): boolean;
  /**
   * Returns:
   *
   * * `1` for 2,
   * * `4` for 16,
   * * `8` for 256,
   * * `24` for 16,777,216 colors supported.
   *
   * Use this to determine what colors the terminal supports. Due to the nature of
   * colors in terminals it is possible to either have false positives or false
   * negatives. It depends on process information and the environment variables that
   * may lie about what terminal is used.
   * It is possible to pass in an `env` object to simulate the usage of a specific
   * terminal. This can be useful to check how specific environment settings behave.
   *
   * To enforce a specific color support, use one of the below environment settings.
   *
   * * 2 colors: `FORCE_COLOR = 0` (Disables colors)
   * * 16 colors: `FORCE_COLOR = 1`
   * * 256 colors: `FORCE_COLOR = 2`
   * * 16,777,216 colors: `FORCE_COLOR = 3`
   *
   * Disabling color support is also possible by using the `NO_COLOR` and`NODE_DISABLE_COLORS` environment variables.
   * @since v9.9.0
   * @param [env=process.env] An object containing the environment variables to check. This enables simulating the usage of a specific terminal.
   */
  getColorDepth(): number;
  /**
   * A `number` specifying the number of columns the TTY currently has. This property
   * is updated whenever the `'resize'` event is emitted.
   * @since v0.7.7
   */
  columns: number;
  /**
   * A `number` specifying the number of rows the TTY currently has. This property
   * is updated whenever the `'resize'` event is emitted.
   * @since v0.7.7
   */
  rows: number;
}

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

  _clearLine(dir: -1 | 0 | 1 = 0): void {
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

  getStrDisplayWidth(str: string): number {
    return stripAnsi(str).length;
    //return str.length;
  }

  onResize(listener: () => void): boolean {
    this.tty.on("resize", listener);
    return true;
  }
}
