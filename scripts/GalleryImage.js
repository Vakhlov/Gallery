'use strict';

/**
 * Основное изображение. Загруженные и показанные изображения не загружаются повторно, используется кеш браузера.
 * @param {Object} config - настройки изображения (включают в себя настройки спиннера).
 * @param {HTMLElement} context - родительский элемент, выполняющий роль контекста.
 * @returns {{switch}} - возвращает `API` (метод переключения изображения).
 * @constructor
 */
var GalleryImage = function (config, context) {
    /**
     * Проверяет правильность настроек. Настройки правильны, если:
     * - они есть
     * - в них есть непустое свойство `className`
     * - в них есть непустое свойство `loadingVeil`
     * @returns {boolean} - возвращает `true`, если настройки правильны, `false` - если нет.
     */
    this.configCorrect = function () {
        return !!this.config && !!this.config.className && !!this.config.loadingVeil;
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
            this.img.src = this.switchingFrom.getImageSource();
            this.switchingFrom = null;
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
            this.config.callbacks.onLoad(this.switchingTo);
            this.switchingFrom = null;
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
     * Обновляет основное изображение, загружая новое изображение. Сохраняет объект малого изображения, на которое
     * осуществляется переход, для последующего использования в обработчике успешной загрузки основного изображения.
     * @param {GalleryPreview} currentPreview - объект текущего малого изображения, с которого осуществляется
     * переключение.
     * @param {GalleryPreview} nextPreview - объект малого изображения, на которое осуществляется переключение.
     */
    this.switch = function (currentPreview, nextPreview) {
        if (this.element) {
            this.switchingFrom = currentPreview;
            this.switchingTo = nextPreview;
            this.loading(true);
            this.img.src = nextPreview.getImageSource();
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
            this.switchingFrom = null;
        }
    }

    return {
        switch: this.switch.bind(this)
    };
};
