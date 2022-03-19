import { diffChars, diffArrays } from "diff";
import { TextEditor } from "../text_editor";

describe("Diff", () => {

  test("Simple", () => {
    const editor = new TextEditor();
    const text = "😛😝😜🤪";
    editor.text = text;
    editor.moveCursor(4);
    editor.backspace();

    const diff = diffArrays([...text], editor.characters as string[]);
  });
});
