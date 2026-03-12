const { v4: uuidv4 } = require('uuid');
const { pool } = require('../db/connection');
const { userDecorator } = require('../decorators/user.decorator');

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const [[user]] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    if (user) return res.json(null);
    const id = uuidv4();
    await pool.query(
      'INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)',
      [id, name, email, password]
    );
    res.json(userDecorator({ id, name, email }));
  } catch (error) {
    res.json(error);
  }
};

module.exports = { register };