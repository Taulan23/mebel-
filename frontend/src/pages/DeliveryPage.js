import React from 'react';
import './DeliveryPage.css';

const DeliveryPage = () => {
  return (
    <div className="delivery-page">
      <div className="container">
        <h1>Доставка и оплата</h1>

        <div className="delivery-content">
          <section className="delivery-section">
            <h2>Способы доставки</h2>
            
            <div className="delivery-method">
              <div className="method-icon">🚚</div>
              <div className="method-info">
                <h3>Доставка курьером по Москве</h3>
                <p><strong>Стоимость:</strong> 500 ₽ (бесплатно при заказе от 10 000 ₽)</p>
                <p><strong>Срок:</strong> 1-2 рабочих дня</p>
                <p>Доставка осуществляется с 9:00 до 21:00. Возможна доставка в выходные дни.</p>
              </div>
            </div>

            <div className="delivery-method">
              <div className="method-icon">📦</div>
              <div className="method-info">
                <h3>Доставка по Московской области</h3>
                <p><strong>Стоимость:</strong> от 800 ₽ (зависит от удаленности)</p>
                <p><strong>Срок:</strong> 2-3 рабочих дня</p>
                <p>Рассчитывается индивидуально в зависимости от адреса доставки.</p>
              </div>
            </div>

            <div className="delivery-method">
              <div className="method-icon">🏪</div>
              <div className="method-info">
                <h3>Самовывоз из магазина</h3>
                <p><strong>Стоимость:</strong> Бесплатно</p>
                <p><strong>Срок:</strong> через 1 день после оформления заказа</p>
                <p>Адрес: г. Москва, ул. Примерная, д. 1. Режим работы: Пн-Вс 9:00-21:00</p>
              </div>
            </div>

            <div className="delivery-method">
              <div className="method-icon">🌍</div>
              <div className="method-info">
                <h3>Доставка по России</h3>
                <p><strong>Стоимость:</strong> от 1500 ₽</p>
                <p><strong>Срок:</strong> 5-14 рабочих дней</p>
                <p>Доставка транспортными компаниями в любой город России.</p>
              </div>
            </div>
          </section>

          <section className="delivery-section">
            <h2>Условия доставки</h2>
            <ul className="conditions-list">
              <li>✓ Подъем на этаж оплачивается отдельно (200 ₽ за этаж)</li>
              <li>✓ При доставке курьер позвонит за 30 минут до прибытия</li>
              <li>✓ Необходимо проверить товар при получении</li>
              <li>✓ Сборка мебели оплачивается отдельно (от 500 ₽)</li>
              <li>✓ Крупногабаритные товары могут требовать специального транспорта</li>
            </ul>
          </section>

          <section className="delivery-section">
            <h2>Способы оплаты</h2>
            
            <div className="payment-methods">
              <div className="payment-method">
                <div className="payment-icon">💵</div>
                <h3>Наличными</h3>
                <p>Оплата курьеру при получении</p>
              </div>

              <div className="payment-method">
                <div className="payment-icon">💳</div>
                <h3>Банковской картой</h3>
                <p>Оплата картой при получении или онлайн на сайте</p>
              </div>

              <div className="payment-method">
                <div className="payment-icon">🏦</div>
                <h3>Безналичный расчет</h3>
                <p>Для юридических лиц по счету</p>
              </div>

              <div className="payment-method">
                <div className="payment-icon">📱</div>
                <h3>Онлайн оплата</h3>
                <p>Оплата через СБП, Apple Pay, Google Pay</p>
              </div>
            </div>
          </section>

          <section className="delivery-section">
            <h2>Возврат и обмен</h2>
            <p>
              Вы можете вернуть товар надлежащего качества в течение 14 дней с момента покупки, 
              если он не был в употреблении, сохранены его товарный вид, потребительские свойства, 
              пломбы, ярлыки.
            </p>
            <p>
              Возврат денежных средств осуществляется в течение 10 рабочих дней после получения 
              товара на нашем складе.
            </p>
          </section>

          <section className="delivery-section highlight">
            <h2>Остались вопросы?</h2>
            <p>Свяжитесь с нами любым удобным способом:</p>
            <div className="contact-info">
              <div>📞 <strong>8 800 770 04 05</strong> (бесплатно по России)</div>
              <div>📧 <strong>info@mebel2025.ru</strong></div>
              <div>💬 <strong>Онлайн-чат</strong> на сайте</div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DeliveryPage;

