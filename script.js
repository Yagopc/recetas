// Variables globales
let recipes = JSON.parse(localStorage.getItem('recipes')) || [];
let currentRecipeIndex = null;
let receta_actual = 0;
let lastMenu = 'menu1';
let lastCategory = null; // Faltaba esta declaración
let searchResults = [];

// Ocultar todos los menús
function hideAllMenus() {
  const activeMenu = document.querySelector('.container:not(.hidden)');
  if (activeMenu) lastMenu = activeMenu.id;
  document.querySelectorAll('.container').forEach(menu => menu.classList.add('hidden'));
}

// Volver al último menú
function goBackToLastMenu() {
  if (lastMenu) {
    hideAllMenus();
    document.getElementById(lastMenu).classList.remove('hidden');
  } else {
    goBackToMenu1();
  }
}

// Mostrar menú principal
function goBackToMenu1() {
  hideAllMenus();
  document.getElementById('menu1').classList.remove('hidden');
}

// Mostrar menú de categorías
function showCategoryMenu() {
  hideAllMenus();
  document.querySelectorAll('#menu-categories input[type="checkbox"]').forEach(cb => cb.checked = false);
  document.getElementById('menu-categories').classList.remove('hidden');
}

// Mostrar menú de recetas guardadas
function showMenu2() {
  hideAllMenus();
  const recipeTitles = document.getElementById('recipe-titles');
  recipeTitles.innerHTML = '';

  recipes.sort((a, b) => a.title.localeCompare(b.title));

  recipes.forEach((recipe, index) => {
    const li = document.createElement('li');
    li.textContent = recipe.title;
    li.onclick = () => selectRecipe(index);
    recipeTitles.appendChild(li);
  });

  document.getElementById('menu2').classList.remove('hidden');
}

// Mostrar menú para agregar receta
function showNewRecipeMenu() {
  hideAllMenus();
  document.getElementById('menu-new-recipe').classList.remove('hidden');
}

// Seleccionar receta
function selectRecipe(index) {
  currentRecipeIndex = index;
  document.querySelectorAll('#recipe-titles li').forEach(item => item.classList.remove('selected'));
  document.querySelectorAll('#recipe-titles li')[index].classList.add('selected');
  document.getElementById('recipe-actions').classList.remove('hidden');
}

// Mostrar detalles de receta
function showRecipe() {
  const recipe = recipes[currentRecipeIndex];
  receta_actual = currentRecipeIndex;

  document.getElementById('recipe-title').textContent = recipe.title;
  document.getElementById('recipe-category').textContent = recipe.category;
  document.getElementById('recipe-ingredients').textContent = recipe.ingredients.join(', ');
  document.getElementById('recipe-instructions').textContent = recipe.instructions;

  const image = document.getElementById('recipe-image');
  if (recipe.image) {
    image.src = recipe.image;
    image.style.display = 'block';
  } else {
    image.style.display = 'none';
  }

  hideAllMenus();
  document.getElementById('menu21').classList.remove('hidden');
}

// Función reutilizable para mostrar listas de recetas
function displayRecipeList(recipeArray) {
  const recipeTitles = document.getElementById('recipe-titles');
  recipeTitles.innerHTML = '';

  recipeArray.forEach(recipe => {
    const li = document.createElement('li');
    li.textContent = recipe.title;
    li.onclick = () => {
      const globalIndex = recipes.findIndex(r => r.title === recipe.title);
      if (globalIndex !== -1) {
        currentRecipeIndex = globalIndex;
        showRecipe();
      } else {
        alert('Error: No se pudo encontrar la receta.');
      }
    };
    recipeTitles.appendChild(li);
  });

  document.getElementById('menu2').classList.remove('hidden');
}

// Mostrar recetas por categoría
function showCategoryRecipes(category) {
  hideAllMenus();
  lastCategory = category;
  const filteredRecipes = recipes.filter(r => r.category.toLowerCase() === category.toLowerCase());

  if (filteredRecipes.length === 0) {
    alert(`No hay recetas en la categoría "${category}".`);
    goBackToMenu1();
    return;
  }

  displayRecipeList(filteredRecipes);
}

// Volver al listado por categoría
function goBackToLastCategory() {
  if (lastCategory) {
    showCategoryRecipes(lastCategory);
  } else {
    goBackToMenu1();
  }
}

// Volver al listado general o por categoría
function goBackToMenu2() {
  lastCategory ? goBackToLastCategory() : showMenu2();
}

// Navegar recetas
function showprevRecipe() {
  if (recipes.length === 0) return alert('No hay recetas disponibles.');
  if (currentRecipeIndex > 0) {
    currentRecipeIndex--;
    showRecipe();
  } else {
    alert('No hay recetas anteriores.');
  }
}

function shownextRecipe() {
  if (recipes.length === 0) return alert('No hay recetas disponibles.');
  if (currentRecipeIndex < recipes.length - 1) {
    currentRecipeIndex++;
    showRecipe();
  } else {
    alert('No hay más recetas.');
  }
}

// Eliminar receta
function deleteRecipe() {
  recipes.splice(currentRecipeIndex, 1);
  saveToLocalStorage();
  showMenu2();
}

