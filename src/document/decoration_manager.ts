import { Document } from "./document";

export type Range = {
  startIndex: number;
  endIndex: number;
};

export type Decoration = Range & {
  id?: string;
  type: string;
};

export default class DecorationManager {
  private _range: Range;
  private _document: Document;
  private _decorationPositions: WeakMap<Decoration, string[]>;

  constructor(document: Document) {
    this._document = document;
    this._range = {
      startIndex: 0,
      endIndex: 0,
    };
    this._decorationPositions = new WeakMap();
  }

  adjustBothSides(
    decoration: Decoration,
    leftAmount: number,
    rightAmount: number
  ) {
    if (decoration.startIndex < decoration.endIndex) {
      decoration.startIndex += leftAmount;
      decoration.endIndex += rightAmount;
    } else {
      decoration.startIndex += rightAmount;
      decoration.endIndex += leftAmount;
    }
  }

  assignBothSides(
    decoration: Decoration,
    leftValue: number,
    rightValue: number
  ) {
    if (decoration.startIndex < decoration.endIndex) {
      decoration.startIndex = leftValue;
      decoration.endIndex = rightValue;
    } else {
      decoration.startIndex = rightValue;
      decoration.endIndex = leftValue;
    }
  }

  adjustLeftSide(decoration: Decoration, amount: number) {
    if (decoration.startIndex < decoration.endIndex) {
      decoration.startIndex += amount;
    } else {
      decoration.endIndex += amount;
    }
  }

  adjustRightSide(decoration: Decoration, amount: number) {
    if (decoration.startIndex < decoration.endIndex) {
      decoration.endIndex += amount;
    } else {
      decoration.startIndex += amount;
    }
  }

  assignRightSide(decoration: Decoration, value: number) {
    if (decoration.startIndex < decoration.endIndex) {
      decoration.endIndex = value;
    } else {
      decoration.startIndex = value;
    }
  }

  assignLeftSide(decoration: Decoration, value: number) {
    if (decoration.startIndex < decoration.endIndex) {
      decoration.startIndex = value;
    } else {
      decoration.endIndex = value;
    }
  }

  isRangeOnLeftSideOfDecoration(decoration: Decoration) {
    const left = Math.min(decoration.startIndex, decoration.endIndex);
    return (
      this._range.startIndex === this._range.endIndex &&
      this._range.startIndex === left
    );
  }

  isRangeOnRightSideOfDecoration(decoration: Decoration) {
    const right = Math.max(decoration.startIndex, decoration.endIndex);
    return (
      this._range.startIndex === this._range.endIndex &&
      this._range.startIndex === right
    );
  }

  isDecorationLeftOfTheRange(decoration: Decoration) {
    const right = Math.max(decoration.startIndex, decoration.endIndex);
    return right <= this._range.startIndex;
  }

  isDecorationRightOfTheRange(decoration: Decoration) {
    const left = Math.min(decoration.startIndex, decoration.endIndex);
    return left >= this._range.endIndex;
  }

  isDecorationWithinTheRange(decoration: Decoration) {
    const left = Math.min(decoration.startIndex, decoration.endIndex);
    const right = Math.max(decoration.startIndex, decoration.endIndex);

    return this._range.startIndex <= left && this._range.endIndex >= right;
  }

  doesDecorationSurroundTheRange(decoration: Decoration) {
    const left = Math.min(decoration.startIndex, decoration.endIndex);
    const right = Math.max(decoration.startIndex, decoration.endIndex);

    return this._range.startIndex >= left && this._range.endIndex <= right;
  }

  doesRangeOverlapLeftSideOfDecoration(decoration: Decoration) {
    const left = Math.min(decoration.startIndex, decoration.endIndex);

    return this._range.startIndex < left && this._range.endIndex > left;
  }

  doesRangeOverlapRightSideOfDecoration(decoration: Decoration) {
    const right = Math.max(decoration.startIndex, decoration.endIndex);

    return this._range.startIndex < right && this._range.endIndex > right;
  }

  isSticky(decoration: Decoration) {
    const positions = this._decorationPositions.get(decoration);
    const left = Math.min(decoration.startIndex, decoration.endIndex);
    const right = Math.max(decoration.startIndex, decoration.endIndex);

    if (
      positions &&
      !positions.includes("right") &&
      !positions.includes("left") &&
      positions.filter((p) => p === "on-left-boundary").length < 2
    ) {
      return true;
    }

    if (
      this._document.cursorPosition > left &&
      this._document.cursorPosition < right
    ) {
      return true;
    }

    return false;
  }

