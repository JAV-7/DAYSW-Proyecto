const toggler = document.querySelector(".toggler-btn");
toggler.addEventListener("click", function () {
  document.querySelector("#sidebar").classList.toggle("collapsed");
});

function toggleFavorite(button) {
    const icon = button.querySelector('i');
    const isFavorited = button.getAttribute('data-favorited') === 'true';
  
    if (isFavorited) {
      icon.classList.remove('bi-heart-fill');
      icon.classList.add('bi-heart');
      button.setAttribute('data-favorited', 'false');
      alert('Removed from favorites!');
    } else {
      icon.classList.remove('bi-heart');
      icon.classList.add('bi-heart-fill');
      button.setAttribute('data-favorited', 'true');
      alert('Added to favorites!');
    }
  }
  
  