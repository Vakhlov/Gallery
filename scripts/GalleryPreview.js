'use strict';

/**
 * Малое изображение.
 * @param {Object} config - настройки изображения.
 * @param {Element} context - родительский элемент, выполняющий роль контекста.
 * @returns {{activate, deactivate, getElement, getImageSource}} возвращает `API`.
 * @constructor
 */
var GalleryPreview = function (config, context) {
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
        var src = this.image.getAttribute('src');
        return src.replace('120', '1024').replace('80', '680');
    };

    this.config = config;

    if (this.configCorrect() && context) {
        this.config = config;
        this.element = context;
        this.image = this.element.querySelector('img');
    }

    return {
        activate: this.activate.bind(this),
        deactivate: this.deactivate.bind(this),
        getElement: this.getElement.bind(this),
        getImageSource: this.getImageSource.bind(this)
    };
};