  saveDecorationPosition(decoration: Decoration, position: string) {
    let positions = this._decorationPositions.get(decoration);

    if (positions == null) {
      positions = [];
      this._decorationPositions.set(decoration, positions);
    }

    positions.push(position);

    if (positions.length > 2) {
      positions.shift();
    }
  }

  collapse(startIndex: number, endIndex: number) {
    this._range.startIndex = Math.min(startIndex, endIndex);
    this._range.endIndex = Math.max(startIndex, endIndex);

    const amount = this._range.startIndex - this._range.endIndex;
    const decorations = this._document.decorations;

    decorations.forEach((decoration) => {
      if (this.isDecorationLeftOfTheRange(decoration)) {
        // Do Nothing.
      } else if (this.isDecorationRightOfTheRange(decoration)) {
        this.adjustBothSides(decoration, amount, amount);
      } else if (this.isDecorationWithinTheRange(decoration)) {
        this._document.removeDecoration(decoration);
      } else if (this.doesDecorationSurroundTheRange(decoration)) {
        this.adjustRightSide(decoration, amount);
      } else if (this.doesRangeOverlapLeftSideOfDecoration(decoration)) {
        const overlap = endIndex - decoration.startIndex;
        const originalSize = decoration.endIndex - decoration.startIndex;

        this.assignBothSides(
          decoration,
          startIndex,
          startIndex + originalSize - overlap
        );
      } else if (this.doesRangeOverlapRightSideOfDecoration(decoration)) {
        this.assignRightSide(decoration, startIndex);
      } else {
        //console.log("Shouldn't get here.", decoration);
      }

      decoration.startIndex = Math.max(0, decoration.startIndex);
      decoration.startIndex = Math.min(
        this._document.length,
        decoration.startIndex
      );

      decoration.endIndex = Math.max(0, decoration.endIndex);
      decoration.endIndex = Math.min(
        this._document.length,
        decoration.endIndex
      );
    });
  }

  expand(onIndex: number, amount: number) {
    this._range.startIndex = onIndex;
    this._range.endIndex = onIndex;
    const decorations = this._document.decorations.filter((d) => d.type !== "cursor");

    decorations.forEach((decoration) => {
      if (this.isSticky(decoration)) {
        if (this.isRangeOnLeftSideOfDecoration(decoration)) {
          this.adjustRightSide(decoration, amount);
        } else if (this.isRangeOnRightSideOfDecoration(decoration)) {
          this.adjustRightSide(decoration, amount);
        } else if (this.isDecorationWithinTheRange(decoration)) {
          this.adjustRightSide(decoration, amount);
        } else if (this.doesDecorationSurroundTheRange(decoration)) {
          this.adjustRightSide(decoration, amount);
        } else if (this.isDecorationRightOfTheRange(decoration)) {
          this.adjustBothSides(decoration, amount, amount);
        } else if (this.isDecorationLeftOfTheRange(decoration)) {
          // Do nothing
        } else {
          // Should not get here.
        }
      } else {
        if (this.isRangeOnLeftSideOfDecoration(decoration)) {
          this.adjustBothSides(decoration, amount, amount);
        } else if (this.isRangeOnRightSideOfDecoration(decoration)) {
          // Do nothing
        } else if (this.isDecorationWithinTheRange(decoration)) {
          this.adjustRightSide(decoration, amount);
        } else if (this.doesDecorationSurroundTheRange(decoration)) {
          this.adjustRightSide(decoration, amount);
        } else if (this.isDecorationRightOfTheRange(decoration)) {
          this.adjustBothSides(decoration, amount, amount);
        } else if (this.isDecorationLeftOfTheRange(decoration)) {
          // Do nothing
        } else {
          // Should not get here
        }
      }
    });
  }

  saveDecorationPlacementHistory() {
    this._range.startIndex = this._document.cursorPosition;
    this._range.endIndex = this._document.cursorPosition;
    const decorations = this._document.decorations.filter(
      (d) => d.type !== "cursor"
    );

    decorations.forEach((decoration) => {
      if (this.isRangeOnLeftSideOfDecoration(decoration)) {
        this.saveDecorationPosition(decoration, "on-left-boundary");
      } else if (this.isRangeOnRightSideOfDecoration(decoration)) {
        this.saveDecorationPosition(decoration, "on-right-boundary");
      } else if (this.doesDecorationSurroundTheRange(decoration)) {
        this.saveDecorationPosition(decoration, "surrounds");
      } else if (this.isDecorationRightOfTheRange(decoration)) {
        this.saveDecorationPosition(decoration, "right");
      } else if (this.isDecorationLeftOfTheRange(decoration)) {
        this.saveDecorationPosition(decoration, "left");
      } else {
        //console.log('saveDecorationPlacementHistory', this.range, decoration);
      }
    });
  }
}
