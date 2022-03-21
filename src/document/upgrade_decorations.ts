import { diffArrays } from "diff";
import { Decoration } from "./decoration_manager";
import { Document } from "./document";

export function upgradeDecorations(
  oldText: string,
  newText: string,
  decorations: Decoration[]
) {
  const editor = new Document();
  editor.text = oldText;

  decorations.forEach((d) => editor.addDecoration(d));
  const diff = diffArrays([...oldText], [...newText]);

  diff.forEach((d) => {
    if (d.added) {
      editor.insert(d.value.join(""));
    } else if (d.removed) {
      editor.addRange(
        editor.cursorPosition,
        editor.cursorPosition + (d.count || 0)
      );
      editor.backspace();
    } else {
      editor.moveCursorBy(d.count || 0);
    }
  });

  return editor.decorations.filter((d) => d.type !== "cursor");
}
