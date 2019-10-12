# Gallery

Простая галерея для показа иллюстраций к статьям на отдельных страницах.

Изначально это был проект для сайта [scalemodels.ru](https://scalemodels.ru): нужно было добавить навигацию с клавиатуры в галереи изображений к статьям. Позже проект был переделан с целью упорядочить знания по `JavaScript`.

## Использование

Разметка в `html`:

```html
<section class="gallery" id="gallery-1">
  <header class="gallery__heading">
    <div class="gallery__heading-title">
      Иллюстрации к статье <a href="http://example.com">Название статьи</a>
    </div>
    <div class="gallery__heading-text">
      <!-- используется `JavaScript`-хук (js-gallery-current-index) -->
      <span class="gallery__counter">
        Изображение <span class="js-gallery-current-index">1</span> из <span>29</span>.
      </span>
      <span class="gallery__tags">
        Теги: <span>галерея</span>, <span>превью</span>, <span>прокрутка</span>, <span>адаптивный</span>
      </span>
    </div>
  </header>
  <div class="gallery__image">
    <img src="https://picsum.photos/id/1/1024/680" alt="" />
  </div>
  <!-- используются `JavaScript`-хуки (js-gallery-preview-list и js-gallery-preview-list-container) -->
  <div class="gallery__previews js-gallery-preview-list">
    <div class="gallery__previews-container js-gallery-preview-list-container">
      <ul>
        <li>
          <a href="https://picsum.photos/id/1/1024/680">
            <img src="https://picsum.photos/id/1/120/80" alt="" width="120" height="80" />
          </a>
        </li>
        <li>
          <a href="https://picsum.photos/id/2/1024/680">
            <img src="https://picsum.photos/id/2/120/80" alt="" width="120" height="80" />
          </a>
        </li>
        <li>
          <a href="https://picsum.photos/id/3/1024/680">
            <img src="https://picsum.photos/id/3/120/80" alt="" width="120" height="80" />
          </a>
        </li>
      </ul>
    </div>
  </div>
</section>
```

Подключение скриптов:

```html
<script src="scripts/helpers.js"></script>
<script src="scripts/LoadingVeil.js"></script>
<script src="scripts/GalleryImage.js"></script>
<script src="scripts/GalleryPreview.js"></script>
<script src="scripts/GalleryPreviewList.js"></script>
<script src="scripts/Gallery.js"></script>
```

Запуск:

```html
<script>
  new Gallery({id: 'gallery-1'});
</script>
```

## Настройка

В конструктор `Gallery` передается объект настроек. Для простого использования подходит объект со свойством `id`, в котором содержится идентификатор галереи.

Полный объект настроек:

```javascript
{
  autoShow: true, // автопоказ следующего изображения
  autoShowInterval: 3000, // задержка, с которой показывается следующее изображения
  counter: { // настройки счетчика в шапке
    current: {
      selector: '.js-gallery-current-index' // используемый хук
    }
  },
  image: { // настройки основного изображения
    className: 'gallery__image',
    loadingVeil: { // настройки индикатора загрузки
      activeClassName: 'gallery__loading_active',
      className: 'gallery__loading'
    }
  },
  previewList: { // настройки списка малых изображений
    containerSelector: '.js-gallery-preview-list-container',
    controls: { // настройки кнопок списка малых изображений
      next: {
        className: 'gallery__next'
      },
      prev: {
        className: 'gallery__prev'
      }
    },
    looped: true, // зацикливание
    preview: { // настройки малого изображения
      activeClassName: 'active',
      errorClassName: 'error',
      selector: 'li'
    },
    selector: '.js-gallery-preview-list'
  }
}
```