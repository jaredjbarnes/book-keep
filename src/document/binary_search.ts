export function binarySearch<TItem, TValue>(
  array: TItem[],
  lookFor: TValue,
  compareFunc: (at: TItem, lookFor: TValue) => number
) {
  var lowerBound = 0;
  var upperBound = array.length - 1;
  while (lowerBound <= upperBound) {
    var checkIndex = Math.floor((upperBound + lowerBound) / 2);
    var result = compareFunc(array[checkIndex], lookFor);

    if (result > 0) {
      lowerBound = checkIndex + 1;
      if (lowerBound > upperBound) {
        return upperBound;
      }
    } else if (result < 0) {
      upperBound = checkIndex - 1;
      if (upperBound < lowerBound) {
        return lowerBound;
      }
    } else {
      return checkIndex;
    }
  }

  return -1;
}
