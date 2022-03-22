import { SortedArray } from "../sorted_array";

describe("SortedArray", () => {
  test("Add, Remove", () => {
    const array = new SortedArray((a: number, b: number) => {
      return b - a;
    });

    array.add(1);
    array.add(4);
    array.add(10);
    array.add(3);

    expect(array.toArray().join(",")).toBe("1,3,4,10");

    array.remove(1);
  });

  test("Add, Remove with complex objects", () => {
    const array = new SortedArray(
      (a: { value: number }, b: { value: number }) => {
        return b.value - a.value;
      }
    );

    const three = { value: 3, duplicate: true };

    array.add({ value: 1 });
    array.add({ value: 4 });
    array.add({ value: 10 });
    array.add({ value: 3 });
    array.add(three);

    array.remove(three);
    array.remove({ value: 3 });
  });
});
