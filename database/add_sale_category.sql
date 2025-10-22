USE mebel_db;

-- Добавление категории "Распродажа"
INSERT INTO categories (name, slug, parent_id, description, is_active, sort_order) VALUES
('Распродажа', 'sale', 1, 'Товары со скидкой', TRUE, 11);

