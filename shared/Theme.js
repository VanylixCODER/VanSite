// Theme.js

document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('theme-toggle');
    const footerIcon = document.querySelector('.footer-icon');

    // Получаем текущую тему из localStorage или используем 'light' по умолчанию
    let currentTheme = localStorage.getItem('theme') || 'light';

    // Устанавливаем начальную тему
    document.body.classList.add(currentTheme);

    // Меняем изображение CodePen в зависимости от текущей темы, если элемент существует
    if (footerIcon) {
        footerIcon.src = currentTheme === 'light' ? '../shared/Codepen-light.png' : '../shared/Codepen-dark.png';
    }

    // Устанавливаем текст кнопки в зависимости от текущей темы
    themeToggle.textContent = currentTheme === 'light' ? '☀' : '🌙';

    // Добавляем обработчик клика для кнопки смены темы
    themeToggle.addEventListener('click', function() {
        // Переключаем тему
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.body.classList.replace(currentTheme === 'light' ? 'dark' : 'light', currentTheme); // Меняем класс
        localStorage.setItem('theme', currentTheme); // Сохраняем новую тему в localStorage

        // Меняем изображение CodePen в зависимости от новой темы, если элемент существует
        if (footerIcon) {
            footerIcon.src = currentTheme === 'light' ? '../shared/Codepen-light.png' : '../shared/Codepen-dark.png';
        }

        // Устанавливаем текст кнопки в зависимости от новой темы
        themeToggle.textContent = currentTheme === 'light' ? '☀' : '🌙';
    });
});
