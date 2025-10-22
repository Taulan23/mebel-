USE mebel_db;

-- Вставка администратора по умолчанию
-- Пароль: admin123
INSERT INTO users (email, password_hash, first_name, last_name, phone, role, is_active, email_verified) VALUES
('admin@mebel.ru', '$2a$10$XQV8zN6Z3K8BxQxG5fN6qO7lKqQwXJZ2jqNvN3yZ1FqNYwN6Z3K8B', 'Админ', 'Администратов', '+7 (900) 123-45-67', 'admin', TRUE, TRUE);

-- Вставка тестового пользователя
-- Пароль: user123
INSERT INTO users (email, password_hash, first_name, last_name, phone, role, is_active, email_verified) VALUES
('user@test.ru', '$2a$10$KQV8zN6Z3K8BxQxG5fN6qO7lKqQwXJZ2jqNvN3yZ1FqNYwN6Z3K8C', 'Иван', 'Петров', '+7 (900) 111-22-33', 'user', TRUE, TRUE);

-- Вставка категорий
INSERT INTO categories (name, slug, parent_id, description, is_active, sort_order) VALUES
('Все товары', 'all', NULL, 'Все товары магазина', TRUE, 1),
('Кровати', 'beds', 1, 'Кровати всех видов и размеров', TRUE, 2),
('Двуспальные кровати', 'double-beds', 2, 'Кровати для двоих', TRUE, 3),
('Односпальные кровати', 'single-beds', 2, 'Кровати для одного человека', TRUE, 4),
('Детские кровати', 'kids-beds', 2, 'Кровати для детей и подростков', TRUE, 5),
('Диваны', 'sofas', 1, 'Диваны для гостиной и спальни', TRUE, 6),
('Шкафы', 'wardrobes', 1, 'Шкафы для одежды', TRUE, 7),
('Столы', 'tables', 1, 'Столы обеденные и письменные', TRUE, 8),
('Стулья', 'chairs', 1, 'Стулья для кухни и офиса', TRUE, 9),
('Матрасы', 'mattresses', 1, 'Ортопедические матрасы', TRUE, 10);

-- Вставка тестового промокода
INSERT INTO promo_codes (code, discount_type, discount_value, min_order_amount, max_discount_amount, valid_from, valid_until, usage_limit, is_active) VALUES
('WELCOME10', 'percent', 10.00, 5000.00, 5000.00, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR), 100, TRUE),
('NEWYEAR2025', 'fixed', 1000.00, 10000.00, NULL, NOW(), DATE_ADD(NOW(), INTERVAL 6 MONTH), 500, TRUE);

