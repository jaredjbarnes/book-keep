import DecorationManager, { Decoration } from "./decoration_manager";

function clone<T>(obj: T) {
  return JSON.parse(JSON.stringify(obj)) as T;
}

export type Row = {
  startIndex: number;
  endIndex: number;
  value: string;
};

export type TextEditorState = {
  type: string;
  editor: TextEditor;
  text: string;
  decorations: Decoration[];
};

export interface IsLoadingEvent {
  type: string;
  isLoading: boolean;
}

export class TextEditor {
  private _characters: string[] = [];
  private _decorations: Decoration[] = [];
  private decorationManager: DecorationManager = new DecorationManager(this);
  cursorPosition = 0;

  get text() {
    return this._characters.join("");
  }

  set text(text: string) {
    this._characters = [...text];
    this.cursorPosition = 0;

    this.setDecorations([]);
  }

  get length() {
    return this._characters.length;
  }

  get decorations(): ReadonlyArray<Decoration> {
    return this._decorations.slice(0);
  }

  get characters(): ReadonlyArray<string> {
    return this._characters;
  }

  constructor() {
    this.initialize();
  }

  initialize() {
    this._decorations = [];
    this.decorationManager = new DecorationManager(this);
  }

  dispose() {
    this.initialize();
  }

  // #region Cursor Methods

  getCharacterAtCursor() {
    return this._characters
      .slice(this.cursorPosition, this.cursorPosition + 1)
      .join("");
  }

  moveCursorLeft() {
    this.moveCursor(this.cursorPosition - 1);
  }

  moveCursorRight() {
    this.moveCursor(this.cursorPosition + 1);
  }

  moveCursorBy(index: number) {
    this.moveCursor(this.cursorPosition + index);
  }

  moveCursor(index: number) {
    if (typeof index !== "number" || isNaN(index)) {
      return;
    }

    if (index > this._characters.length) {
      index = this._characters.length;
    }

    if (index < 0) {
      index = 0;
    }

    this.cursorPosition = index;
    this.decorationManager.saveDecorationPlacementHistory();
  }

  moveToDecoration(decoration: Decoration) {
    if (this._decorations.includes(decoration)) {
      // This Makes the text sticky by having the cursor history from inside.
      const left = Math.min(decoration.startIndex, decoration.endIndex);
      this.moveCursor(left);
      this.moveCursor(left);
    }
  }
  //#endregion

  // #region Decorations Methods
  addDecoration(decoration: Decoration) {
    decoration.startIndex = Math.max(0, decoration.startIndex);
    decoration.startIndex = Math.min(
      decoration.startIndex,
      this._characters.length
    );
    decoration.endIndex = Math.max(0, decoration.endIndex);
    decoration.endIndex = Math.min(
      decoration.endIndex,
      this._characters.length
    );

    this._decorations.push(clone(decoration));
  }

  replaceDecoration(decoration: Decoration, newDecoration: Decoration) {
    const index = this.findDecorationIndex(decoration);

    if (index >= 0) {
      newDecoration.startIndex = Math.max(0, newDecoration.startIndex);
      newDecoration.startIndex = Math.min(
        newDecoration.startIndex,
        this._characters.length
      );
      newDecoration.endIndex = Math.max(0, newDecoration.endIndex);
      newDecoration.endIndex = Math.min(
        newDecoration.endIndex,
        this._characters.length
      );

      this._decorations.splice(index, 1, newDecoration);
    }
  }

  findDecorationIndex(decoration: Decoration) {
    return this._decorations.findIndex(
      (d) =>
        d.type === decoration.type &&
        d.startIndex === decoration.startIndex &&
        d.endIndex === decoration.endIndex
    );
  }

  removeDecoration(decoration: Decoration) {
    const index = this.findDecorationIndex(decoration);

    if (index >= 0) {
      this._decorations.splice(index, 1);
    }
  }

  setDecorations(decorations: Decoration[]) {
    decorations.forEach((decoration) => {
      this.addDecoration(decoration);
    });
  }

  normalizeDecorations() {
    this._decorations = this._decorations.filter(
      (d) => d.startIndex === d.endIndex
    );
  }

  getDecorationsByType(type: string) {
    return this._decorations.filter((d) => d.type === type);
  }

