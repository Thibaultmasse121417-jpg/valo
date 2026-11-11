// Unit tests: ISBN, CSV parsing / mapping, prices. Run: node --test tests/
import test from "node:test";
import assert from "node:assert/strict";
import { normalizeIsbn, normalizeDate, formatIsbn } from "../admin/js/isbn.js";
import { parseCsv, detectDelimiter, guessMapping, rowToBook, splitAuthors, parseAvailability, matchCategory, toCsv } from "../admin/js/csv.js";
import { parsePrice } from "../admin/js/ui.js";

const cats = [
  { id: "litterature", title: "Littérature & Essais", short_title: "Littérature", kicker: "Romans · Essais littéraires" },
  { id: "poche", title: "Poche", short_title: "Poche", kicker: "La pochothèque" },
  { id: "bd", title: "BD, Comics & Manga", short_title: "BD & Manga", kicker: "Bande dessinée" },
];

test("ISBN: valid 13, ISBN-10 conversion, bad checksum, hyphens", () => {
  assert.equal(normalizeIsbn("978-2-07-036002-4"), "9782070360024");
  assert.equal(normalizeIsbn("2070360024"), "9782070360024");
  assert.equal(normalizeIsbn("9782070360025"), null);
  assert.equal(normalizeIsbn("abc"), null);
  assert.equal(normalizeIsbn("080442957X"), "9780804429573");
  assert.equal(formatIsbn("9782070360024"), "978-2-07036-002-4");
});

test("dates", () => {
  assert.equal(normalizeDate("07-01-1972"), "1972");
  assert.equal(normalizeDate("2024-05-03"), "2024-05-03");
  assert.equal(normalizeDate("May 2019"), "2019");
  assert.equal(normalizeDate("n.d."), null);
});

test("prices (French formats)", () => {
  assert.equal(parsePrice("18,50 €"), 18.5);
  assert.equal(parsePrice("7.9"), 7.9);
  assert.equal(parsePrice(""), null);
  assert.ok(Number.isNaN(parsePrice("gratuit")));
});

test("CSV: Excel FR semicolons, quotes, embedded newlines", () => {
  const text = 'isbn;titre;auteur;prix\n9782070360024;"L\'Étranger";Albert Camus;"8,90"\n2070360024;"Un titre ; avec\nretour";"Dupont, Jean";12\n';
  assert.equal(detectDelimiter(text), ";");
  const rows = parseCsv(text, ";");
  assert.equal(rows.length, 3);
  assert.equal(rows[2][1], "Un titre ; avec\nretour");
});

test("CSV: header guessing and row conversion", () => {
  const head = ["EAN", "Libellé", "Auteurs", "Éditeur", "Prix TTC", "Qté", "Rayon", "Coup de cœur"];
  const map = guessMapping(head);
  assert.equal(map.isbn, 0); assert.equal(map.title, 1); assert.equal(map.authors, 2); assert.equal(map.publisher, 3);
  assert.equal(map.price, 4); assert.equal(map.stock_qty, 5); assert.equal(map.category, 6); assert.equal(map.is_staff_pick, 7);
  const ctx = { categories: cats, defaultCategory: null, enrich: false, publish: true };
  const { book, errors } = rowToBook(["978-2-07-036002-4", "L'Étranger", "Albert Camus", "Gallimard", "8,90", "0", "poche", "oui"], map, ctx);
  assert.deepEqual(errors, []);
  assert.equal(book.isbn, "9782070360024"); assert.equal(book.price, 8.9); assert.equal(book.stock_qty, 0);
  assert.equal(book.availability, "out_of_stock"); assert.equal(book.category_id, "poche"); assert.equal(book.is_staff_pick, true);
  const bad = rowToBook(["123", "", "", "", "abc", "x", "", ""], map, ctx);
  assert.equal(bad.errors.length, 4);
});

test("CSV: missing rayon never blanks the category (updates)", () => {
  const map = { isbn: 0, title: 1 };
  const { book } = rowToBook(["9782070360024", "Titre"], map, { categories: cats, enrich: false, publish: true });
  assert.equal("category_id" in book, false);
});

test("authors / availability / categories", () => {
  assert.deepEqual(splitAuthors("Albert Camus, Jean Giono"), ["Albert Camus", "Jean Giono"]);
  assert.deepEqual(splitAuthors("CAMUS, Albert"), ["Albert CAMUS"]);
  assert.deepEqual(splitAuthors("Goscinny / Uderzo"), ["Goscinny", "Uderzo"]);
  assert.equal(parseAvailability("Sur commande"), "on_order");
  assert.equal(parseAvailability("épuisé"), "out_of_stock");
  assert.equal(parseAvailability("", 2), "low_stock");
  assert.equal(matchCategory("Bande dessinée", cats), "bd");
  assert.equal(matchCategory("LITTERATURE", cats), "litterature");
  assert.equal(matchCategory("cuisine", cats), null);
});

test("CSV export escapes", () => {
  const out = toCsv([["a", 'b"c', "d;e"]]);
  assert.equal(out, '﻿a;"b""c";"d;e"');
});
