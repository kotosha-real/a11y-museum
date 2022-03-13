/**
 * Modal
 */
const modal = document.querySelector('#modal');
const modalOpenBtn = document.querySelector('#loginModalOpenBtn');
const modalCloseBtn = document.querySelector('#loginModalCloseBtn');

dialogPolyfill.registerDialog(modal);

const trap = focusTrap.createFocusTrap(modal, { escapeDeactivates: false });

modalOpenBtn.addEventListener('click', function () {
    document.body.classList.add('scroll-lock');
    modal.showModal();
    trap.activate();
});

modalCloseBtn.addEventListener('click', function () {
    modal.close();
});

modal.addEventListener('close', (event) => {
    trap.deactivate();
    document.body.classList.remove('scroll-lock');
});

/**
 * Tabs
 */
const direction = {
    'ArrowLeft': -1,
    'ArrowRight': 1,
    'ArrowUp': -1,
    'ArrowDown': 1,
};

const target = {
    'Home': 0,
    'End': -1,
}

const tabs = document.querySelectorAll('[role="tab"]');

const move = (tabs, selectedTabIndex) => {
    tabs.forEach((t, i) => {
        const selectedTab = selectedTabIndex === i;

        const tabPanelId = t.getAttribute('aria-controls');
        const tabPanel = document.getElementById(tabPanelId);

        t.setAttribute('aria-selected', selectedTabIndex === i ? 'true' : 'false');

        if (selectedTab) {
            t.removeAttribute('tabindex');

            if (tabPanel) {
                tabPanel.classList.remove('tab_hidden');
            }
        } else {
            t.setAttribute('tabindex', '-1');

            if (tabPanel) {
                tabPanel.classList.add('tab_hidden');
            }
        }

        if (selectedTab) {
            t.focus();
        }
    });
}

const moveToDirection = (tab, direction) => {
    const tabsInCurrentTabList = Array.from(tab.parentNode.querySelectorAll('[role="tab"]'));
    const currentTabIndex = tabsInCurrentTabList.findIndex((t) => t === tab);
    const nextIndex = currentTabIndex + direction;
    const normalizedNextIndex = nextIndex >= tabsInCurrentTabList.length ? 0 : nextIndex < 0 ? tabsInCurrentTabList.length - 1 : nextIndex;

    move(tabsInCurrentTabList, normalizedNextIndex);
};

const moveToTarget = (tab, target) => {
    const tabsInCurrentTabList = Array.from(tab.parentNode.querySelectorAll('[role="tab"]'));
    const nextIndex = target === -1 ? tabsInCurrentTabList.length - 1 : target === 0 ? 0 : tabsInCurrentTabList.findIndex((t) => t === tab);

    move(tabsInCurrentTabList, nextIndex);
};

tabs.forEach((tab) => {
    tab.addEventListener('click', (evt) => {
        moveToTarget(evt.target);
    });

    tab.addEventListener('keyup', (evt) => {
        evt.preventDefault();
        evt.stopPropagation();

        const key = evt.key;

        switch(key) {
            case 'ArrowLeft':
            case 'ArrowRight':
            case 'ArrowUp':
            case 'ArrowDown':
                moveToDirection(evt.target, direction[key]);
                break;
            case 'Home':
            case 'End':
                moveToTarget(evt.target, target[key]);
                break;
            default:
                break;
        }
    });
});

/**
 * Filter
 */
const formFilter = document.querySelector('#formFilter');
const exhibitionItems = document.querySelectorAll('#sectionExhibitionContent li');
const output = document.querySelector('#formFilterResultsCount');
const exhibitionNotFoundMessage = document.querySelector('#exhibitionNotFoundMessage');

const dates = {
    'all': [0, 1, 2],
    'today': [0, 1],
    'tomorrow': [3],
};

formFilter.addEventListener('change', function onChange(e) {
    const date = e.target.value;
    let count = 0;

    exhibitionItems.forEach((item, i) => {
        const hidden = !dates[date].includes(i);

        item.hidden = hidden;

        if (!hidden) {
            count++;
        }
    });

    output.textContent = count > 0 ? 'Найдено событий: ' + count : 'Событий не найдено';
    exhibitionNotFoundMessage.hidden = count > 0;
})

/**
 * Form validation
 */
Array.from(document.forms).forEach((form) => {
    if (form.dataset.customValidation === 'false') {
        return;
    }

    form.addEventListener('submit', (evt) => {
        const fields = Array.from(evt.target.querySelectorAll('input'));
        const alertBox = form.querySelector('.form__alert-box');
        const errors = [];

        fields.forEach((field) => {
            if (field.validity.valid) {
                return;
            }

            const fieldName = field.name || field.labels[0].textContent;
            let errorMessage = '';

            if (field.validity.valueMissing) {
                errorMessage = field.dataset.valueMissingError || `Поле ${fieldName} является обязательным`;
            } else if (field.validity.patternMismatch) {
                errorMessage = field.dataset.patternMismatchError || `Поле ${fieldName} должно соответствовать паттерну: ${field.pattern}`;
            } else if (field.validity.typeMismatch) {
                errorMessage = field.dataset.patternMismatchError || `Данные в поле ${fieldName} должны соответствовать типу: ${field.type}`;
            } else if (field.validity.tooShort) {
                errorMessage = field.dataset.tooShortError || `Поле ${fieldName} не может быть короче ${field.minLength} символов`;
            }

            if (errorMessage) {
                errors.push(errorMessage);
            }
        });

        if (errors.length) {
            evt.preventDefault();

            alertBox.innerHTML = `
<div class="form__alert" role="alert">
    <p>В форме ниже присутствуют ошибки: ${errors.length}</p>
    <ul>
        ${errors.map((error) => `<li>${error}</li>`).join('')}
    </ul>
</div>
`

            const firstInvalidField = fields.find(field => !field.validity.valid);

            if (firstInvalidField) {
                firstInvalidField.focus();
            }
        } else {
            form.innerHTML = `
<div class="form__alert form__alert_centered form__alert_borderless" role="alert">
    <p>Данные успешно отправлены</p>
</div>
`
        }
    });
});

/**
 * Iframe button
 */
const startOnlineTranslationBtn = document.querySelector('#startOnlineTranslationBtn');
const onlineTranslationIframe = document.querySelector('#onlineTranslationIframe');

startOnlineTranslationBtn.addEventListener('click', (evt) => {
    const data = { event: 'command', func: 'playVideo' };
    const message = JSON.stringify(data);

    onlineTranslationIframe.contentWindow.postMessage(message, '*');
    onlineTranslationIframe.setAttribute('tabindex', '0');
    onlineTranslationIframe.focus();

    evt.target.remove();
})

/**
 * Slider
 */
const slider = document.querySelector('#sectionCarouselSlider');
const controls = Array.from(slider.querySelectorAll('.slider__controls-btn'));
const slides = Array.from(slider.querySelectorAll('.slider__slide'));

controls.forEach((control) => {
   control.addEventListener('click', (evt) => {
        const direction = Number(evt.currentTarget.dataset.sliderControlDirection);
        const selectedSlideIndex = slides.findIndex((slide) => slide.classList.contains('slider__slide_active'));
        const nextIndex = selectedSlideIndex + direction;
        const normalizedNextIndex = nextIndex >= slides.length ? 0 : nextIndex < 0 ? slides.length - 1 : nextIndex;

        slides.forEach((slide) => slide.classList.remove('slider__slide_active'));
        slides[normalizedNextIndex].classList.add('slider__slide_active');
   });
});
