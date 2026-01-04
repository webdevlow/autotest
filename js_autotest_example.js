// Автотест для проверки функциональности интернет-магазина
// Используется Jest (тестовый фреймворк) + Puppeteer (браузерная автоматизация)

const puppeteer = require('puppeteer');

describe('Тестирование интернет-магазина', () => {
    let browser;
    let page;

    // Запуск браузера перед всеми тестами
    beforeAll(async () => {
        browser = await puppeteer.launch({
            headless: false, // Показывать браузер (true - скрытый режим)
            slowMo: 50 // Замедление для наглядности
        });
        page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 720 });
    });

    // Закрытие браузера после всех тестов
    afterAll(async () => {
        await browser.close();
    });

    // Тест 1: Проверка загрузки главной страницы
    test('Главная страница загружается корректно', async () => {
        await page.goto('https://example-shop.com', { 
            waitUntil: 'networkidle0' 
        });

        // Проверяем наличие заголовка
        const title = await page.title();
        expect(title).toContain('Интернет-магазин');

        // Проверяем наличие логотипа
        const logo = await page.$('.logo');
        expect(logo).not.toBeNull();
    }, 15000);

    // Тест 2: Поиск товара
    test('Поиск товара работает корректно', async () => {
        await page.goto('https://example-shop.com');

        // Вводим текст в поле поиска
        await page.type('#search-input', 'iPhone 15');
        
        // Нажимаем кнопку поиска
        await page.click('#search-button');
        
        // Ждём загрузки результатов
        await page.waitForSelector('.product-card', { timeout: 5000 });

        // Проверяем, что результаты появились
        const products = await page.$$('.product-card');
        expect(products.length).toBeGreaterThan(0);

        // Проверяем, что в результатах есть искомый текст
        const productText = await page.$eval('.product-card h3', el => el.textContent);
        expect(productText.toLowerCase()).toContain('iphone');
    }, 15000);

    // Тест 3: Добавление товара в корзину
    test('Добавление товара в корзину', async () => {
        await page.goto('https://example-shop.com/product/123');

        // Получаем начальное количество товаров в корзине
        const cartCountBefore = await page.$eval('#cart-count', el => 
            parseInt(el.textContent) || 0
        );

        // Нажимаем кнопку "Добавить в корзину"
        await page.click('#add-to-cart');

        // Ждём обновления счётчика корзины
        await page.waitForTimeout(1000);

        // Проверяем, что количество увеличилось
        const cartCountAfter = await page.$eval('#cart-count', el => 
            parseInt(el.textContent)
        );
        expect(cartCountAfter).toBe(cartCountBefore + 1);

        // Проверяем появление уведомления
        const notification = await page.$('.notification-success');
        expect(notification).not.toBeNull();
    }, 15000);

    // Тест 4: Проверка формы регистрации
    test('Валидация формы регистрации', async () => {
        await page.goto('https://example-shop.com/register');

        // Пытаемся отправить пустую форму
        await page.click('#register-button');

        // Проверяем появление ошибок валидации
        const emailError = await page.$('#email-error');
        expect(emailError).not.toBeNull();

        const errorText = await page.$eval('#email-error', el => el.textContent);
        expect(errorText).toContain('обязательно');

        // Заполняем форму корректными данными
        await page.type('#email', 'test@example.com');
        await page.type('#password', 'SecurePass123!');
        await page.type('#password-confirm', 'SecurePass123!');

        // Отправляем форму
        await page.click('#register-button');

        // Ждём редиректа или сообщения об успехе
        await page.waitForNavigation({ timeout: 5000 }).catch(() => {});

        // Проверяем успешную регистрацию
        const currentUrl = page.url();
        expect(currentUrl).toContain('success');
    }, 20000);

    // Тест 5: Проверка адаптивности (мобильная версия)
    test('Мобильная версия отображается корректно', async () => {
        // Эмулируем мобильное устройство
        await page.setViewport({ width: 375, height: 667 });
        await page.goto('https://example-shop.com');

        // Проверяем, что мобильное меню видимо
        const mobileMenu = await page.$('#mobile-menu');
        const isVisible = await mobileMenu.isIntersectingViewport();
        expect(isVisible).toBe(true);

        // Проверяем, что десктопное меню скрыто
        const desktopMenu = await page.$('#desktop-menu');
        const isDesktopVisible = await desktopMenu.isIntersectingViewport();
        expect(isDesktopVisible).toBe(false);
    }, 15000);
});


// ============================================
// АЛЬТЕРНАТИВНЫЙ ВАРИАНТ: API-тестирование
// ============================================

const axios = require('axios');

describe('API тестирование', () => {
    const API_URL = 'https://api.example-shop.com';

    // Тест: Получение списка товаров
    test('GET /products возвращает список товаров', async () => {
        const response = await axios.get(`${API_URL}/products`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.data)).toBe(true);
        expect(response.data.length).toBeGreaterThan(0);

        // Проверяем структуру первого товара
        const product = response.data[0];
        expect(product).toHaveProperty('id');
        expect(product).toHaveProperty('name');
        expect(product).toHaveProperty('price');
    });

    // Тест: Создание нового заказа
    test('POST /orders создаёт новый заказ', async () => {
        const orderData = {
            userId: 1,
            products: [
                { id: 10, quantity: 2 },
                { id: 15, quantity: 1 }
            ],
            totalAmount: 5000
        };

        const response = await axios.post(`${API_URL}/orders`, orderData);

        expect(response.status).toBe(201);
        expect(response.data).toHaveProperty('orderId');
        expect(response.data).toHaveProperty('status');
        expect(response.data.status).toBe('pending');
    });

    // Тест: Проверка ошибки при невалидных данных
    test('POST /orders возвращает ошибку при невалидных данных', async () => {
        const invalidData = {
            userId: null,
            products: []
        };

        try {
            await axios.post(`${API_URL}/orders`, invalidData);
        } catch (error) {
            expect(error.response.status).toBe(400);
            expect(error.response.data).toHaveProperty('error');
        }
    });
});
