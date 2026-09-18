const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
  fs.readdir('./files', function (err, files) {
    if (err) {
      console.error(err);
      return res.status(500).send('Could not read tasks.');
    }

    const taskFiles = files
      .filter((file) => file.endsWith('.txt'))
      .map((file) => file.replace(/\.txt$/, ''));

    res.render('index', { files: taskFiles });
  });
});

app.get('/task/:name', function (req, res) {
  const taskName = req.params.name;
  const filePath = path.join(__dirname, 'files', `${taskName}.txt`);

  fs.readFile(filePath, 'utf8', function (err, content) {
    if (err) {
      return res.status(404).send('Task not found.');
    }

    res.send(`
      <h1 style="font-family: Arial; margin: 20px;">${taskName}</h1>
      <p style="font-family: Arial; margin: 20px; white-space: pre-wrap;">${content}</p>
      <a href="/" style="margin: 20px; display: inline-block;">Back</a>
    `);
  });
});

app.post('/create', function (req, res) {
  const title = (req.body.title || '').trim();
  const details = req.body.details || '';

  if (!title) {
    return res.redirect('/');
  }

  const safeTitle = title.split(/\s+/).join(' ');

  fs.writeFile(`./files/${safeTitle}.txt`, details, function (err) {
    if (err) {
      console.error(err);
      return res.status(500).send('Could not save task.');
    }

    res.redirect('/');
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});