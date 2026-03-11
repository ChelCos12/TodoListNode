const bcrypt = require('bcrypt');
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
     const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)',
      [id, name, email, hashedPassword]
    );
    res.json(userDecorator({ id, name, email }));
  } catch (error) {
    res.json(error);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const [[user]] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) return res.json(null);
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.json(null);
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '12h',
    });
    res.json({ user: userDecorator(user), token });
  } catch (error) {
    res.json(error);
  }
};

const logout = async (req, res) => {
  try {
    res.json({ message: 'Sesión cerrada' });
  } catch (error) {
    res.json(error);
  }
  
};

module.exports = { register, login, logout };
