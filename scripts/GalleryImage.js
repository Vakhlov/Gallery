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
     * Функция-обработчик ошибки загрузки изображения. Вызывает функцию обратного вызова, если она есть и удаляет данные
     * малого изображения, на которое должен был быть осуществлен переход.
     * @param {Error} error - объект ошибки.
     */
    this.handleError = function (error) {
        this.loading(false);

        if (this.config.callbacks.onError) {
            this.config.callbacks.onError(error);
            this.switchingTo = null;
        }
    };

    /**
     * Функция-обработчик загрузки изображения. Скрывает спиннер, вызывает функцию обратного вызова, если она есть и
     * удаляет данные малого изображения, на которое был осуществлен переход.
     */
    this.handleLoad = function () {
        this.loading(false);

        if (this.config.callbacks.onLoad && this.switchingTo) {
            this.config.callbacks.onLoad(this.switchingTo.index);
            this.switchingTo = null;
        }
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
     * Обновляет основное изображение, загружая новое изображение. Сохраняет данные малого изображения, на которое
     * осуществляется переход, для последующего использования в обработчике успешной загрузки основного изображения.
     * @param {{index: number, src: string}} preview - данные малого изображения: `url` нового изображения и индекс
     * малого изображения.
     */
    this.update = function (preview) {
        if (this.element) {
            this.switchingTo = preview;
            this.loading(true);
            this.img.src = preview.src;
        }
    };

    this.config = config;

    if (this.configCorrect() && context) {
        this.element = context.querySelector('.' + this.config.className);

        if (this.element) {
            this.loadingVeil = new LoadingVeil(this.config.loadingVeil, this.element);

            this.img = this.element.querySelector('img');
            this.img.onload = this.handleLoad.bind(this);
            this.img.onerror = this.handleError.bind(this);
            this.switchingTo = null;
        }
    }

    return {
        update: this.update.bind(this)
    };
};
