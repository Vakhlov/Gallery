'use strict';

/**
 * Основное изображение. Загруженные и показанные изображения не загружаются повторно, используется кеш браузера.
 * @param {Object} config - настройки изображения (включают в себя настройки спиннера).
 * @param {HTMLElement} context - родительский элемент, выполняющий роль контекста.
 * @returns {{update}} - возвращает `API` (метод обновления изображения).
 * @constructor
 */
var GalleryImage = function (config, context) {
    /**
     * Проверяет правильность настроек. Настройки правильны, если они есть и в них есть непустое свойство `className`.
     * @returns {boolean} - возвращает `true`, если настройки правильны, `false` - если нет.
     */
    this.configCorrect = function () {
        return !!this.config && !!this.config.className;
    };

    /**
     * Создает функцию-обработчик ошибки загрузки изображения.
     * @param {Function} callback - функция обратного вызова.
     * @returns {Function} - возвращает функцию-обработчик ошибки загрузки изображения.
     */
    this.handleError = function (callback) {
        // `IDE` генерирует предупреждение о потенциально неправильном `this`, поэтому `bind` не используется по месту
        // вызова `handleLoad`
        var that = this;
        return function (error) {
            that.loading(false);

            if (callback) {
                callback(error);
            }
        };
    };

    /**
     * Создает функцию-обработчик загрузки изображения. Созданная функция переключает изображение, скрывает спиннер и
     * помещает `url` загруженного изображения в кеш.
     * @param {string} src - `url` загруженного изображения.
     * @param {Function} callback - функция обратного вызова.
     * @returns {Function} - возвращает функцию-обработчик загрузки изображения.
     */
    this.handleLoad = function (src, callback) {
        // `IDE` генерирует предупреждение о потенциально неправильном `this`, поэтому `bind` не используется по месту
        // вызова `handleLoad`
        var that = this;
        return function () {
            that.loading(false);
            callback();
            that.cache.push(src);
        };
    };

    /**
     * Проверяет, было ли изображение загружено ранее.
     * @param {string} src - `url` изображения
     * @returns {boolean} - возвращает `true`, если изображение было загружено ранее, `false` - если не было.
     */
    this.isLoaded = function (src) {
        return this.cache.indexOf(src) >= 0;
    };

    /**
     * Показывает или скрывает спиннер.
     * @param {boolean} loading - флаг действия: если `true`, спиннер показывается, если `false` - скрывается.
     */
    this.loading = function (loading) {
        if (loading) {
            this.loadingVeil.show();
        } else {
            this.loadingVeil.hide();
        }
    };

    /**
     * Меняет `url` осноного изображения на указанный (переключает изображение) и вызывает функцию обратного вызова.
     * @param {string} src - новый `url` изображения.
     * @param {Function} callback - функция обратного вызова.
     */
    this.switch = function (src, callback) {
        this.img.setAttribute('src', src);
        this.loading(false);
        if (callback) {
            callback();
        }
    };

    /**
     * Обновляет основное изображение, загружая новое изображение. После успешной загрузки вызывается функция
     * обратного вызова. Если изображение уже было показано ранее, оно не загружается повторно и спиннер
     * не используется. Вместо этого используется кеш браузера.
     * @param {string} src - `url` нового изображения.
     * @param {Function} onSuccess - функция обратного вызова в случае успешной загрузки изображения.
     * @param {Function} onError - функция обратного вызова в случае ошибки загрузки изображения.
     */
    this.update = function (src, onSuccess, onError) {
        if (this.element) {
            if (this.isLoaded(src)) {
                this.switch(src, onSuccess);
            } else {
                this.loading(true);

                this.img.onload = this.handleLoad(src, onSuccess);
                this.img.onerror = this.handleError(onError);
                this.img.src = src;
            }
        }
    };

    this.cache = [];
    this.config = config;

    if (this.configCorrect() && context) {
        this.element = context.querySelector('.' + this.config.className);

        if (this.element) {
            this.loadingVeil = new LoadingVeil(this.config.loadingVeil, this.element);

            this.img = this.element.querySelector('img');
            this.cache.push(this.img.getAttribute('src'));
        }
    }

    return {
        update: this.update.bind(this)
    };
};
