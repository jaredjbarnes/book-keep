# book-keep


Make a map to store the size of words based on their 
Important text styling
* font-family
* font-size
* font-weight
* letter-spacing
* line-height

Tables
==

Collection
* collection_id
* title
* description_id (Document)
* creator_id

Book
* book_id
* title
* description_id (Document)
* creator_id

Document
* document_id
* version
* title
* text
* language
* origin_language
* creator_id

Decoration
* decoration_id 
* type
* title
* document_id
* document_version
* is_orphaned
* start_index
* end_index
* creator_id
* payload (JSON)

CollectionToBook
* collection_id
* book_id
* order

BookToDocument
* book_id
* document_id
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

