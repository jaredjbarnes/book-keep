import { TextEditor } from "./../text_editor";
describe("TextEditor", () => {
  test("Set and get text.", () => {
    const editor = new TextEditor();
    const text = "My text.";

    editor.text = text;

    const editorText = editor.text;
    expect(editorText).toBe(text);
  });

  test("Replace text.", () => {
    const editor = new TextEditor();
    const text = "My text.";

    editor.text = text;
    editor.replaceText(3, 8, "awesome text.");

    const editorText = editor.text;

    expect(editorText).toBe("My awesome text.");
  });

  test("Replace simple example.", () => {
    const editor = new TextEditor();
    const text = "Cat";

    editor.text = text;
    editor.replaceText(0, 1, "B");

    const editorText = editor.text;

    expect(editorText).toBe("Bat");
  });

  test("Remove text.", () => {
    const editor = new TextEditor();
    const text = "My text.";

    editor.text = text;
    editor.removeText(2, 8);

    const editorText = editor.text;

    expect(editorText).toBe("My");
  });

  test("Move cursor.", () => {
    const editor = new TextEditor();
    const text = "My text.";

    editor.text = text;

    editor.moveCursor(7);
    expect(editor.cursor.startIndex).toBe(7);

    editor.moveCursor(8);
    expect(editor.cursor.startIndex).toBe(8);

    editor.moveCursor(9);
    expect(editor.cursor.startIndex).toBe(8);

    editor.moveCursor(0);
    expect(editor.cursor.startIndex).toBe(0);

    editor.moveCursor(-1);
    expect(editor.cursor.startIndex).toBe(0);

    editor.moveCursor(5);
    expect(editor.cursor.startIndex).toBe(5);
  });

  test("Insert text.", () => {
    const editor = new TextEditor();
    const text = "My text.";

    editor.text = text;
    editor.moveCursor(8);
    editor.insert(" I love my text.");

    let editorText = editor.text;

    expect(editorText).toBe("My text. I love my text.");

    editor.moveCursor(0);
    editor.insert("Text has many colors. ");

    editorText = editor.text;

    expect(editorText).toBe("Text has many colors. My text. I love my text.");

    editor.moveCursor(editor.text.length - 1);
    editor.insert("s");

    editorText = editor.text;

    expect(editorText).toBe("Text has many colors. My text. I love my texts.");
  });

  test("Insert text with selection.", () => {
    const editor = new TextEditor();
    const text = "Select this text and this text.";

    editor.text = text;
    editor.addRange(7, 16);
    editor.addRange(21, 30);
    editor.insert("this stuff");

    const editorText = editor.text;

    expect(editorText).toBe("Select this stuff and this stuff.");
  });

  test("Backspace.", () => {
    const editor = new TextEditor();
    const text = "Select this text and this text.";

    editor.text = text;
    editor.moveCursor(6);
    editor.backspace();

    const editorText = editor.text;

    expect(editorText).toBe("Select this text and this text.");
  });

  test("GetCharacterAtCursor.", () => {
    const editor = new TextEditor();
    const text = "1234\n1234\n1234\n1234\n1234\n1234";
    editor.text = text;

    expect(editor.getCharacterAtCursor()).toBe("1");

    editor.moveCursor(1);

    expect(editor.getCharacterAtCursor()).toBe("2");
  });

  test("Add, and remove decoration.", () => {
    const editor = new TextEditor();
    const text = "1234\n1234\n1234\n1234\n1234\n1234";
    const decoration = { type: "test", startIndex: 0, endIndex: 5 };

    editor.text = text;
    editor.addDecoration(decoration);

    expect(editor.decorations.filter((d) => d.type === "test").length).toBe(1);
    editor.removeDecoration(decoration);

    expect(editor.decorations.filter((d) => d.type === "test").length).toBe(0);
  });

  test("Select range right to left and delete.", () => {
    const editor = new TextEditor();
    const text = "1234\n1234\n1234\n1234\n1234\n1234";

    editor.text = text;
    editor.addRange(7, 1);
    const ranges = editor.getRanges();

    expect(ranges.length).toBe(1);
    editor.backspace();
    const cursor = editor.getCursor();

    expect(cursor.startIndex).toBe(1);
  });

  test("Select range left to right and delete.", () => {
    const editor = new TextEditor();
    const text = "1234\n1234\n1234\n1234\n1234\n1234";

    editor.text = text;
    editor.addRange(1, 7);
    const ranges = editor.getRanges();

    expect(ranges.length).toBe(1);
    editor.backspace();
    const cursor = editor.getCursor();

    expect(cursor.startIndex).toBe(1);
  });

  test("Select range around decoration delete and check if range is gone, then undo.", () => {
    const editor = new TextEditor();
    const text = "1234\n1234\n1234\n1234\n1234\n1234";
    const decoration = { type: "my-decoration", startIndex: 3, endIndex: 6 };

    editor.text = text;
    editor.addDecoration(decoration);
    editor.addRange(1, 7);
    const ranges = editor.getRanges();

    expect(ranges.length).toBe(1);
    editor.backspace();
    const cursor = editor.getCursor();

    expect(cursor.startIndex).toBe(1);
    expect(editor.getRanges().length).toBe(0);
    expect(editor.getDecorations().length).toBe(1);
    expect(editor.getDecorations()[0].type).toBe("cursor");

    editor.undo();

    expect(editor.getRanges().length).toBe(0);
    expect(editor.getDecorations().length).toBe(2);
  });

  test("Unicode", () => {
    const editor = new TextEditor();
    editor.text = "😛😝😜🤪";

    expect(editor.length).toBe(4);
    editor.addRange(0, 4);
    editor.delete();

    expect(editor.length).toBe(0);
  });

  test("Unicode Delete", () => {
    const editor = new TextEditor();
    editor.text = "😛😝😜🤪";

    editor.moveCursorBy(3);
    editor.delete();

    expect(editor.text).toBe("😛😝😜");
  });

  test("Unicode Backspace", () => {
    const editor = new TextEditor();
    editor.text = "😛😝😜🤪";

    editor.moveCursorBy(3);
    editor.backspace();

    expect(editor.text).toBe("😛😝🤪");
  });
});
