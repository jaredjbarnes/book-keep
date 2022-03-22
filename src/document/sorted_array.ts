import { binarySearch } from "./binary_search";

export class SortedArray<T> {
  private _array: T[] = [];
  private _compareFunction: (a: T, b: T) => number;
  constructor(compareFunction: (a: T, b: T) => number) {
    this._compareFunction = compareFunction;
  }

  set items(value: T[]) {
    this._array = value;
    this._array.sort(this._compareFunction);
  }

  add(item: T) {
    const index = this.getIndexForItem(item);

    if (index > -1) {
      this._array.splice(index + 1, 0, item);
    } else {
      this._array.push(item);
    }
  }

  remove(item: T) {
    const index = this.getIndexForItem(item);
    let start = index;
    let end = index;

    while (this._compareFunction(item, this._array[start - 1]) === 0) {
      start--;
    }

    while (this._compareFunction(item, this._array[end]) === 0) {
      end++;
    }

    const potentialMatches = this._array.slice(start, end);
    const matchIndex = potentialMatches.indexOf(item);

    if (matchIndex > -1) {
      this._array.splice(start + matchIndex, 1);
    }
  }

  getIndexForItem(item: T) {
    return binarySearch(this._array, item, this._compareFunction);
  }

  toArray(): ReadonlyArray<T> {
    return this._array;
  }
}
