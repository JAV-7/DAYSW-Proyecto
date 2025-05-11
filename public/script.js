// FRONTEND FUNCTIONALITY SCRIPTS
const API_URL = 'http://localhost:3000'; 

// Checking Authentication 
function checkAuth() {
  const token = localStorage.getItem('token'); // Checks token
  if (!token) {
    window.location.href = 'index.html'; // Redirect to login if no token
    return false;
  }
  return true;
}

// Nav bar toggler
document.addEventListener('DOMContentLoaded', function() {
  const toggler = document.querySelector(".toggler-btn");
  if (toggler) {
    toggler.addEventListener("click", function () {
      document.querySelector("#sidebar").classList.toggle("collapsed");
    });
  }
});

// Favorite button event
function toggleFavorite(button) {
  const isFavorited = button.getAttribute('data-favorited') === 'true';
  // Get pet ID - works for both card and detail page
  const petId = button.getAttribute('data-pet-id') || 
               button.closest('.card')?.getAttribute('data-pet-id');
  
  if (!petId) {
      console.error('Pet ID not found');
      return;
  }
  
  // Get the token from localStorage
  const token = localStorage.getItem('token');
  if (!token) {
      alert('You need to be logged in to manage favorites');
      return;
  }
  
  if (isFavorited) {
      // Remove from favorites
      fetch(`${API_URL}/api/favorites/${petId}`, {
          method: 'DELETE',
          headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
          }
      })
      .then(response => {
          if (response.ok) {
              button.setAttribute('data-favorited', 'false');
              // Update icon based on button location
              if (button.closest('.favorite-container')) {
                  button.innerHTML = '<i class="bi bi-heart"></i>';
              } else {
                  button.innerHTML = '<i class="bi bi-heart"></i>';
              }
              
              // If on favorites page, optionally remove the card
              if (window.location.pathname.includes('fav_picks.html')) {
                  const petCard = button.closest('.card');
                  if (petCard) petCard.remove();
                  
                  // Check if there are no more favorite pets
                  const petsContainer = document.querySelector('.row.gy-3');
                  if (petsContainer && petsContainer.children.length === 0) {
                      petsContainer.innerHTML = `
                          <div class="col-12 text-center">
                              <h3>You haven't favorited any pets yet</h3>
                              <p>Click the heart icon on pets to add them to your favorites</p>
                          </div>
                      `;
                  }
              }
          } else {
              console.error('Failed to remove from favorites');
          }
      })
      .catch(err => {
          console.error('Error removing favorite:', err);
      });
  } else {
      // Add to favorites
      fetch(`${API_URL}/api/favorites`, {
          method: 'POST',
          headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ petId })
      })
      .then(response => {
          if (response.ok) {
              button.setAttribute('data-favorited', 'true');
              // Update icon based on button location
              if (button.closest('.favorite-container')) {
                  button.innerHTML = '<i class="bi bi-heart-fill text-danger"></i>';
              } else {
                  button.innerHTML = '<i class="bi bi-heart-fill text-danger"></i>';
              }
          } else {
              console.error('Failed to add to favorites');
          }
      })
      .catch(err => {
          console.error('Error adding favorite:', err);
      });
  }
}

// Fetch and display favorite pets
async function fetchFavoritePets() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No authentication token found');
      window.location.href = 'index.html';
      return;
    }
    
    const response = await fetch(`${API_URL}/api/favorites`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) throw new Error(`Failed to fetch favorites: ${response.status}`);
    
    const pets = await response.json();
    console.log('Favorite Pets:', pets);
    
    displayFavoritePets(pets);
  } catch (error) {
    console.error('Error:', error);
    handleFavoriteError(error);
  }
}

// Special display function for favorites page
function displayFavoritePets(pets) {
  // Find the container for the pets
  // Note: In fav_picks.html, you might be missing a proper container with this class
  let petsContainer = document.querySelector('.row.gy-3');
  
  // If the container doesn't exist, create it
  if (!petsContainer) {
    console.log('Creating pets container because it was not found');
    // Find the main content area
    const mainContent = document.querySelector('main');
    if (mainContent) {
      // Create and append the container
      petsContainer = document.createElement('div');
      petsContainer.className = 'row gy-3';
      mainContent.appendChild(petsContainer);
    } else {
      console.error('Main content area not found');
      return;
    }
  }
  
  petsContainer.innerHTML = ''; // Clear existing pet cards
  
  if (!pets || pets.length === 0) {
    petsContainer.innerHTML = `
      <div class="col-12 text-center">
        <h3>You haven't favorited any pets yet</h3>
        <p>Click the heart icon on pets to add them to your favorites</p>
      </div>
    `;
    return;
  }
  
  pets.forEach(pet => {
    const petCard = `
      <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
        <div class="card border-light" data-pet-id="${pet._id}">
          <img src="${pet.image || 'https://via.placeholder.com/300'}" class="card-img-top" alt="${pet.name}">
          <div class="position-absolute top-0 start-0 p-2 text-white">
            <h4 class="card-title mb-0">${pet.name}</h4>
          </div>
          <div class="card-body">
            <h5 class="card-title">${pet.age}, ${pet.breed}</h5>
            <p class="card-text text-muted">${pet.place}</p>
            <button class="btn btn-sm btn-outline-primary favorite-btn" 
                    onclick="toggleFavorite(this)" 
                    data-pet-id="${pet._id}" 
                    data-favorited="true">
              <i class="bi bi-heart-fill text-danger"></i>
            </button>
            <a href="selected_pick.html?id=${pet._id}" class="stretched-link"></a>
          </div>
        </div>
      </div>
    `;
    petsContainer.insertAdjacentHTML('beforeend', petCard);
  });
}

