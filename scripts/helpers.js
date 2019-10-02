/**
 * Добавляет `css`-класс `DOM`-узлу.
 * @param {HTMLElement} element - узел `DOM`, которому нужно добавить `css`-класс.
 * @param {string} className - имя класса, которое нужно добавить.
 * @returns {undefined} - возвращает `undefined`.
 */
var addClass = function (element, className) {
    if (element) {
        var classNames = element.className.split(' ').filter(function(item) {
            return item !== '';
        });

        if (classNames.indexOf(className) === -1) {
            classNames.push(className);
            element.className = classNames.join(' ');
        }
    }

    return undefined;
};

/**
 * Находит ближайщий элемент по селектору.
 * @param {EventTarget} element - элемент, для которого надо найти ближайший.
 * @param {string} selector - селектор.
 * @returns {HTMLElement | null} - возвращает найденный элемент или `null`.
 */
var closest = function (element, selector) {
    var body = document.body;
    var matchesFn = '';

    if (element instanceof HTMLElement) {
        if (body['matches'] && typeof body['matches'] === 'function') {
            matchesFn = 'matches';
        } else if (body['msMatchesSelector'] && typeof body['msMatchesSelector'] === 'function') {
            matchesFn = 'msMatchesSelector';
        }

        if (matchesFn) {
            if (element[matchesFn](selector)) {
                return element;
            }

            var parent = element.parentElement;

            while (parent) {
                if (parent[matchesFn](selector)) {
                    return parent;
                }

                parent = parent.parentElement;
            }
        }
    }

    return null;
};

/**
 * Возвращает новый объект, полностью копируя все собственные свойства объектов на всех уровнях вложенности.
 * Примечание: Если имена свойств повторяются, то результатом будет значение последнего переданного объекта.
 */
var extend = function () {
    var result = {};

    for (var i = 0; i < arguments.length; i++) {
        var obj = arguments[i];

        if (obj) {
            for (var key in obj) {
                if (has.call(obj, key)) {
                    var value = obj[key];

                    if (Array.isArray(value)) {
                        result[key] = value.slice();
                    } else if (typeof value === 'object') {
                        result[key] = extend(result[key], value);
                    } else {
                        result[key] = value;
                    }
                }
            }
        }
    }

    return result;
};

/**
 * Вычисляет ширину элемента с учетом `margin-left` и `margin-right`.
 * @param {HTMLElement} element - элемент, ширину которого нужно измерить.
 * @returns {number} - возвращает ширину элемента.
 */
var getOuterWidth = function (element) {
    var style = getComputedStyle(element);
    return parseInt(style['margin-left'], 10) + element.offsetWidth + parseInt(style['margin-right'], 10);
};

var has = Object.prototype.hasOwnProperty;

/**
 * Проверяет, назначен ли `css`-класс элементу.
 * @param {HTMLElement} element - элемент для проверки.
 * @param {string} className - название класса.
 * @returns {boolean} - возвращает `true`, если `css`-класс назначен элементу; `false` - в противном случае.
 */
var hasClass = function (element, className) {
    if (element) {
        return element.className.indexOf(className) >= 0;
    }

    return false;
};

/**
 * Убирает `css`-класс у `DOM`-узла.
 * @param {HTMLElement} element - узел `DOM`, у которого нужно убрать `css`-класс.
 * @param {String} className - имя класса, которое нужно убрать.
 * @returns {undefined} - возвращает `undefined`.
 */
var removeClass = function (element, className) {
    if (element) {
        var classNames = element.className.split(' ');
        var newClassNames = [];

        for (var i = 0; i < classNames.length; i++) {
            if (classNames[i] !== className) {
                newClassNames.push(classNames[i]);
            }
        }

        element.className = newClassNames.join(' ');
    }

    return undefined;
};
