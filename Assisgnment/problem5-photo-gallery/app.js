const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/gallery', (req, res) => {
  const images = ['img1.jpg', 'img2.jpg', 'img3.jpg'];

  res.render('gallery', { images });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
