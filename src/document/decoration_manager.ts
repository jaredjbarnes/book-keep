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
  private range: Range;
  private document: Document;
  private decorationPositions: WeakMap<Decoration, string[]>;

  constructor(editor: Document) {
    this.document = editor;
    this.range = {
      startIndex: 0,
      endIndex: 0,
    };
    this.decorationPositions = new WeakMap();
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
      this.range.startIndex === this.range.endIndex &&
      this.range.startIndex === left
    );
  }

  isRangeOnRightSideOfDecoration(decoration: Decoration) {
    const right = Math.max(decoration.startIndex, decoration.endIndex);
    return (
      this.range.startIndex === this.range.endIndex &&
      this.range.startIndex === right
    );
  }

  isDecorationLeftOfTheRange(decoration: Decoration) {
    const right = Math.max(decoration.startIndex, decoration.endIndex);
    return right <= this.range.startIndex;
  }

  isDecorationRightOfTheRange(decoration: Decoration) {
    const left = Math.min(decoration.startIndex, decoration.endIndex);
    return left >= this.range.endIndex;
  }

  isDecorationWithinTheRange(decoration: Decoration) {
    const left = Math.min(decoration.startIndex, decoration.endIndex);
    const right = Math.max(decoration.startIndex, decoration.endIndex);

    return this.range.startIndex <= left && this.range.endIndex >= right;
  }

  doesDecorationSurroundTheRange(decoration: Decoration) {
    const left = Math.min(decoration.startIndex, decoration.endIndex);
    const right = Math.max(decoration.startIndex, decoration.endIndex);

    return this.range.startIndex >= left && this.range.endIndex <= right;
  }

  doesRangeOverlapLeftSideOfDecoration(decoration: Decoration) {
    const left = Math.min(decoration.startIndex, decoration.endIndex);

    return this.range.startIndex < left && this.range.endIndex > left;
  }

  doesRangeOverlapRightSideOfDecoration(decoration: Decoration) {
    const right = Math.max(decoration.startIndex, decoration.endIndex);

    return this.range.startIndex < right && this.range.endIndex > right;
  }

  isSticky(decoration: Decoration) {
    const positions = this.decorationPositions.get(decoration);
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
      this.document.cursorPosition > left &&
      this.document.cursorPosition < right
    ) {
      return true;
    }

    return false;
  }

  saveDecorationPosition(decoration: Decoration, position: string) {
    let positions = this.decorationPositions.get(decoration);

    if (positions == null) {
      positions = [];
      this.decorationPositions.set(decoration, positions);
    }

    positions.push(position);

    if (positions.length > 2) {
      positions.shift();
    }
  }

  collapse(startIndex: number, endIndex: number) {
    this.range.startIndex = Math.min(startIndex, endIndex);
    this.range.endIndex = Math.max(startIndex, endIndex);

    const amount = this.range.startIndex - this.range.endIndex;
    const decorations = this.document.decorations;

    decorations.forEach((decoration) => {
      if (this.isDecorationLeftOfTheRange(decoration)) {
        // Do Nothing.
      } else if (this.isDecorationRightOfTheRange(decoration)) {
        this.adjustBothSides(decoration, amount, amount);
      } else if (this.isDecorationWithinTheRange(decoration)) {
        this.document.removeDecoration(decoration);
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
        this.document.length,
        decoration.startIndex
      );

      decoration.endIndex = Math.max(0, decoration.endIndex);
      decoration.endIndex = Math.min(this.document.length, decoration.endIndex);
    });
  }

  expand(onIndex: number, amount: number) {
    this.range.startIndex = onIndex;
    this.range.endIndex = onIndex;
    const decorations = this.document.decorations.filter(
      (d) => d.type !== "cursor"
    );

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
    this.range.startIndex = this.document.cursorPosition;
    this.range.endIndex = this.document.cursorPosition;
    const decorations = this.document.decorations.filter(
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
