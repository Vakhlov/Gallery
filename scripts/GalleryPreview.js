'use strict';

/**
 * Малое изображение.
 * @param {Object} config - настройки изображения.
 * @param {Element} context - родительский элемент, выполняющий роль контекста.
 * @param {number} index - собственный индекс малого изображения.
 * @returns {{activate, deactivate, getElement, getImageSource, getIndex, markWithError, unmarkWithError}} возвращает `API`.
 * @constructor
 */
var GalleryPreview = function (config, context, index) {
    /**
     * Помечает малое изображение как активное, добавляя `css`-класс.
     */
    this.activate = function () {
        addClass(this.element, this.config.activeClassName);
    };

    /**
     * Проверяет правильность настроек. Настройки правильны, если:
     * - они есть
     * - в них есть непустое свойство `activeClassName`
     * - в них есть непустое свойство `selector`
     * @returns {boolean} - возвращает `true`, если настройки правильны, `false` - если нет.
     */
    this.configCorrect = function () {
        return !!this.config && !!this.config.activeClassName && !!this.config.selector;
    };

    /**
     * Помечает малое изображение как неактивное, убирая `css`-класс.
     */
    this.deactivate = function () {
        removeClass(this.element, this.config.activeClassName);
    };

    /**
     * Помечает малое изображение маркером ошибки, добавляя `css`-класс.
     */
    this.markWithError = function () {
        addClass(this.element, this.config.errorClassName);
    };

    /**
     * Возвращает корневой элемент малого изображения.
     * @returns {HTMLElement} - возвращает корневой элемент малого изображения.
     */
    this.getElement = function () {
        return this.element;
    };

    /**
     * Возвращает `url` основного изображения, полученный изменением `url` малого изображения.
     * @returns {string} - возвращает `url` основного изображения.
     */
    this.getImageSource = function () {
        if (this.largeImageSource === '') {
            var src = this.image.getAttribute('src');
            this.largeImageSource = src.replace('120', '1024').replace('80', '680');
        }

        return this.largeImageSource;
    };

    /**
     * Возвращает собственный индекс изображения.
     * @returns {number} - возвращает собственный индекс изображения.
     */
    this.getIndex = function () {
        return this.index;
    };

    /**
     * Снимает пометку малого изображения маркером ошибки, убирая `css`-класс.
     */
    this.unmarkWithError = function () {
        removeClass(this.element, this.config.errorClassName);
    };

    this.config = config;

    if (this.configCorrect() && context) {
        this.config = config;
        this.element = context;
        this.image = this.element.querySelector('img');
        this.index = index;
        this.largeImageSource = '';
    }

    return {
        activate: this.activate.bind(this),
        deactivate: this.deactivate.bind(this),
        getElement: this.getElement.bind(this),
        getImageSource: this.getImageSource.bind(this),
        getIndex: this.getIndex.bind(this),
        markWithError: this.markWithError.bind(this),
        unmarkWithError: this.unmarkWithError.bind(this)
    };
};
