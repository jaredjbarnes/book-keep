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
  characters: string[] = [];
  decorations: Decoration[] = [];

  private decorationManager: DecorationManager = new DecorationManager(this);

  get text() {
    return this.characters.join("");
  }

  set text(text: string) {
    this.characters = [...text];
    this.cursor.startIndex = 0;
    this.cursor.endIndex = 1;

    this.setDecorations([]);
  }

  get length() {
    return this.characters.length;
  }

  constructor() {
    this.initialize();
  }

  // #region Life Cycle Methods
  initialize() {
    this.decorations = [
      {
        type: "cursor",
        startIndex: 0,
        endIndex: 1,
      },
    ];
    this.decorationManager = new DecorationManager(this);
  }

  dispose() {
    this.initialize();
  }
  //#endregion

  // #endregion

  // #region Cursor Methods
  get cursor() {
    return this.decorations.filter((d) => d.type === "cursor")[0];
  }

  getCursor() {
    return { ...this.cursor };
  }

  getCharacterAtCursor() {
    return this.characters
      .slice(this.cursor.startIndex, this.cursor.endIndex)
      .join("");
  }

  moveCursorLeft() {
    this.moveCursor(this.cursor.startIndex - 1);
  }

  moveCursorRight() {
    this.moveCursor(this.cursor.startIndex + 1);
  }

  moveCursorBy(index: number) {
    this.moveCursor(this.cursor.startIndex + index);
  }

  moveCursor(index: number) {
    const lastIndex = this.cursor.startIndex;

    if (typeof index !== "number" || isNaN(index)) {
      return;
    }

    if (index > this.characters.length) {
      index = this.characters.length;
    }

    if (index < 0) {
      index = 0;
    }

    this.cursor.startIndex = index;
    this.cursor.endIndex = index + 1;

    this.decorationManager.saveDecorationPlacementHistory();
  }

  getCursorPosition() {
    return this.cursor.startIndex;
  }

  moveToDecoration(decoration: Decoration) {
    if (this.decorations.includes(decoration) && decoration.type !== "cursor") {
      // This Makes the text sticky by having the cursor history from inside.
      const left = Math.min(decoration.startIndex, decoration.endIndex);
      this.moveCursor(left);
      this.moveCursor(left);
    }
  }
  //#endregion

  // #region Decorations Methods
  addDecoration(decoration: Decoration) {
    if (decoration.type === "cursor") {
      return;
    }

    decoration.startIndex = Math.max(0, decoration.startIndex);
    decoration.startIndex = Math.min(
      decoration.startIndex,
      this.characters.length
    );
    decoration.endIndex = Math.max(0, decoration.endIndex);
    decoration.endIndex = Math.min(decoration.endIndex, this.characters.length);

    this.decorations.push(clone(decoration));
  }

  replaceDecoration(decoration: Decoration, newDecoration: Decoration) {
    if (decoration.type === "cursor" || newDecoration.type === "cursor") {
      return;
    }

    const index = this.findDecorationIndex(decoration);

    if (index >= 0) {
      newDecoration.startIndex = Math.max(0, newDecoration.startIndex);
      newDecoration.startIndex = Math.min(
        newDecoration.startIndex,
        this.characters.length
      );
      newDecoration.endIndex = Math.max(0, newDecoration.endIndex);
      newDecoration.endIndex = Math.min(
        newDecoration.endIndex,
        this.characters.length
      );

      this.decorations.splice(index, 1, newDecoration);
    }
  }

  findDecorationIndex(decoration: Decoration) {
    return this.decorations.findIndex(
      (d) =>
        d.type === decoration.type &&
        d.startIndex === decoration.startIndex &&
        d.endIndex === decoration.endIndex
    );
  }

  removeDecoration(decoration: Decoration) {
    if (decoration.type === "cursor") {
      return;
    }

    const index = this.findDecorationIndex(decoration);

    if (index >= 0) {
      this.decorations.splice(index, 1);
    }
  }

  setDecorations(decorations: Decoration[]) {
    this.decorations = this.decorations.filter((d) => d.type === "cursor");

    decorations.forEach((decoration) => {
      this.addDecoration(decoration);
    });
  }

  normalizeDecorations() {
    this.decorations = this.decorations.filter(
      (d) => d.startIndex === d.endIndex
    );
  }

  getDecorations() {
    return clone(this.decorations);
  }

  getDecorationsByType(type: string) {
    return clone(this.decorations.filter((d) => d.type === type));
  }

  getDecorationsByRange(startIndex: number, endIndex: number) {
    startIndex = Math.min(startIndex, endIndex);
    endIndex = Math.max(startIndex, endIndex);

    return clone(
      this.decorations.filter((d) => {
        const left = Math.min(d.startIndex, d.endIndex);
        const right = Math.max(d.startIndex, d.endIndex);

        return Math.max(startIndex, left) < Math.min(endIndex, right);
      })
    );
  }

  getSegmentsByRange(
    startIndex: number,
    endIndex: number,
    filter: (decoration: Decoration) => boolean = () => true
  ) {
    startIndex = Math.max(startIndex, 0);
    endIndex = Math.min(endIndex, this.characters.length);

    const map: any = {};
    const decorations = this.decorations.filter(filter);
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
    right = Math.min(right, this.characters.length);

    return this.characters.slice(left, right).join("");
  }

  replaceText(startIndex: number, endIndex: number, text = "") {
    let left = Math.min(startIndex, endIndex);
    let right = Math.max(startIndex, endIndex);

    left = Math.max(left, 0);
    right = Math.min(right, this.length);

    this.characters.splice(left, right - left, ...text);

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
    const cursorPosition = this.cursor.startIndex;

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
    const cursorPosition = this.cursor.startIndex;

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
    const cursorPosition = this.cursor.startIndex;

    if (selections.length > 0) {
      selections.forEach((selection) => {
        this.removeText(selection.startIndex, selection.endIndex);
      });
      this.removeAllRanges();
    } else {
      if (cursorPosition !== this.characters.length) {
        this.removeText(cursorPosition, cursorPosition + 1);
      }
    }
  }
  // #endregion

  // #region Range Methods
  addRange(startIndex: number, endIndex: number) {
    this.decorations.push({
      type: "selection",
      startIndex: startIndex,
      endIndex: endIndex,
    });

    this.moveCursor(endIndex);
  }

  removeAllRanges() {
    if (this.decorations.findIndex((d) => d.type === "selection") > -1) {
      this.setDecorations(
        this.decorations.filter((d) => d.type !== "selection")
      );
    }
  }

  removeRange(selection: Decoration) {
    if (this.decorations.includes(selection)) {
      this.setDecorations(this.decorations.filter((d) => d !== selection));
    }
  }

  getRanges() {
    return this.decorations.filter((d) => d.type === "selection");
  }

  hasRanges() {
    return this.getRanges().length > 0;
  }
}
