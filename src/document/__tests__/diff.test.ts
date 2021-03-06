import { diffChars, diffArrays } from "diff";
import { Document } from "../document";

describe("Diff", () => {

  test("Simple", () => {
    const editor = new Document();
    const text = "ððððĪŠ";
    editor.text = text;
    editor.moveCursor(4);
    editor.backspace();

    const diff = diffArrays([...text], editor.characters as string[]);
  });
});
