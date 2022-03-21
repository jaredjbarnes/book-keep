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
    expect(editor.cursorPosition).toBe(7);

    editor.moveCursor(8);
    expect(editor.cursorPosition).toBe(8);

    editor.moveCursor(9);
    expect(editor.cursorPosition).toBe(8);

    editor.moveCursor(0);
    expect(editor.cursorPosition).toBe(0);

    editor.moveCursor(-1);
    expect(editor.cursorPosition).toBe(0);

    editor.moveCursor(5);
    expect(editor.cursorPosition).toBe(5);
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

    expect(editorText).toBe("Selec this text and this text.");
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

    expect(editor.cursorPosition).toBe(1);
  });

  test("Select range left to right and delete.", () => {
    const editor = new TextEditor();
    const text = "1234\n1234\n1234\n1234\n1234\n1234";

    editor.text = text;
    editor.addRange(1, 7);
    const ranges = editor.getRanges();

    expect(ranges.length).toBe(1);
    editor.backspace();

    expect(editor.cursorPosition).toBe(1);
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

  test("Unicode Chinese", () => {
    const editor = new TextEditor();
    editor.text = "三大天小";

    editor.moveCursorBy(3);
    editor.backspace();

    expect(editor.text).toBe("三大小");
  });

  test("Orphaned decoration.", () => {
    const editor = new TextEditor();
    editor.text = "😛😝😜🤪";
    editor.addDecoration({
      type: "test",
      startIndex: 0,
      endIndex: 1,
    });
    editor.addDecoration({
      type: "test",
      startIndex: 1,
      endIndex: 3,
    });
    editor.addDecoration({
      type: "test",
      startIndex: 3,
      endIndex: 4,
    });

    editor.addRange(1, 3);
    editor.backspace();

    expect(editor.text).toBe("😛🤪");
    expect(editor.getDecorationsByType("test").length).toBe(2);
  });

  test("Sticky Decorations", () => {
    const editor = new TextEditor();
    editor.text = "J";
    editor.addDecoration({
      type: "sticky",
      startIndex: 0,
      endIndex: 1,
    });

    editor.moveCursor(1);
    editor.insert("a");
    editor.insert("r");
    editor.insert("e");
    editor.insert("d");

    let decorations = editor.getDecorationsByType("sticky");
    let decoration = decorations[0];

    expect(editor.text).toBe("Jared");
    expect(decorations.length).toBe(1);
    expect(decoration.startIndex).toBe(0);
    expect(decoration.endIndex).toBe(5);

    editor.backspace();
    editor.backspace();

    decorations = editor.getDecorationsByType("sticky");
    decoration = decorations[0];

    expect(editor.text).toBe("Jar");
    expect(decorations.length).toBe(1);
    expect(decoration.startIndex).toBe(0);
    expect(decoration.endIndex).toBe(3);
  });
});
