import { diffChars } from "diff";

describe("Diff", () => {
  test("Simple", () => {
    const one = "beep boop";
    const other = "beep boob blah";

    const diff = diffChars(one, other);
  });

  test("Simple", () => {
    const one = "😀😀😀😀";
    const other = "😀😀";

    const diff = diffChars(one, other);
  });

  
});