  getDecorationsByRange(startIndex: number, endIndex: number) {
    startIndex = Math.min(startIndex, endIndex);
    endIndex = Math.max(startIndex, endIndex);

    return this._decorations.filter((d) => {
      const left = Math.min(d.startIndex, d.endIndex);
      const right = Math.max(d.startIndex, d.endIndex);

      return Math.max(startIndex, left) < Math.min(endIndex, right);
    });
  }

  getSegmentsByRange(
    startIndex: number,
    endIndex: number,
    filter: (decoration: Decoration) => boolean = () => true
  ) {
    startIndex = Math.max(startIndex, 0);
    endIndex = Math.min(endIndex, this._characters.length);

    const map: any = {};
    const decorations = this._decorations.filter(filter);
    // Make markers for the first and last.
    map[startIndex] = startIndex;
    map[endIndex] = endIndex;

    for (let x = 0; x < decorations.length; x++) {
      const decoration = decorations[x];
      const left = Math.min(decoration.startIndex, decoration.endIndex);
      const right = Math.max(decoration.startIndex, decoration.endIndex);

      if (startIndex <= left && endIndex >= left) {
        map[left] = left;
      }

      if (startIndex <= right && endIndex >= right) {
        map[right] = right;
      }
    }

    const segments = Object.keys(map).map((v) => {
      return Number(v);
    });

    segments.sort((a, b) => a - b);
    return segments;
  }

  //#endregion

  // #region Text Methods

  getTextByRange(startIndex: number, endIndex: number) {
    let left = Math.min(startIndex, endIndex);
    let right = Math.max(startIndex, endIndex);

    left = Math.max(left, 0);
    right = Math.min(right, this._characters.length);

    return this._characters.slice(left, right).join("");
  }

  replaceText(startIndex: number, endIndex: number, text = "") {
    let left = Math.min(startIndex, endIndex);
    let right = Math.max(startIndex, endIndex);

    left = Math.max(left, 0);
    right = Math.min(right, this.length);

    this._characters.splice(left, right - left, ...text);

    this.decorationManager.collapse(left, right);

    if (text.length > 0) {
      this.decorationManager.expand(left, text.length);
    }
  }

  removeText(startIndex: number, endIndex: number) {
    this.replaceText(startIndex, endIndex, "");
    this.moveCursor(Math.min(startIndex, endIndex));
  }

  insert(text: string) {
    const selections = this.getRanges();
    const cursorPosition = this.cursorPosition;

    if (selections.length > 0) {
      selections.forEach((selection) => {
        const left = Math.min(selection.startIndex, selection.endIndex);
        const right = Math.max(selection.startIndex, selection.endIndex);

        this.replaceText(left, right, text);
        this.moveCursor(left + text.length);
      });

      this.removeAllRanges();
    } else {
      this.replaceText(cursorPosition, cursorPosition, text);
      this.moveCursor(cursorPosition + text.length);
    }
  }

  backspace() {
    const selections = this.getRanges();
    const cursorPosition = this.cursorPosition;

    if (selections.length > 0) {
      selections.forEach((selection) => {
        this.removeText(selection.startIndex, selection.endIndex);
      });
      this.removeAllRanges();
    } else {
      if (cursorPosition > 0) {
        this.removeText(cursorPosition - 1, cursorPosition);
      }
    }
  }

  delete() {
    const selections = this.getRanges();
    const cursorPosition = this.cursorPosition;

    if (selections.length > 0) {
      selections.forEach((selection) => {
        this.removeText(selection.startIndex, selection.endIndex);
      });
      this.removeAllRanges();
    } else {
      if (cursorPosition !== this._characters.length) {
        this.removeText(cursorPosition, cursorPosition + 1);
      }
    }
  }
  // #endregion

  // #region Range Methods
  addRange(startIndex: number, endIndex: number) {
    this._decorations.push({
      type: "selection",
      startIndex: startIndex,
      endIndex: endIndex,
    });

    this.moveCursor(endIndex);
  }

  removeAllRanges() {
    if (this._decorations.findIndex((d) => d.type === "selection") > -1) {
      this.setDecorations(
        this._decorations.filter((d) => d.type !== "selection")
      );
    }
  }

  removeRange(selection: Decoration) {
    if (this._decorations.includes(selection)) {
      this.setDecorations(this._decorations.filter((d) => d !== selection));
    }
  }

  getRanges() {
    return this._decorations.filter((d) => d.type === "selection");
  }

  hasRanges() {
    return this.getRanges().length > 0;
  }
}
