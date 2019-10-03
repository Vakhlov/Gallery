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
    this.handleError = function (error) {
        this.loading(false);

        if (this.config.callbacks.onError) {
            this.config.callbacks.onError(error);
        }
    }

    /**
     * Создает функцию-обработчик загрузки изображения. Созданная функция переключает изображение, скрывает спиннер и
     * помещает `url` загруженного изображения в кеш.
     * @param {string} src - `url` загруженного изображения.
     * @param {Function} callback - функция обратного вызова.
     * @returns {Function} - возвращает функцию-обработчик загрузки изображения.
     */
    this.handleLoad = function () {
        this.loading(false);

        if (this.config.callbacks.onLoad && this.switchingTo) {
            this.config.callbacks.onLoad(this.switchingTo.index);
            this.cache.push(this.switchingTo.src);
            this.switchingTo = null;
        }
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
     */
    this.switch = function (preview) {
        this.img.setAttribute('src', preview.src);
        this.loading(false);

        if (this.config.callbacks.onLoad) {
            this.config.callbacks.onLoad(preview.index);
        }
    }

    /**
     * Обновляет основное изображение, загружая новое изображение. После успешной загрузки вызывается функция
     * обратного вызова. Если изображение уже было показано ранее, оно не загружается повторно и спиннер
     * не используется. Вместо этого используется кеш браузера.
     * @param {string} src - `url` нового изображения.
     */
    this.update = function (preview) {
        if (this.element) {
            this.switchingTo = preview;
            if (this.isLoaded(preview.src)) {
                this.switch(preview);
            } else {
                this.loading(true);
                this.img.src = preview.src;
            }
        }
    }

    this.cache = [];
    this.config = config;

    if (this.configCorrect() && context) {
        this.element = context.querySelector('.' + this.config.className);

        if (this.element) {
            this.loadingVeil = new LoadingVeil(this.config.loadingVeil, this.element);

            this.img = this.element.querySelector('img');
            this.img.onload = this.handleLoad.bind(this);
            this.img.onerror = this.handleError.bind(this);
            this.cache.push(this.img.getAttribute('src'));
            this.switchingTo = null;
        }
    }

    return {
        update: this.update.bind(this)
    };
};
