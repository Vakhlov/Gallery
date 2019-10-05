'use strict';

var Gallery = function (config) {
    /**
     * Функция обратного вызова, которая используется после обновления основного изображения и обновляет счетчик и
     * список малых изображений.
     * @param {GalleryPreview} preview - малое изображение, которое стало активным.
     */
    this.afterUpdate = function (preview) {
        this.updateCounter(preview.getIndex());
        this.previewList.activatePreview(preview);
        this.switchingTo = null;
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
     * - в свойстве `preview` свойства `previewList` есть непустое свойство `selector`,
     * - в свойстве `previewList` есть непустое свойство `selector`.
     * Тем не менее, правильность настроек для `Gallery` не гарантирует правильность настроек для
     * аггрегируемых классов.
     * @returns {boolean} - возвращает `true`, если настройки правильны, `false` - если нет.
     */
    this.configCorrect = function () {
        return !!this.config
            && !!this.config.id
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
        var preview = this.previewList.handleClick(target);

        this.showImage(preview);
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
     * Обработчик ошибки переключения основного изображения. Вызывает обработчик ошибки переключения в списке малых
     * изображений. В режиме отладки выводит в консоль браузера сообщение об ошибке загрузки изображения.
     * @param {Error} error - объект ошибки.
     */
    this.handleUpdateError = function (error) {
        if (this.debug) {
            console.log(error.message);
        }

        if (this.switchingTo !== null) {
            this.previewList.handleError(this.switchingTo);
            this.switchingTo = null;
        }
    };

    /**
     * Показывает следующее изображение из списка малых изображений если это возможно.
     */
    this.next = function () {
        var preview = this.previewList.getNextPreview();
        this.showImage(preview);
    };

    /**
     * Показывает предыдущее изображение из списка малых изображений если это возможно.
     */
    this.prev = function () {
        var preview = this.previewList.getPreviousPreview();
        this.showImage(preview)
    };

    /**
     * Обновдяет основное изображение.
     * @param {GalleryPreview | null} preview - элемент малого изображения.
     */
    this.showImage = function (preview) {
        if (preview) {
            var current = this.previewList.getCurrentPreview();
            this.image.switch(current, preview);
            this.switchingTo = preview;
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
                errorClassName: 'error',
                selector: 'li'
            },
            selector: '.js-gallery-preview-list'
        }
    };

    var configExtension = {
        image: {
            callbacks: {
                onError: this.handleUpdateError.bind(this),
                onLoad: this.afterUpdate.bind(this)
            }
        }
    };

    this.config = extend(defaultConfig, config || {}, configExtension);

    if (this.configCorrect()) {
        this.element = document.querySelector('#' + this.config.id);
        this.index = this.element.querySelector(this.config.counter.current.selector);
        this.image = new GalleryImage(this.config.image, this.element);
        this.previewList = new GalleryPreviewList(this.config.previewList, this.element);
        this.switchingTo = null;

        this.debug = false;

        this.element.addEventListener('click', this.handleClick.bind(this));
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
    } else {
        if (this.debug) {
            console.error('Ошибка в конфигурации `Gallery`');
        }
    }

    return {};
};