// Error handler for favorites
function handleFavoriteError(error) {
  if (error.message.includes('401') || error.message.includes('403')) {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
  } else {
    const petsContainer = document.querySelector('.row.gy-3');
    if (petsContainer) {
      petsContainer.innerHTML = `
        <div class="col-12 text-center">
          <h3>Error loading favorites</h3>
          <p>Please try again later</p>
          <div class="text-danger">${error.message}</div>
        </div>
      `;
    }
  }
}

// Fetching Pets from backend
async function fetchPets() {
  try {
    const token = localStorage.getItem('token'); // requests token 
    const response = await fetch(`${API_URL}/api/pets`, {
      headers: {
        'Authorization': `Bearer ${token}` // gets token
      }
    });
    
    if (!response.ok) throw new Error(`Failed to fetch pets: ${response.status}`); // if token is not admin
    
    const pets = await response.json(); // else... await data and convert to json format
    console.log('Displayed Pets', pets); //debug
    
    // Display pets...
    displayPets(pets);
  } catch (error) {
    console.error('Error:', error);
    // Redirect to login if token is invalid
    if (error.message.includes('401') || error.message.includes('403')) {
      localStorage.removeItem('token');
      window.location.href = 'index.html';
    }
  }
}

// Display Pets on UI 
function displayPets(pets) {
  const petsContainer = document.querySelector('.row.gy-3');
  
  if (!petsContainer) {
    console.error('Pets container not found');
    return;
  }
  
  petsContainer.innerHTML = '';
  
  if (!pets || pets.length === 0) {
    petsContainer.innerHTML = '<div class="col-12 text-center"><h3>No pets available</h3></div>';
    return;
  }
  
  pets.forEach(pet => {
    const isFavorited = pet.isFavorited || false;
    const heartIcon = isFavorited ? 'bi-heart-fill text-danger' : 'bi-heart';
    
    const petCard = `
      <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
        <div class="card border-light" data-pet-id="${pet._id}">
          <img src="${pet.image || 'https://via.placeholder.com/300'}" class="card-img-top" alt="${pet.name}">
          <div class="position-absolute top-0 start-0 p-2 text-white">
            <h4 class="card-title mb-0">${pet.name}</h4>
          </div>
          <div class="card-body">
            <h5 class="card-title">${pet.age}, ${pet.breed}</h5>
            <p class="card-text text-muted">${pet.place}</p>
            <button class="btn btn-sm btn-outline-primary favorite-btn" 
                    onclick="toggleFavorite(this)" 
                    data-pet-id="${pet._id}" 
                    data-favorited="${isFavorited}">
              <i class="bi ${heartIcon}"></i>
            </button>
            <a href="selected_pick.html?id=${pet._id}" class="stretched-link"></a>
          </div>
        </div>
      </div>
    `;
    petsContainer.insertAdjacentHTML('beforeend', petCard);
  });
}

// Fetch and display single pet details
async function fetchAndDisplayPetDetails() {
  try {
      // Get pet ID from URL query parameter
      const urlParams = new URLSearchParams(window.location.search);
      const petId = urlParams.get('id');
      
      if (!petId) {
          throw new Error('No pet ID provided in URL');
      }

      const token = localStorage.getItem('token');
      if (!token) {
          window.location.href = 'index.html';
          return;
      }

      // Fetch pet details
      const response = await fetch(`${API_URL}/api/pets/${petId}`, {
          headers: {
              'Authorization': `Bearer ${token}`
          }
      });

      if (!response.ok) {
          throw new Error(`Failed to fetch pet: ${response.status}`);
      }

      const pet = await response.json();
      displayPetDetails(pet);
  } catch (error) {
      console.error('Error:', error);
      handlePetDetailsError(error);
  }
}

