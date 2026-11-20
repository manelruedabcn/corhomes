CREATE TABLE properties (id INTEGER PRIMARY KEY, slug TEXT UNIQUE NOT NULL, title TEXT NOT NULL, city TEXT NOT NULL, operation TEXT NOT NULL, price REAL NOT NULL, area REAL NOT NULL, rooms INTEGER NOT NULL, description TEXT NOT NULL, images TEXT NOT NULL, status TEXT NOT NULL, private_token TEXT);
--> statement-breakpoint
CREATE UNIQUE INDEX properties_private_token ON properties(private_token);
--> statement-breakpoint
CREATE TABLE leads (id INTEGER PRIMARY KEY, created TEXT NOT NULL, name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT, message TEXT, property_id INTEGER);
