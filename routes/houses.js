const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  const db = req.db;
  db.all('SELECT * FROM houses ORDER BY id DESC', [], (err, houses) => {
    if (err) {
      return res.status(500).send('Database error');
    }
    res.render('index', { houses });
  });
});

router.get('/add-house', (req, res) => {
  res.render('add-house', { error: null, formData: {} });
});

router.post('/add-house', (req, res) => {
  const db = req.db;
  const { title, location, price } = req.body;

  if (!title || !location || !price || Number.isNaN(Number(price))) {
    return res.status(400).render('add-house', {
      error: 'Title, location, and price are required.',
      formData: { title, location, price }
    });
  }

  db.run(
    'INSERT INTO houses (title, location, price, status) VALUES (?, ?, ?, ?)',
    [title.trim(), location.trim(), Number(price), 'Available'],
    (err) => {
      if (err) {
        return res.status(500).send('Database error');
      }
      res.redirect('/');
    }
  );
});

router.post('/houses/:id/sold', (req, res) => {
  const db = req.db;
  const { id } = req.params;

  db.run('UPDATE houses SET status = ? WHERE id = ?', ['Sold', id], (err) => {
    if (err) {
      return res.status(500).send('Database error');
    }
    res.redirect('/');
  });
});

router.post('/houses/:id/delete', (req, res) => {
  const db = req.db;
  const { id } = req.params;

  db.run('DELETE FROM houses WHERE id = ?', [id], (err) => {
    if (err) {
      return res.status(500).send('Database error');
    }
    res.redirect('/');
  });
});

module.exports = router;
