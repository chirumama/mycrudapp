CREATE TABLE IF NOT EXISTS "Items" (
  "id" SERIAL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "tag" TEXT,
  "image_url" TEXT,
  "link" TEXT
);

INSERT INTO "Items"
("title", "description", "tag", "image_url", "link")
VALUES
(
  'Design Systems Handbook',
  'Learn how to build scalable and consistent design systems.',
  'Design',
  'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
  'https://www.designbetter.co/design-systems-handbook'
),
(
  'Deep Work',
  'Strategies for focused success in a distracted world.',
  'Productivity',
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
  'https://www.calnewport.com/books/deep-work/'
),
(
  'Getting Things Done',
  'A productivity methodology for managing tasks effectively.',
  'Productivity',
  'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800',
  'https://gettingthingsdone.com/'
);