// Agregar receta nueva
function addNewRecipe() {
  const newRecipe = {
    title: document.getElementById('new-title').value.trim(),
    category: document.getElementById('new-category').value.trim(),
    ingredients: document.getElementById('new-ingredients').value.split(',').map(ing => ing.trim()),
    instructions: document.getElementById('new-instructions').value.trim(),
    image: document.getElementById('new-image').value.trim()
  };

  if (!newRecipe.title || !newRecipe.category || !newRecipe.instructions || newRecipe.ingredients.length === 0) {
    alert("Por favor, completa todos los campos obligatorios.");
    return;
  }

  recipes.push(newRecipe);
  saveToLocalStorage();
  goBackToMenu1();
}

// Editar receta
function editRecipe() {
  const recipe = recipes[currentRecipeIndex];
  document.getElementById('edit-title').value = recipe.title;
  document.getElementById('edit-category').value = recipe.category;
  document.getElementById('edit-ingredients').value = recipe.ingredients.join(', ');
  document.getElementById('edit-instructions').value = recipe.instructions;
  document.getElementById('edit-image').value = recipe.image;

  hideAllMenus();
  document.getElementById('menu22').classList.remove('hidden');
}

function saveEditedRecipe() {
  const recipe = recipes[currentRecipeIndex];
  recipe.title = document.getElementById('edit-title').value;
  recipe.category = document.getElementById('edit-category').value;
  recipe.ingredients = document.getElementById('edit-ingredients').value.split(',').map(ing => ing.trim());
  recipe.instructions = document.getElementById('edit-instructions').value;
  recipe.image = document.getElementById('edit-image').value;

  saveToLocalStorage();
  showMenu2();
}

// Buscar por término
function searchRecipe() {
  const searchTerm = prompt('Introduce el término de búsqueda:');
  if (!searchTerm) return;

  const results = recipes.filter((recipe, index, self) =>
    (recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     recipe.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
     recipe.ingredients.some(ing => ing.toLowerCase().includes(searchTerm.toLowerCase()))) &&
    index === self.findIndex(r => r.title === recipe.title)
  );

  if (results.length === 0) {
    alert('No se encontraron recetas.');
    return;
  }

  searchResults = results;
  displayRecipeList(searchResults);
}

function selectSearchResult(index) {
  const selectedRecipe = searchResults[index];
  const globalIndex = recipes.findIndex(r => r.title === selectedRecipe.title);
  if (globalIndex === -1) return alert('Error: No se encontró la receta.');
  currentRecipeIndex = globalIndex;
  showRecipe();
}

// Mostrar recetas por múltiples categorías
function getSelectedCategories() {
  return Array.from(document.querySelectorAll('#menu-categories input[type="checkbox"]:checked'))
              .map(cb => cb.value);
}

function showSelectedCategoryRecipes() {
  const selectedCategories = getSelectedCategories();
  if (selectedCategories.length === 0) {
    alert('Por favor, selecciona al menos una categoría.');
    return;
  }

  const filteredRecipes = recipes.filter(recipe =>
    selectedCategories.every(cat => recipe.category.toLowerCase().includes(cat.toLowerCase()))
  );

  if (filteredRecipes.length === 0) {
    alert(`No hay recetas que coincidan con todas las categorías seleccionadas.`);
    goBackToMenu1();
    return;
  }

  displayRecipeList(filteredRecipes);
}

// Guardar recetas
function saveToLocalStorage() {
  localStorage.setItem('recipes', JSON.stringify(recipes));
}

function saveToFile() {
  const blob = new Blob([JSON.stringify(recipes, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'recetas.json';
  a.click();
}

function loadFromFile() {
  document.getElementById('file-input').click();
}

function handleFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (!Array.isArray(data)) throw new Error('Debe contener un arreglo de recetas.');

      data.forEach((r, i) => {
        if (!r.title || !r.category || !Array.isArray(r.ingredients) || !r.instructions)
          throw new Error(`Estructura inválida en receta ${i + 1}`);
      });

      recipes = data;
      saveToLocalStorage();
      alert('Recetas cargadas correctamente.');
    } catch (err) {
      alert(`Error al leer el archivo: ${err.message}`);
    }
  };

  reader.readAsText(file);
}

// Guardar receta actual como HTML
function saveRecipeToHTML() {
  if (receta_actual == null) {
    alert("No hay una receta seleccionada.");
    return;
  }

  const recipe = recipes[receta_actual];
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>${recipe.title}</title>
    </head>
    <body>
      <h1>${recipe.title}</h1>
      <p><strong>Categoría:</strong> ${recipe.category}</p>
      <p><strong>Ingredientes:</strong> ${recipe.ingredients.join(', ')}</p>
      <p><strong>Elaboración:</strong> ${recipe.instructions}</p>
      ${recipe.image ? `<img src="${recipe.image}" alt="${recipe.title}" style="max-width:100%;">` : ''}
    </body>
    </html>
  `;

  const blob = new Blob([htmlContent], { type: 'text/html' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${recipe.title.replace(/ /g, '_')}.html`;
  a.click();
}

// Contador de recetas
function updateRecipeCount() {
  const element = document.getElementById("recipe-count");
  if (element) element.textContent = `Total de recetas: ${recipes.length}`;
}

// Swipe táctil para siguiente/anterior
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("menu21");
  let touchStartX = 0, touchStartY = 0, touchEndX = 0, touchEndY = 0;

  container.addEventListener("touchstart", e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  });

  container.addEventListener("touchend", e => {
    touchEndX = e.changedTouches[0].clientX;
    touchEndY = e.changedTouches[0].clientY;
    handleSwipe();
  });

  function handleSwipe() {
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    const threshold = 50;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > threshold) showprevRecipe();
      else if (deltaX < -threshold) shownextRecipe();
    }
  }

  updateRecipeCount();
});
    
