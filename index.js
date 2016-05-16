'use strict';

const readline = require('readline');
const fs = require('fs');
const fetch = require('node-fetch');

const rl = readline.createInterface({
  input: fs.createReadStream('Bibles/English__New_American_Standard__nasb__LTR.txt')
});

function createRecords() {
  let docs = [];

  rl.on('line', (line) => {
    var [book, chapter, verse, text] = line.split('||');

    if (book && chapter && verse && text) {
      docs.push({
        _id: `${book.replace(' ', '')}+${chapter}+${verse}`,
        book, chapter, verse, text,
      });
    }

    if (docs.length === 400) {
      const body = JSON.stringify({ docs });

      fetch('http://localhost:5984/verses/_bulk_docs', {
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
  });

  rl.on('close', () => {
  });
}

createRecords();
