const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
  res.send('welcome');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});