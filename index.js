'use strict';

const readline = require('readline');
const fs = require('fs');
const fetch = require('node-fetch');

const rl = readline.createInterface({
  input: fs.createReadStream('Bibles/English__New_American_Standard__nasb__LTR.txt')
});

function createRecords() {
  let docs = [];
  let verses = [];

  function sendData() {
    const body = JSON.stringify({ docs });

    fetch('http://localhost:5984/chapters/_bulk_docs', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body,
    }).then((res) => {
      return res.json();
    }).then((x) => {
      console.log(x.length);
    });

    docs = [];
  }

  function reduceBook() {
    const lastVerse = verses[verses.length - 1];
    const { book, chapter } = lastVerse;

    docs.push({
      _id: `${book.replace(' ', '_')}:${chapter}`,
      book, chapter, verses,
    });
  }

  rl.on('line', (line) => {
    const [book, chapter, verse, text] = line.split('||');
    const lastVerse = verses[verses.length - 1];

    if (book && chapter && verse && text) {
      if (lastVerse && (lastVerse.chapter !== chapter || lastVerse.book !== book)) {
        reduceBook();

        verses = [];
      }

      verses.push({
        book, chapter, verse, text,
      });
    }
  });

  rl.on('close', () => {
    reduceBook();
    sendData();
  });
}

createRecords();
