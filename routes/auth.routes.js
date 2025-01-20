// ERP_OS_Backend/routes/auth.routes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
require('dotenv').config();

const secret = process.env.JWT_SECRET;

// Exemple d'utilisateur - en pratique, vous devriez utiliser une base de données
const users = [
  {
    id: 1,
    username: 'guigui2401',
    password: '123abc9z',
    permissions: ['readAll-designation','readAll-setting', 'viewUser', 'createUser', 'updateUser', 'deleteUser','viewSetting','createSaleInvoice','viewSaleInvoice','createCustomer', 'deleteReport', 'viewReport' ]
  }
];

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    const token = jwt.sign({ sub: user.id, permissions: user.permissions }, secret, { algorithm: 'HS256' });
    res.json({ token });
  } else {
    res.status(400).json({ message: 'Username or password is incorrect' });
  }
});

module.exports = router;
