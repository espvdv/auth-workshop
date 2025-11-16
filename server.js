console.log('Запускаємо повний сервер з JWT та RBAC...');

import 'dotenv/config';
import express from 'express';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET = process.env.JWT_SECRET;

app.use(express.json());

const users = [
  { id: 1, email: 'admin@example.com', password: 'admin123', role: 'admin' },
  { id: 2, email: 'user@example.com', password: 'user123', role: 'user' },
];

const requireAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Токен доступу обовʼязковий' });
  }

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Невірний або прострочений токен' });
    }
    req.user = decoded;
    next();
  });
};

const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user.role || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Недостатньо прав' });
    }
    next();
  };
};

app.get('/', (req, res) => {
  res.json({ 
    message: 'Auth Workshop API працює!',
    endpoints: {
      login: 'POST /login',
      profile: 'GET /profile (потрібна автентифікація)',
      delete_user: 'DELETE /users/:id (тільки для адмінів)'
    },
    test_users: {
      admin: 'admin@example.com / admin123',
      user: 'user@example.com / user123'
    }
  });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email та пароль обовʼязкові' });
  }

  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ error: 'Невірний email або пароль' });
  }

  const token = jwt.sign(
    { 
      sub: user.id,
      role: user.role 
    },
    SECRET,
    { expiresIn: '15m' }
  );

  res.json({
    access_token: token,
    token_type: 'Bearer',
    expires_in: 900
  });
});

app.get('/profile', requireAuth, (req, res) => {
  res.json({
    user_id: req.user.sub,
    role: req.user.role,
    message: 'Дані профілю успішно отримано'
  });
});

app.delete('/users/:id', requireAuth, checkRole(['admin']), (req, res) => {
  res.json({ 
    message: `Користувача ${req.params.id} успішно видалено (демо)`,
    deleted_by: req.user.sub,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('СЕРВЕР ЗАПУЩЕНО!');
  console.log('='.repeat(60));
  console.log(`Порт: ${PORT}`);
  console.log(`URL: http://localhost:${PORT}`);
  console.log(`JWT: ✅ Активовано`);
  console.log('='.repeat(60));
  console.log('Команди для тестування:');
  console.log('');
  console.log('1. Отримати токен user:');
  console.log('   curl -X POST http://localhost:3000/login \\');
  console.log('        -H "Content-Type: application/json" \\');
  console.log('        -d \'{"email":"user@example.com","password":"user123"}\'');
  console.log('');
  console.log('2. Отримати токен admin:');
  console.log('   curl -X POST http://localhost:3000/login \\');
  console.log('        -H "Content-Type: application/json" \\');
  console.log('        -d \'{"email":"admin@example.com","password":"admin123"}\'');
  console.log('');
  console.log('3. Доступ до профілю:');
  console.log('   curl -H "Authorization: Bearer TOKEN" http://localhost:3000/profile');
  console.log('');
  console.log('4. Тест RBAC (тільки admin):');
  console.log('   curl -X DELETE -H "Authorization: Bearer ADMIN_TOKEN" http://localhost:3000/users/123');
  console.log('='.repeat(60));
});