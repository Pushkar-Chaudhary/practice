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
  const taskName = decodeURIComponent(req.params.name);
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

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

app.get('/edit/:name', function (req, res) {
  const taskName = decodeURIComponent(req.params.name);
  const filePath = path.join(__dirname, 'files', `${taskName}.txt`);

  fs.readFile(filePath, 'utf8', function (err, content) {
    if (err) {
      return res.status(404).send('Task not found.');
    }

    const html = `
      <h1 style="font-family: Arial; margin: 20px;">Edit ${taskName}</h1>
      <form method="post" action="/edit/${encodeURIComponent(taskName)}" style="font-family: Arial; margin: 20px; max-width: 500px;">
        <div style="margin-bottom: 12px;">
          <label for="title" style="display: block; margin-bottom: 6px;">Title</label>
          <input id="title" name="title" value="${escapeHtml(taskName)}" style="width: 100%; padding: 8px; box-sizing: border-box;" />
        </div>
        <div style="margin-bottom: 12px;">
          <label for="details" style="display: block; margin-bottom: 6px;">Details</label>
          <textarea id="details" name="details" style="width: 100%; min-height: 180px; padding: 8px; box-sizing: border-box;">${escapeHtml(content)}</textarea>
        </div>
        <button type="submit" style="padding: 8px 16px;">Save changes</button>
        <a href="/" style="margin-left: 12px;">Cancel</a>
      </form>
    `;

    res.send(html);
  });
});

app.post('/edit/:name', function (req, res) {
  const oldTaskName = decodeURIComponent(req.params.name);
  const title = (req.body.title || '').trim();
  const details = req.body.details || '';

  if (!title) {
    return res.redirect('/');
  }

  const safeTitle = title.split(/\s+/).join(' ');
  const oldFilePath = path.join(__dirname, 'files', `${oldTaskName}.txt`);
  const newFilePath = path.join(__dirname, 'files', `${safeTitle}.txt`);

  if (oldTaskName !== safeTitle && fs.existsSync(oldFilePath)) {
    fs.unlinkSync(oldFilePath);
  }

  fs.writeFile(newFilePath, details, function (err) {
    if (err) {
      console.error(err);
      return res.status(500).send('Could not update task.');
    }

    res.redirect('/');
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