// Display pet details on the page
async function displayPetDetails(pet) {
  const container = document.getElementById('petDetailsContainer');
  if (!container) return;

  // Check if pet is favorited
  let isFavorited = false;
  try {
      const token = localStorage.getItem('token');
      if (token) {
          const response = await fetch(`${API_URL}/api/favorites`, {
              headers: {
                  'Authorization': `Bearer ${token}`
              }
          });
          
          if (response.ok) {
              const favorites = await response.json();
              isFavorited = favorites.some(fav => fav._id === pet._id);
          }
      }
  } catch (error) {
      console.error('Error checking favorite status:', error);
  }
  
  container.innerHTML = `
      <!-- Pet Image -->
      <div class="favorite-container me-4">
          <img class="align-self-center rounded" 
               src="${pet.image}" 
               alt="${pet.name}">
          <button class="favorite-btn" 
                  data-favorited="${isFavorited}" 
                  onclick="toggleFavorite(this)"
                  data-pet-id="${pet._id}">
              <i class="bi ${isFavorited ? 'bi-heart-fill text-danger' : 'bi-heart'}"></i>
          </button>
      </div>
        
      <!-- Pet Description -->
      <div class="media-body me-5">
          <h4 class="mt-0">${pet.name}</h4>
          <h1 class="mt-0 fw-bold">${pet.age} year old, ${pet.breed}</h1>
          <br>
          <p class="text-muted">${pet.description || 'No description available'}</p>
          <br>
          <div class="d-flex align-items-center mb-3">
              <i class="lni lni-location-arrow-right me-2"></i>
              <span>${pet.place}</span>
          </div>
          <a href="chat.html?petId=${pet._id}" class="btn btn-dark btn-lg btn-block w-100">
          Adopt!
          </a>
      </div>
  `;
}

// Error handling for pet details
function handlePetDetailsError(error) {
  const container = document.getElementById('petDetailsContainer');
  if (!container) return;

  if (error.message.includes('401') || error.message.includes('403')) {
      localStorage.removeItem('token');
      window.location.href = 'index.html';
  } else {
      container.innerHTML = `
          <div class="col-12 text-center">
              <h3>Error loading pet details</h3>
              <p>${error.message}</p>
              <a href="picks.html" class="btn btn-primary">Back to Pets</a>
          </div>
      `;
  }
}

// Call when html loads
document.addEventListener('DOMContentLoaded', function() {
  if (!checkAuth()) return;
  
  // Check which page we're on by looking at the URL path
  const currentPath = window.location.pathname;
  console.log('Current path:', currentPath);
  
  if (currentPath.endsWith('fav_picks.html') || currentPath.includes('/fav_picks')) {
    console.log('On favorites page, fetching favorite pets');
    fetchFavoritePets();
  } else if (currentPath.endsWith('picks.html') || currentPath.includes('/picks') || currentPath === '/' || currentPath === '') {
    console.log('On main picks page, fetching all pets');
    fetchPets();
  } else if (currentPath.endsWith('selected_pick.html') || currentPath.includes('/selected_pick')) {
    fetchAndDisplayPetDetails();
  }
  
  // Check if signup form exists before adding event listener
  const signupForm = document.getElementById("signupForm");
  if (signupForm) {
    signupForm.addEventListener("submit", function(e) {
      e.preventDefault();
      handleSignup(e);
    });
  }
});

// Only add signup event listener if the element exists
document.addEventListener('DOMContentLoaded', function() {
  const signupForm = document.getElementById("signupForm");
  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      // Get form values
      const name = document.getElementById("signupName").value.trim();
      const email = document.getElementById("signupEmail").value.trim();
      const password = document.getElementById("signupPassword").value;
      const confirmPassword = document.getElementById("confirmPassword").value;

      // Client-side validation
      if (!name || !email || !password || !confirmPassword) {
          alert("Please fill in all fields");
          return;
      }

      if (password !== confirmPassword) {
          alert("Passwords don't match!");
          return;
      }

      try {
          // Show loading state
          const submitBtn = e.target.querySelector('button[type="submit"]');
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Creating account...';

          const response = await fetch(`${API_URL}/api/users`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ name, email, password })
          });

          const data = await response.json();
          
          if (response.ok) {
              alert("Account created successfully! Please login.");
              document.getElementById("signupForm").reset();
              
              // Auto-open login modal after successful signup
              const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
              loginModal.show();
          } else {
              alert(data.error || "Signup failed. Please try again.");
          }
      } catch (error) {
          console.error("Signup error:", error);
          alert("Network error. Please check your connection.");
      } finally {
          // Reset button state
          const submitBtn = e.target.querySelector('button[type="submit"]');
          submitBtn.disabled = false;
          submitBtn.textContent = 'Sign Up';
      }
    });
  }
});