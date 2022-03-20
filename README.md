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



