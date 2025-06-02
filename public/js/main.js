document.addEventListener('DOMContentLoaded', function () {
  // Menú hamburguesa (vista móvil)
  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      navMenu.classList.toggle('show'); 
    });
  }

  // Dropdown de productos
  const toggleBtn = document.querySelector('.productos-toggle > a');
  const dropdown = document.querySelector('.products-dropdown');

  if (toggleBtn && dropdown) {
    toggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      dropdown.classList.toggle('active');
    });
  }
});
