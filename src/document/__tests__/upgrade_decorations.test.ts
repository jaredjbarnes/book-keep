import { Decoration } from "./../decoration_manager";
import { upgradeDecorations } from "./../upgrade_decorations";

describe("Upgrade Decorations", () => {
  test("Span, overlap left, overlap right, left, right, middle.", () => {
   const decorations: Decoration[] = [
      {
        id: "span",
        type: "span",
        startIndex: 0,
        endIndex: 3,
      },
      {
        id: "left",
        type: "left",
        startIndex: 0,
        endIndex: 1,
      },
      {
        id: "overlap-left",
        type: "overlap-left",
        startIndex: 0,
        endIndex: 2,
      },
      {
        id: "middle",
        type: "middle",
        startIndex: 1,
        endIndex: 2,
      },
      {
        id: "overlap-right",
        type: "overlap-right",
        startIndex: 1,
        endIndex: 3,
      },
      {
        id: "right",
        type: "right",
        startIndex: 2,
        endIndex: 3,
      },
    ];

    const results = upgradeDecorations("-o_", "-n_", decorations);
    const middle = results.filter(d=>d.type === "middle");
    const span = results.filter(d=>d.type === "span")[0];
    const left = results.filter(d=>d.type === "left")[0];
    const overlapLeft = results.filter(d=>d.type === "overlap-left")[0];
    const overlapRight = results.filter(d=>d.type === "overlap-right")[0];
    const right = results.filter(d=>d.type === "right")[0];

    expect(middle.length).toBe(0);
    expect(span.startIndex).toBe(0);
    expect(span.endIndex).toBe(3);

    expect(left.startIndex).toBe(0);
    expect(left.endIndex).toBe(1);

    expect(overlapLeft.startIndex).toBe(0);
    expect(overlapLeft.endIndex).toBe(2);

    expect(overlapRight.startIndex).toBe(1);
    expect(overlapRight.endIndex).toBe(3);

    expect(right.startIndex).toBe(2);
    expect(right.endIndex).toBe(3);

    expect(results.length).toBe(5);
  });
});
