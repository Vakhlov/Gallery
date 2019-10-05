'use strict';

/**
 * Список малых изображений.
 * @param {Object} config - настройки списка малых изображений (включают в себя настройки малого изображения).
 * @param {HTMLElement} context - родительский элемент, выполняющий роль контекста.
 * @returns {{activatePreview, getCurrentPreview, getNextPreview, getPreviousPreview, handleClick, handleError}}
 * @constructor
 */
var GalleryPreviewList = function (config, context) {
    /**
     * Помечает активным малое изображение. Предварительно снимает пометку активности с активного малого изображения.
     * Обновляет состояние кнопок прокрутки.
     * @param {GalleryPreview} preview - объект малого изображения, которое нужно пометить как активное.
     */
    this.activatePreview = function (preview) {
        var index = preview.getIndex();

        if (index !== this.currentIndex) {
            if (this.currentIndex >= 0) {
                this.getCurrentPreview().deactivate();
            }
            preview.activate();
            this.currentIndex = index;

            this.updateControls();
            this.scrollToActive();
        }
    };

    /**
     * Анимирует прокрутку списка.
     * @param {number} left - новое положение списка малых изображений.
     * @param {number} duration - длительность анимации в милисекундах.
     * @param {Function} callback - фнункция обратного вызова.
     */
    this.animateScroll = function (left, duration, callback) {
        var style = getComputedStyle(this.list);
        this.list.style.left = style.left;

        var that = this;
        var start = +new Date();
        var from = parseFloat(this.list.style.left);
        var to = left;

        var tick = function () {
            var runningTime = +new Date() - start;
            var factor = that.easeInOutCubic(runningTime / duration);
            that.list.style.left = parseFloat((from + (to - from) * factor)) + 'px';

            if (runningTime < duration) {
                if (window.requestAnimationFrame) {
                    window.requestAnimationFrame(tick)
                } else {
                    setTimeout(tick, 16)
                }
            } else {
                var pos = parseInt(that.list.style.left);
                var minLeft = that.getMinLeft(false);
                pos = pos > 0 ? 0 : pos;
                pos = pos < minLeft ? minLeft : pos;
                that.list.style.left = pos + 'px';
                callback();
            }
        };

        tick();
    };

    /**
     * Проверяет активность кнопки прокрутки.
     * @param {HTMLElement} button - кнопка прокрутки.
     * @returns {boolean} - возвращает `true`, если кнопка прокрутки включена, `false` - если нет.
     */
    this.buttonEnabled = function (button) {
        return !hasClass(button, 'disabled');
    };

    /**
     * Проверяет правильность настроек. Настройки правильны, если:
     * - они есть
     * - в них есть непустое свойство `containerSelector`
     * - в них есть непустое свойство `controls`
     * - в них есть непустое свойство `preview`
     * - в них есть непустое свойство `selector`
     * @returns {boolean} - возвращает `true`, если настройки правильны, `false` - если нет.
     */
    this.configCorrect = function () {
        return !!this.config
            && !!this.config.containerSelector
            && !!this.config.controls
            && !!this.config.preview
            && !!this.config.selector;
    };

    /**
     * Проверяет правильность настроек кнопок прокрутки. Настройки правильны, если:
     * - они есть
     * - в них есть непустое свойство `next`
     * - в свойстве `next` есть непустое свойство `className`
     * - в них есть непустое свойство `prev`
     * - в свойстве `prev` есть непустое свойство `className`
     * @returns {boolean} - возвращает `true`, если настройки правильны, `false` - если нет.
     */
    this.controlsConfigCorrect = function () {
        return !!this.config.controls
            && !!this.config.controls.next
            && !!this.config.controls.next.className
            && !!this.config.controls.prev
            && !!this.config.controls.prev.className;
    };

    /**
     * Создает кнопку прокрутки списка малых изображений и добавляет ее в `DOM`.
     * @param {Object} config - настройка кнопки.
     * @returns {HTMLSpanElement} - возвращает `HTML`-элемент кнопки.
     */
    this.createButton = function (config) {
        var button = document.createElement('span');

        button.className = [
            config.className,
            'js-' + config.className
        ].join(' ');

        return this.element.appendChild(button);
    };

    /**
     * Создает кнопки прокрутки списка малых изображений.
     */
    this.createControls = function () {
        if (this.controlsConfigCorrect()) {
            this.next = this.createButton(this.config.controls.next);
            this.prev = this.createButton(this.config.controls.prev);
        }
    };

    /**
     * Создает объекты малых изображений.
     */
    this.createPreviews = function () {
        var items = this.list.children;

        for (var i = 0; i < items.length; i++) {
            this.previews.push(new GalleryPreview(this.config.preview, items[i], i));
        }
    };

    /**
     * Отключает кнопку прокрутки, добавляя `css`-класс.
     * @param {HTMLElement} button - кнопка прокрутки.
     */
    this.disableButton = function (button) {
        if (!hasClass(button, 'disabled')) {
            addClass(button, 'disabled');
        }
    };

    /**
     * Функция замедления.
     * @param {number} t - прошедшее от начала анимации время.
     * @returns {number} - возвращает множитель для расчета значения анимируемого свойства.
     */
    this.easeInOutCubic = function (t) {
        return t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    };

    /**
     * Включает кнопку прокрутки, убираяя `css`-класс.
     * @param {HTMLElement} button - кнопка прокрутки.
     */
    this.enableButton = function (button) {
        if (hasClass(button, 'disabled')) {
            removeClass(button, 'disabled');
        }
    };

    /**
     * Возвращает объект малого изображения, помеченного как активное.
     * @returns {GalleryPreview} - возвращает объект малого изображения.
     */
    this.getCurrentPreview = function () {
        return this.previews[this.currentIndex];
    };

    /**
     * Вычисляет крайнее "левое" положение списка малых изображений.
     * @param {boolean} recalculate - флаг необходимости пересчета значения.
     * @returns {number} - возвращает крайнее "левое" положение списка малых изображений.
     */
    this.getMinLeft = function (recalculate) {
        if (this.minLeft === 0 || recalculate) {
            var totalWidth = this.list.scrollWidth;
            var visibleWidth = getOuterWidth(this.list);

            this.minLeft = -(totalWidth - visibleWidth);
        }

        return this.minLeft;
    };

    /**
     * Возвращает следующее малое изображение. Дополнительно проверяется выход за границы.
     * @returns {GalleryPreview | null} - возвращает малое изображение или `null`, если произошел выход за границы
     * и зацикливание отключено.
     */
    this.getNextPreview = function () {
        var looped = false;
        var index = this.currentIndex + 1;

        if (index > this.previews.length - 1 && looped === false) {
            return null;
        }

        index = index > this.previews.length - 1 ? 0 : index;
        return this.previews[index];
    };

    /**
     * Находит объект малого изображения по `DOM` узлу и возвращает его или `null`, если поиск не успешен.
     * @param {HTMLElement} node - `DOM` узел, по которому надо найти объект малого изображения.
     * @returns {GalleryPreview | null} - возвращает найденный объект малого изображения или `null`.
     */
    this.getPreview = function (node) {
        var preview = null;

        if (node) {
            for (var i = 0; i < this.previews.length; i++) {
                if (this.previews[i].getElement() === node) {
                    preview = this.previews[i];
                    break;
                }
            }
        }

        return preview;
    };

    /**
     * Возвращает предыдущее малое изображение. Дополнительно проверяется выход за границы.
     * @returns {GalleryPreview | null} - возвращает малое изображение или `null`, если произошел выход за границы
     * и зацикливание отключено.
     */
    this.getPreviousPreview = function () {
        var looped = false;
        var index = this.currentIndex - 1;

        if (index < 0 && looped === false) {
            return null;
        }

        index = index < 0 ? this.previews.length - 1 : index;
        return this.previews[index];
    };

    /**
     * Вычисляет величину, на которую можно прокрутить список малых изображений. Можно прокручивать на целое количество
     * видимых изображений.
     * @param {boolean} recalculate - флаг необходимости пересчета значения.
     * @returns {number} - возвращает величину допустимой прокрутки.
     */
    this.getScrollBy = function (recalculate) {
        if (this.scrollBy === 0 || recalculate) {
            var visibleItemsCount = Math.floor(this.previewsContainerWidth / this.previewWidth);
            this.scrollBy = visibleItemsCount * this.previewWidth;
        }

        return this.scrollBy;
    };

    /**
     * Обработчик щелчка по списку малых изображений.
     * @param {EventTarget} target - `HTML` элемент, по которому был произмеден щелчок мышью.
     * @returns {GalleryPreview | null} - возвращает малое изображение или `null`, если щелчок произошел по
     * списку малых изображений, но не по малому изображению.
     */
    this.handleClick = function (target) {
        // делать много проверок с помощью `closest` - дорого
        // отсекаем лишние события и используем `return` во внутренних проверках
        if (closest(target, this.config.selector)) {
            // щелкнули по малому изображению
            var node = closest(target, this.config.preview.selector);

            if (node) {
                // нужно получить правильный объект превью и вызвать у него метод unmark...
                var preview = this.getPreview(node);

                if (preview) {
                    preview.unmarkWithError();
                }

                return preview;
            }

            // щелкнули по кнопке `next`
            if (closest(target, '.js-' + this.config.controls.next.className)) {
                if (this.buttonEnabled(this.next)) {
                    this.scrollNext();
                }

                return null;
            }

            // щелкнули по кнопке `prev`
            if (closest(target, '.js-' + this.config.controls.prev.className)) {
                if (this.buttonEnabled(this.prev)) {
                    this.scrollPrev();
                }

                return null;
            }
        }

        return null;
    };

    /**
     * Обработчик ошибки. Если после щелчка
     * @param {GalleryPreview} preview - объект малого изображения, при переключении на которое произошла ошибка.
     */
    this.handleError = function (preview) {
        if (preview) {
            preview.markWithError();
        }
    };

    /**
     * Обработчих изменения размеров окна. Корректирует положение списка и обновляет кнопки прокрутки.
     */
    this.handleResize = function () {
        this.getMinLeft(true);
        this.getScrollBy(true);
        this.updateControls();
        this.scrollToActive();
    };

    /**
     * Проверяет, доступно ли следующее малое изображение.
     * @returns {boolean} - возвращает `true`, если индекс текущего изобажения не больше максимального.
     */
    this.nextPreviewAvailable = function () {
        // TODO: доработать, пограничные случаи не работают (не прокручиваются)
        return this.currentIndex <= this.previews.length - 1;
    };

    /**
     * Проверяет, доступно ли предыдущее малое изображение.
     * @returns {boolean} - возвращает `true`, если индекс текущего изоборажения не меньше минимального.
     */
    this.previousPreviewAvailable = function () {
        return this.currentIndex >= 0;
    };

    /**
     * Прокручивает список.
     * @param {number} position - координата, до которой необходимо прокрутить.
     */
    this.scroll = function (position) {
        if (this.animating === false) {
            this.animating = true;

            var minLeft = this.getMinLeft(false);

            var left = position;
            left = left > 0 ? 0 : left;
            left = left < minLeft ? minLeft : left;

            this.animateScroll(left, 300, function () {
                this.animating = false;
                this.updateControls();
            }.bind(this));
        }
    };

    /**
     * Прокручивает список малых изображений влево на количество видимых малых изображений.
     */
    this.scrollNext = function () {
        var left = parseFloat(this.list.style.left || 0);
        left -= this.getScrollBy(false);
        this.scroll(left);
    };

    /**
     * Прокручивает список малых изображений вправо на количество видимых малых изображений.
     */
    this.scrollPrev = function () {
        var left = parseFloat(this.list.style.left || 0);
        left += this.getScrollBy(false);
        this.scroll(left);
    };

    /**
     * Прокручивает список так, чтобы активное малое изображение появилось в области видимости.
     */
    this.scrollToActive = function () {
        // TODO: при включенной опции зацикливания делать правильную промотку до конца или до начала (отдельные функции)
        // var looped = false;
        var position;

        // if (looped)
        var listLeft = parseInt(this.list.style.left || 0, 10);
        var preview = this.getCurrentPreview().getElement();
        var previewLeft = preview.offsetLeft;

        // overflowLeft - ширина, на которую малое изображение заходит за левую границу списка
        var overflowLeft = listLeft + previewLeft;

        // если overflowLeft стала меньше нуля - пора прокрутить вправо (scrollPrev)
        if (overflowLeft < 0 && this.previousPreviewAvailable()) {
            position = -(previewLeft - this.previewsContainerWidth + preview.offsetWidth);
            this.scroll(position);
            return undefined;
        }

        // overflowRight - ширина, на которую малое изображение заходит за правую границу списка
        var overflowRight = listLeft + previewLeft + this.previewWidth - this.previewsContainerWidth;

        // если overflowRight стала больше нуля - пора прокрутить влево (scrollNext)
        if (overflowRight > 0 && this.nextPreviewAvailable()) {
            this.scroll(-previewLeft);
            return undefined;
        }
    };

    /**
     * Обновляет состояние кнопок прокрутки, блокируя в крайних положениях списка соответствующие кнопки прокрутки и
     * разблокируя их в промежуточных положениях.
     */
    this.updateControls = function () {
        if (this.list.scrollWidth === getOuterWidth(this.list)) {
            this.disableButton(this.next);
            this.disableButton(this.prev);
        } else {
            var left = parseInt(this.list.style.left || 0, 10);

            if (left === 0) {
                this.disableButton(this.prev);
                this.enableButton(this.next);
            } else if (left === this.getMinLeft(false)) {
                this.disableButton(this.next);
                this.enableButton(this.prev);
            } else {
                this.enableButton(this.next);
                this.enableButton(this.prev);
            }
        }
    };

    this.config = config;

    if (this.configCorrect() && context) {
        this.element = context.querySelector(this.config.selector);

        this.list = this.element.querySelector('ul');

        this.animating = false; // признак запущенной анимации
        this.previewsContainer = context.querySelector(this.config.containerSelector);
        this.previewsContainerWidth = this.previewsContainer.clientWidth;
        this.previews = [];
        this.currentIndex = -1;

        this.createPreviews();  // создание объектов малых изображений
        this.createControls();  // создание кнопок прокрути

        this.previewWidth = 0;

        if (this.previews.length) {
            this.previewWidth = getOuterWidth(this.previews[0].getElement());
            this.activatePreview(this.previews[0]); // пометка первого малого изображения как активного
        }

        // На этапе инициализации значения этих свойств могу оказаться некорректными. Загрузка начального
        // содержимого может приводить к появлению полосы прокрутки. Эта функция может выполняться до окончания
        // загрузки содержимого и появления полосы прокрутки, поэтому величины scrollBy и minLeft могут включать
        // ширину полосы прокрутки, что приводит к неполной прокрутке и частичному сокрытию последнего превью.
        this.scrollBy = 0;
        this.minLeft = 0;

        window.addEventListener('resize', this.handleResize.bind(this));
    }

    return {
        activatePreview: this.activatePreview.bind(this),
        getCurrentPreview: this.getCurrentPreview.bind(this),
        getNextPreview: this.getNextPreview.bind(this),
        getPreviousPreview: this.getPreviousPreview.bind(this),
        handleClick: this.handleClick.bind(this),
        handleError: this.handleError.bind(this)
    };
};
