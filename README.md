# Auth Workshop - JWT, OAuth2, Roles

Клонувати репозиторій: git clone <посилання-на-репозиторій>
Перейти в папку: cd auth-workshop
Встановити залежності: npm install
Запустити сервер: npm start

Сервер працює на: http://localhost:3000

Тестові обліковки:
User: user@example.com / user123
Admin: admin@example.com / admin123

Запити для тестування:

1. Отримати токен user:
curl -X POST http://localhost:3000/login -H "Content-Type: application/json" -d '{"email":"user@example.com","password":"user123"}'

2. Отримати токен admin:
curl -X POST http://localhost:3000/login -H "Content-Type: application/json" -d '{"email":"admin@example.com","password":"admin123"}'

3. Перевірити профіль без токена (має бути 401):
curl http://localhost:3000/profile

4. Перевірити профіль з токеном (має бути 200):
curl http://localhost:3000/profile -H "Authorization: Bearer ТВІЙ_ТОКЕН"

5. User намагається видалити (має бути 403):
curl -X DELETE http://localhost:3000/users/123 -H "Authorization: Bearer USER_ТОКЕН"

6. Admin видаляє (має бути 200):
curl -X DELETE http://localhost:3000/users/123 -H "Authorization: Bearer ADMIN_ТОКЕН"

Як використовувати:
1. Запустіть сервер: npm start
2. Отримайте токен з запиту 1 або 2
3. Скопіюйте токен з відповіді
4. Використовуйте токен в запитах 4, 5, 6 замість "ТВІЙ_ТОКЕН"
5. Виконуйте запити для тестування