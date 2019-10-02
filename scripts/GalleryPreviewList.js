'use strict';

/**
 * Список малых изображений.
 * @param {Object} config - настройки списка малых изображений (включают в себя настройки малого изображения).
 * @param {HTMLElement} context - родительский элемент, выполняющий роль контекста.
 * @returns {{activatePreview, getNextIndex, getPreview, getPreviewData, getPrevIndex, handleClick}}
 * @constructor
 */
var GalleryPreviewList = function (config, context) {
    /**
     * Помечает активным малое изображение. Предварительно снимает пометку активности с активного малого изображения.
     * Обновляет состояние кнопок прокрутки.
     * @param {number} index - индекс малого изображения, которое нужно пометить как активное.
     */
    this.activatePreview = function (index) {
        // TODO проверять возможность активации превью, когда находимся на границах и реализовать зацикливание
        // надо проверять возможна ли прокрутка еще в Gallery (надо посмотреть, в какой очередности происходят события
        // начиная с showImage)
        if (index !== this.currentIndex) {
            if (this.currentIndex >= 0) {
                this.getActivePreview().deactivate();
            }
            this.previews[index].activate();
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
                pos = pos > 0 ? 0 : pos;
                pos = pos < that.minLeft ? that.minLeft : pos;
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
     * - в них есть непустое свойство `next`
     * - в свойстве `next` есть непустое свойство `controls`
     * - в них есть непустое свойство `prev`
     * - в свойстве `prev` есть непустое свойство `selector`
     * @returns {boolean} - возвращает `true`, если настройки правильны, `false` - если нет.
     */
    this.controlsConfigCorrect = function () {
        return !!this.config.controls.next
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
            this.previews.push(new GalleryPreview(this.config.preview, items[i]));
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
    this.getActivePreview = function () {
        return this.previews[this.currentIndex];
    };

    /**
     * Вычисляет крайнее "левое" положение списка малых изображений.
     * @returns {number} - возвращает крайнее "левое" положение списка малых изображений.
     */
    this.getMinLeft = function () {
        if (this.minLeft === 0) {
            var totalWidth = this.list.scrollWidth;
            var visibleWidth = getOuterWidth(this.list);

            this.minLeft = -(totalWidth - visibleWidth);
        }

        return this.minLeft;
    };

    /**
     * Возвращает индекс следующего изображения. Дополнительно проверяется выход за границы.
     * @returns {number} - возвращает индекс следующего изображения.
     */
    this.getNextIndex = function () {
        var index = this.currentIndex + 1;
        return index > this.previews.length - 1 ? 0 : index;
    };

    /**
     * Возвращает объект малого изображения по его индексу или null, если отключено зацикливание и курсор дошел
     * до границы.
     * @param {number} index - индекс изображения.
     * @returns {GalleryPreview | null} - возвращает объект малого изображения по его индексу или null.
     */
    this.getPreview = function (index) {
        var looped = false;

        if (looped === false) {
            var maxIndex = this.previews.length - 1;
            var overflowRight = this.currentIndex === maxIndex && index === 0;
            var overflowLeft = this.currentIndex === 0 && index === maxIndex;
            if (overflowRight || overflowLeft) {
                return null;
            }
        }

        return this.previews[index];
    };

    /**
     * Возвращает данные малого изображения: его индекс и `url` основного изображения.
     * @param {EventTarget} preview - `HTML` элемент, для которого необходимо вернуть данные.
     * @returns {{src: string, index: number}} - возвращает данные малого изображения.
     */
    this.getPreviewData = function (preview) {
        if (closest(preview, this.config.preview.selector)) {
            var clickedPreview = closest(preview, this.config.preview.selector);

            for (var i = 0; i < this.previews.length; i++) {
                if (this.previews[i].getElement() === clickedPreview) {
                    return {
                        index: i,
                        src: this.previews[i].getImageSource()
                    };
                }
            }
        }

        return {
            index: -1,
            src: ''
        };
    };

    /**
     * Возвращает индекс предыдущего изображения. Дополнительно проверяется выход за границы.
     * @returns {number} - возвращает индекс предыдущего изображения.
     */
    this.getPrevIndex = function () {
        var index = this.currentIndex - 1;
        return index < 0 ? this.previews.length - 1 : index;
    };

    /**
     * Вычисляет величину, на которую можно прокрутить список малых изображений. Можно прокручивать на целое количество
     * видимых изображений.
     * @returns {number} - возвращает величину допустимой прокрутки.
     */
    this.getScrollBy = function () {
        if (this.scrollBy === 0) {
            var visibleItemsCount = Math.floor(this.previewsContainerWidth / this.previewWidth);
            this.scrollBy = visibleItemsCount * this.previewWidth;
        }

        return this.scrollBy;
    };

    /**
     * Обработчик щелчка по списку малых изображений.
     * @param {EventTarget} target - `HTML` элемент, по которому был произмеден щелчок мышью.
     */
    this.handleClick = function (target) {
        // щелкнули по кнопке `next`
        if (closest(target, '.js-' + this.config.controls.next.className)) {
            if (this.buttonEnabled(this.next)) {
                this.scrollNext();
            }
        }

        // щелкнули по кнопке `prev`
        if (closest(target, '.js-' + this.config.controls.prev.className)) {
            if (this.buttonEnabled(this.prev)) {
                this.scrollPrev();
            }
        }
    };

    /**
     * Обработчих изменения размеров окна. Корректирует положение списка и обновляет кнопки прокрутки.
     */
    this.handleResize = function () {
        var scrolledToEnd = parseInt(this.list.style.left || 0, 10) <= this.minLeft;

        this.previewsContainerWidth = this.previewsContainer.clientWidth;
        this.scrollBy = this.getScrollBy();
        this.minLeft = this.getMinLeft();

        if (scrolledToEnd) {
            this.list.style.left = this.minLeft + 'px';
        }

        this.updateControls();
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
        // TODO: доработать, пограничные случаи не работают (не прокручиваются)
        return this.currentIndex >= 0;
    };

    /**
     * Прокручивает список.
     * @param {number} position - координата, до которой необходимо прокрутить.
     */
    this.scroll = function (position) {
        if (this.animating === false) {
            this.animating = true;

            var minLeft = this.getMinLeft();

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
     * Активирует следующее малое изображение. Используется при навигации стрелками.
     */
    this.scrollNext = function () {
        var left = parseFloat(this.list.style.left || 0);
        left -= this.getScrollBy();
        this.scroll(left);
    };

    /**
     * Активирует предыдущее малое изображение. Используется при навигации стрелками.
     */
    this.scrollPrev = function () {
        var left = parseFloat(this.list.style.left || 0);
        left += this.getScrollBy();
        this.scroll(left);
    };

    /**
     * Прокручивает список так, чтобы активное малое изображение появилось в области видимости.
     */
    this.scrollToActive = function () {
        // TODO: при включенной опции зацикливания делать правильную промотку до конца или до начала (отдельные функции)
        var looped = false;
        var position;

        // if (looped)
        var listLeft = parseInt(this.list.style.left || 0, 10);
        var preview = this.getPreview(this.currentIndex).getElement();
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
            } else if (left === this.minLeft) {
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
        this.activatePreview(0);    // пометка первого малого изображения как активного

        this.previewWidth = 0;

        if (this.previews.length) {
            this.previewWidth = getOuterWidth(this.previews[0].getElement());
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
        getNextIndex: this.getNextIndex.bind(this),
        getPreview: this.getPreview.bind(this),
        getPreviewData: this.getPreviewData.bind(this),
        getPrevIndex: this.getPrevIndex.bind(this),
        handleClick: this.handleClick.bind(this)
    };
};
