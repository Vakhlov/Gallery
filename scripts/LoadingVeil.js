'use strict';

/**
 * Спиннер. Показывается во время загрузки, скрывается после ее окончания.
 * @param {Object} config - настройки спиннера.
 * @param {HTMLElement} context - родительский элемент, выполняющий роль контекста.
 * @returns {{hide, show}} - возвращает `API` (методы скрытия и показа).
 * @constructor
 */
var LoadingVeil = function (config, context) {
    /**
     * Проверяет правильность настроек. Настройки правильны, если:
     * - они есть
     * - в них есть непустое свойство `className`
     * - в них есть непустое свойство `activeClassName`
     * @returns {boolean} - возвращает `true`, если настройки правильны, `false` - если нет.
     */
    this.configCorrect = function () {
        return !!this.config && !!this.config.className && !!this.config.activeClassName;
    };

    /**
     * Создает элемент, выполняющий функцию спиннера. Если такой элемент уже есть в верстке, возвращает его.
     * @returns {HTMLLIElement} - возвращает элемент спиннера.
     */
    this.createElement = function () {
        var element = this.context.querySelector(this.selector);

        if (element) {
            return element;
        }

        element = document.createElement('div');
        element.className = this.config.className + ' ' + this.selector.substr(1);
        return this.context.appendChild(element);
    };

    /**
     * Скрывает спиннер, удаляя `css`-класс.
     */
    this.hide = function () {
        removeClass(this.element, this.config.activeClassName);
    };

    /**
     * Показывает спиннер, добавляя `css`-класс.
     */
    this.show = function () {
        addClass(this.element, this.config.activeClassName);
    };

    this.config = config;

    if (this.configCorrect() && context) {
        this.context = context;
        this.selector = '.js-' + this.config.className;

        this.element = this.createElement();
    }

    return {
        hide: this.hide.bind(this),
        show: this.show.bind(this)
    };
};
