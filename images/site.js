const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('#menu');

menuButton?.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menuButton.textContent = isOpen ? 'Menu' : 'Fechar';
  menu?.classList.toggle('is-open', !isOpen);
});

menu?.addEventListener('click', (event) => {
  if (event.target.closest('a')) {
    menuButton?.setAttribute('aria-expanded', 'false');
    if (menuButton) menuButton.textContent = 'Menu';
    menu.classList.remove('is-open');
  }
});
