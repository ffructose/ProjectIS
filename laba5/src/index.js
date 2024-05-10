function component(text) {
    const element = document.createElement('h1');
    element.textContent = text;
    return element;
}
document.body.prepend(component('Проєкт зібрано за допомогою Webpack'));