const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');
const ProductImage = require('./ProductImage');
const ProductAttribute = require('./ProductAttribute');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Cart = require('./Cart');
const Favorite = require('./Favorite');
const Review = require('./Review');
const ParserLog = require('./ParserLog');
const PromoCode = require('./PromoCode');

// Определение связей между моделями

// User связи
User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });
User.hasMany(Cart, { foreignKey: 'user_id', as: 'cart' });
User.hasMany(Favorite, { foreignKey: 'user_id', as: 'favorites' });
User.hasMany(Review, { foreignKey: 'user_id', as: 'reviews' });

// Category связи
Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });

// Product связи
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
Product.hasMany(ProductImage, { foreignKey: 'product_id', as: 'images' });
Product.hasMany(ProductAttribute, { foreignKey: 'product_id', as: 'attributes' });
Product.hasMany(OrderItem, { foreignKey: 'product_id', as: 'orderItems' });
Product.hasMany(Cart, { foreignKey: 'product_id', as: 'cartItems' });
Product.hasMany(Favorite, { foreignKey: 'product_id', as: 'favorites' });
Product.hasMany(Review, { foreignKey: 'product_id', as: 'reviews' });

// Order связи
Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });

// OrderItem связи
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// Cart связи
Cart.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Cart.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// Favorite связи
Favorite.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Favorite.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// Review связи
Review.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
Review.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// ProductImage связи
ProductImage.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// ProductAttribute связи
ProductAttribute.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

module.exports = {
  User,
  Category,
  Product,
  ProductImage,
  ProductAttribute,
  Order,
  OrderItem,
  Cart,
  Favorite,
  Review,
  ParserLog,
  PromoCode
};

