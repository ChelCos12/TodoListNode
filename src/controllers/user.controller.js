const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../db/connection');
const { userDecorator } = require('../decorators/user.decorator');

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Formato de email inválido' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 6 caracteres' });
    }
    const [[user]] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (user) {
      return res.status(409).json({ success: false, message: 'El email ya está registrado' });
    }
    const id = uuidv4();
     const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)',
      [id, name, email, hashedPassword]
    );
    const token = jwt.sign({ id, email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '12h',
    });
    res.status(201).json({
      success: true,
      message: 'Registro exitoso',
      data: {
        user: userDecorator({ id, name, email }),
        access_token: token,
        token_type: 'Bearer',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error del servidor', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email y contraseña son obligatorios' });
    }
    const [[user]] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '12h',
    });
    res.status(201).json({
      success: true,
      message: 'Login exitoso',
      data: {
        user: userDecorator(user),
        access_token: token,
        token_type: 'Bearer',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error del servidor', error: error.message });
  }
};

const logout = async (req, res) => {
  try {
    res.status(201).json({ success: true, message: 'Sesión cerrada' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error del servidor', error: error.message });
  }
  
};

module.exports = { register, login, logout };
