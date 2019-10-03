'use strict';

var Gallery = function (config) {
    /**
     * Возвращает функцию обратного вызова, которая используется после обновления основного изображения и обновляет
     * счетчик и список малых изображений.
     * @param {number} index - индекс малого изображения, которое стало активным.
     * @returns {Function} - функция обратного вызова.
     */
    this.afterUpdate = function (index) {
        this.updateCounter(index);
        this.previewList.activatePreview(index);
    };

    /**
     * Проверяет правильность настроек. Настройки для `Gallery` правильны, если:
     * - они есть,
     * - в них есть непустое свойство `id`,
     * - в них есть непустое свойство `counter`,
     * - в свойстве `counter` есть непустое свойство `current`,
     * - в свойстве `current` свойства `counter` есть непустое свойство `selector`,
     * - в них есть непустое свойство `image`,
     * - в них есть непустое свойство `previewList`,
     * - в свойстве `previewList` есть непустое свойство `preview`,
     * - в свойстве `preview` свойства `previewList` них есть непустое свойство `selector`,
     * - в них есть непустое свойство `selector`.
     * Тем не менее, правильность настроек для `Gallery` не гарантирует правильность настроек для
     * аггрегируемых классов.
     * @returns {boolean} - возвращает `true`, если настройки правильны, `false` - если нет.
     */
    this.configCorrect = function () {
        return !!this.config.id
            && !!this.config.counter
            && !!this.config.counter.current
            && !!this.config.counter.current.selector
            && !!this.config.image
            && !!this.config.previewList
            && !!this.config.previewList.preview
            && !!this.config.previewList.preview.selector
            && !!this.config.previewList.selector;
    };

    /**
     * Обработчик щелчка.
     * @param {MouseEvent} event - событие `onClick`.
     */
    this.handleClick = function (event) {
        event.preventDefault();
        var target = event.target;

        if (closest(target, this.config.previewList.selector)) {
            this.previewList.handleClick(target);
            var preview = closest(target, this.config.previewList.preview.selector);

            if (preview) {
                this.showImage(preview);
            }
        }
    };

    /**
     * Обработчик нажатий клавиш.
     * @param {KeyboardEvent} event - событие `onKeyDown`.
     */
    this.handleKeyDown = function (event) {
        if (event.key) {
            if (event.key === 'ArrowLeft') {
                this.prev();
            }

            if (event.key === 'ArrowRight') {
                this.next();
            }
        } else if (event.keyCode) {
            if (event.keyCode === 37) {
                this.prev();
            }

            if (event.keyCode === 39) {
                this.next();
            }
        }
    };

    /**
     * В режиме отладки выводит в консоль браузера сообщение об ошибке загрузки изображения.
     * @param {Error} error - объект ошибки.
     */
    this.handleUpdateError = function (error) {
        if (this.debug) {
            console.log(error.message);
        }
    };

    /**
     * Показывает следующее изображение из списка малых изображений если это возможно.
     */
    this.next = function () {
        var index = this.previewList.getNextIndex();
        var preview = this.previewList.getPreview(index);

        if (preview) {
            this.showImage(preview.getElement());
        }
    };

    /**
     * Показывает предыдущее изображение из списка малых изображений если это возможно.
     */
    this.prev = function () {
        var index = this.previewList.getPrevIndex();
        var preview = this.previewList.getPreview(index);

        if (preview) {
            this.showImage(preview.getElement());
        }
    };

    /**
     * Обновдяет основное изображение.
     * @param {HTMLElement} preview - элемент малого изображения.
     */
    this.showImage = function (preview) {
        var previewData = this.previewList.getPreviewData(preview);

        if (previewData.index >= 0) {
            this.image.update(previewData);
        }
    };

    /**
     * Обновляет значение счетчика.
     * @param {number} index - индекс активного малого изображения.
     */
    this.updateCounter = function (index) {
        this.index.innerText = index + 1;
    };

    var defaultConfig = {
        counter: {
            current: {
                selector: '.js-gallery-current-index'
            }
        },
        image: {
            className: 'gallery__image',
            loadingVeil: {
                activeClassName: 'gallery__loading_active',
                className: 'gallery__loading'
            },
            callbacks: {
                onError: this.handleUpdateError.bind(this),
                onLoad: this.afterUpdate.bind(this)
            }
        },
        previewList: {
            containerSelector: '.js-gallery-preview-list-container',
            controls: {
                next: {
                    className: 'gallery__next'
                },
                prev: {
                    className: 'gallery__prev'
                }
            },
            preview: {
                activeClassName: 'active',
                selector: 'li'
            },
            selector: '.js-gallery-preview-list'
        }
    };

    this.config = extend(defaultConfig, config || {});

    if (this.configCorrect()) {
        this.element = document.querySelector('#' + this.config.id);
        this.index = this.element.querySelector(this.config.counter.current.selector);
        this.image = new GalleryImage(this.config.image, this.element);
        this.previewList = new GalleryPreviewList(this.config.previewList, this.element);

        this.debug = false;

        this.element.addEventListener('click', this.handleClick.bind(this));
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    return {};
};
