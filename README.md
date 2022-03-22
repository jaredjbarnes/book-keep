# book-keep


Make a map to store the size of words based on their 
Important text styling
* font-family
* font-size
* font-weight
* letter-spacing
* line-height
* margin-top
* margin-bottom
* baseline

Tables
==

Collection
* collection_id (number)
* status (draft and published)
* title
* description_id (Document)
* creator_id

Book
* book_id (number)
* status (draft and published)
* title
* description_id (Document)
* creator_id

Document
* document_id (number)
* status (draft and published)
* version (number)
* title
* text
* language
* origin_language
* creator_id
* formatting_decorations (JSON)

Decoration
* decoration_id (number)
* type
* title
* document_id (number)
* document_version (number)
* is_orphaned
* start_index
* end_index
* creator_id (number)
* payload (JSON)

CollectionToBook
* collection_id (number)
* book_id (number)
* order

BookToDocument
* book_id (number)
* document_id (number)
* order

A decoration becomes an orphan if the size was greater than 0 and is shrunk to 0. 

Store versions of all documents, so that we can retry upgrades to existing decorations.
Use "diff" module to find the parts that have changed and step through the changes with
the decoration manager with the loaded decorations and then persist them. This can be 
parallelized by distributing the decorations that need to be upgraded. Steps to upgrade 
decorations. 

1 - Load the new and old version of the document.
2 - Load the decorations.
3 - Run the diffArray with the "diff" module to get diffs.
4 - Load the old text into the text editor.
5 - Move cursor through the diffs adding/removing text.
6 - Save the resulting positions of the decorations.

Never delete versions of the the document or the decorations when upgrading. This allows
any user to go through the history of the document.

Everything but test is a decoration, Figures, Videos, Images, Illustration are all 
decorations.

There should be a document decoration which points to a different document.
There should be semantic decorations to indicate headings paragraphs etc.
There could be chapter decorations.

Really there is an infinite way to use decorations.

All formatting should be saved with the document. These are the only decorations that are
saved during all workflows. 

The non-formatting decorations are only upgraded when the document is published status.

Rendering Engine
===
Needs to create meta data for lines. Start Character Index, End Character Index, height.

Line
* offset
* startCharacterIndex
* endCharacterIndex
* height

Figures
===
Figures are assigned to an exact character index within the RenderEngine. There will be 
endless types of figures. The figures are decorations with type "figure". Figure 
implementations should be dynamically loaded as a javascript module. If it can't find 
the module it will display an error figure, not yet implemented figure. The figure 
decoration decides if the figure is block or wrap around it will also decide if it is 
left, center or right aligned. The module will adhere to an
interface which will tell the renderer what the dimensions are of the figure.

Recalculating a line can cause a reflow to the end of the viewport. 

When the the last lines last character doesn't match the character length of the 
document we know we need to render more lines.

A figure will always cause a new line. 

LineDetails will help when the user selects content within the document.
LineDetails
* characterPositions (number[])

The layout engine needs to iterate over the decorations and the characters to discover 
line breaks. Three main causes of line breaks, 
* \n
* Decoration
* Characters exceeded rendered document width

Layout Engine should do one line at a time, and let go of the thread, it should go until 
it has rendered to the bottom of the viewport.

Decorations need to be sorted by startIndex so that we can find relevant decorations 
quickly. We can use binary search to both find and splice the location of decorations.

Remove cursor out of the decorations.

The decorations need to live inside of the decoration manager. We should delegate the 
decoration management to that, we should add the binary search there and other optimizations.

DecorationManager 
* decorations
* addDecoration
* adjustPositionDecoration
* removeDecoration

