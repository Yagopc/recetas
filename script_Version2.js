// Variables globales
let recipes = [];
let currentRecipeIndex = null;
let receta_actual = 0;
let lastMenu = 'menu1';
let lastCategory = null;
let searchResults = [];
let currentMediaElement = null;

// Cargar recetas automáticamente desde URL al iniciar
async function fetchRecipesFromURL() {
  try {
    const response = await fetch('https://yagopc.github.io/recetas/recetas.json');
    if (!response.ok) throw new Error('No se pudo cargar el archivo de recetas.');
    const parsedData = await response.json();

    if (!Array.isArray(parsedData)) throw new Error('El archivo debe contener un arreglo de recetas.');

    // Validación flexible
    parsedData.forEach((recipe, index) => {
      // Validar título (obligatorio)
      if (!recipe.title || typeof recipe.title !== 'string' || recipe.title.trim() === '') {
        throw new Error(`Error en receta ${index + 1}: "title" es obligatorio.`);
      }

      // Hacer category opcional con valor por defecto
      if (!recipe.category || typeof recipe.category !== 'string') {
        recipe.category = "Sin categoría";
      }

      // Validar ingredients (puede ser array o string)
      if (!recipe.ingredients) {
        recipe.ingredients = [];
      } else if (typeof recipe.ingredients === 'string') {
        recipe.ingredients = recipe.ingredients.split('\n').filter(i => i.trim() !== '');
      } else if (!Array.isArray(recipe.ingredients)) {
        throw new Error(`Error en receta ${index + 1}: "ingredients" debe ser lista o texto.`);
      }

      // Validar instructions (puede estar vacío)
      if (typeof recipe.instructions !== 'string') {
        recipe.instructions = "";
      }

      // Validar image (puede estar vacío o ser URL/YouTube)
      if (recipe.image && typeof recipe.image !== 'string') {
        recipe.image = "";
      }
    });

    recipes = parsedData;
    saveToLocalStorage();
    updateRecipeCount();
    showMenu2();
  } catch (error) {
    alert(`Error al cargar recetas de la URL:\n${error.message}`);
    console.error("Error detallado:", error);
    // Si falla la carga remota, intentar cargar de localStorage
    recipes = JSON.parse(localStorage.getItem('recipes')) || [];
    updateRecipeCount();
  }
}

function hideAllMenus() {
  const activeMenu = document.querySelector('.container:not(.hidden)');
  if (activeMenu) {
    lastMenu = activeMenu.id;

    // Si estamos saliendo de la vista de receta, limpiar el video
    if (activeMenu.id === 'menu21') {
      const iframe = document.querySelector('#image-container iframe');
      if (iframe) {
        iframe.src = '';
      }
    }
  }

  // Detener y limpiar cualquier medio
  const mediaContainer = document.getElementById('media-container');
  if (mediaContainer) {
    const iframe = mediaContainer.querySelector('iframe');
    if (iframe) iframe.src = '';
    mediaContainer.innerHTML = '';
    currentMediaElement = null;
  }

  document.querySelectorAll('.container').forEach(menu => menu.classList.add('hidden'));
}

// Mostrar menú de categorías
function showCategoryMenu() {
  hideAllMenus();
  const checkboxes = document.querySelectorAll('#menu-categories input[type="checkbox"]');
  checkboxes.forEach(checkbox => checkbox.checked = false);
  document.getElementById('menu-categories').classList.remove('hidden');
}

// Mostrar menú principal
function goBackToMenu1() {
  hideAllMenus();
  document.getElementById('menu1').classList.remove('hidden');
}

// Mostrar menú de recetas
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

// Seleccionar receta
function selectRecipe(index) {
  currentRecipeIndex = index;
  const recipeItems = document.querySelectorAll('#recipe-titles li');
  recipeItems.forEach(item => item.classList.remove('selected'));
  recipeItems[index].classList.add('selected');
  document.getElementById('recipe-actions').classList.remove('hidden');
}

// Mostrar receta
function showRecipe() {
  const recipe = recipes[currentRecipeIndex];
  receta_actual = currentRecipeIndex;

  document.getElementById('recipe-title').textContent = recipe.title;
  document.getElementById('recipe-category').textContent = recipe.category;
  document.getElementById('recipe-ingredients').textContent = recipe.ingredients.join(', ');
  document.getElementById('recipe-instructions').textContent = recipe.instructions;

  const mediaContainer = document.getElementById('media-container');
  mediaContainer.innerHTML = '';

  if (recipe.image) {
    if (recipe.image.includes('youtube.com') || recipe.image.includes('youtu.be')) {
      const videoId = getYouTubeId(recipe.image);
      if (videoId) {
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.youtube.com/embed/${videoId}`;
        iframe.allowFullscreen = true;
        mediaContainer.appendChild(iframe);
        currentMediaElement = iframe;
      } else {
        const link = document.createElement('a');
        link.href = recipe.image;
        link.textContent = 'Ver video en YouTube';
        link.target = '_blank';
        mediaContainer.appendChild(link);
      }
    } else {
      const img = document.createElement('img');
      img.src = recipe.image;
      img.alt = recipe.title;
      mediaContainer.appendChild(img);
      currentMediaElement = img;
    }
  }

  hideAllMenus();
  document.getElementById('menu21').classList.remove('hidden');
}

// Función para extraer el ID de un video de YouTube
function getYouTubeId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

// Mostrar recetas filtradas por categoría
function showCategoryRecipes(category) {
  hideAllMenus();
  lastCategory = category;
  const recipeTitles = document.getElementById('recipe-titles');
  recipeTitles.innerHTML = '';

  const filteredRecipes = recipes.filter(recipe => recipe.category.toLowerCase() === category.toLowerCase());

  if (filteredRecipes.length === 0) {
    alert(`No hay recetas en la categoría "${category}".`);
    goBackToMenu1();
    return;
  }

  filteredRecipes.forEach((recipe) => {
    const li = document.createElement('li');
    li.textContent = recipe.title;
    li.onclick = () => {
      const globalIndex = recipes.findIndex(r => r.title === recipe.title);
      currentRecipeIndex = globalIndex;
      if (currentRecipeIndex !== -1) {
        showRecipe();
      } else {
        alert('Error: No se pudo encontrar la receta.');
      }
    };
    recipeTitles.appendChild(li);
  });

  document.getElementById('menu2').classList.remove('hidden');
}

// Volver al listado filtrado por categoría
function goBackToLastCategory() {
  if (lastCategory) {
    showCategoryRecipes(lastCategory);
  } else {
    goBackToMenu1();
  }
}

// Botón "Volver" desde el menú de detalles de receta
function goBackToMenu2() {
  if (lastCategory) {
    goBackToLastCategory();
  } else {
    showMenu2();
  }
}

// Mostrar la receta anterior
function showprevRecipe() {
  if (recipes.length === 0) {
    alert('No hay recetas disponibles.');
    return;
  }
  if (currentRecipeIndex > 0) {
    currentRecipeIndex--;
    showRecipe();
  } else {
    alert('No hay recetas anteriores.');
  }
}

// Mostrar la siguiente receta
function shownextRecipe() {
  if (recipes.length === 0) {
    alert('No hay recetas disponibles.');
    return;
  }
  if (currentRecipeIndex < recipes.length - 1) {
    currentRecipeIndex++;
    showRecipe();
  } else {
    alert('No hay más recetas.');
  }
}

// Eliminar una receta seleccionada
function deleteRecipe() {
  recipes.splice(currentRecipeIndex, 1);
  saveToLocalStorage();
  showMenu2();
}

// Guardar una nueva receta
function addNewRecipe() {
  const newRecipe = {
    title: document.getElementById('new-title').value,
    category: document.getElementById('new-category').value,
    ingredients: document.getElementById('new-ingredients').value.split(',').map(ing => ing.trim()),
    instructions: document.getElementById('new-instructions').value,
    image: document.getElementById('new-image').value
  };

  recipes.push(newRecipe);
  saveToLocalStorage();
  goBackToMenu1();
}

function showNewRecipeMenu() {
  hideAllMenus();
  document.getElementById('new-title').value = '';
  document.getElementById('new-category').value = '';
  document.getElementById('new-ingredients').value = '';
  document.getElementById('new-instructions').value = '';
  document.getElementById('new-image').value = '';
  document.getElementById('menu-new-recipe').classList.remove('hidden');
}

// Guardar receta editada
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

// Cargar la receta para editar
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

// Buscar recetas por título, categoría o ingredientes
function getSelectedCategories() {
  const checkboxes = document.querySelectorAll('#menu-categories input[type="checkbox"]:checked');
  const selectedCategories = Array.from(checkboxes).map(checkbox => checkbox.value);
  return selectedCategories;
}

function showSelectedCategoryRecipes() {
  const selectedCategories = getSelectedCategories();
  if (selectedCategories.length === 0) {
    alert('Por favor, selecciona al menos una categoría.');
    return;
  }

  hideAllMenus();
  const recipeTitles = document.getElementById('recipe-titles');
  recipeTitles.innerHTML = '';

  const filteredRecipes = recipes.filter(recipe =>
    selectedCategories.every(category =>
      recipe.category.toLowerCase().includes(category.toLowerCase())
    )
  );

  if (filteredRecipes.length === 0) {
    alert(`No hay recetas que coincidan con todas las categorías seleccionadas.`);
    goBackToMenu1();
    return;
  }

  filteredRecipes.forEach((recipe) => {
    const li = document.createElement('li');
    li.textContent = recipe.title;
    li.onclick = () => {
      const globalIndex = recipes.findIndex(r => r.title === recipe.title);
      currentRecipeIndex = globalIndex;
      if (currentRecipeIndex !== -1) {
        showRecipe();
      } else {
        alert('Error: No se pudo encontrar la receta.');
      }
    };
    recipeTitles.appendChild(li);
  });

  document.getElementById('menu2').classList.remove('hidden');
}

function searchRecipe() {
  const searchTerm = prompt('Introduce el término de búsqueda:');
  if (!searchTerm) return;

  const term = searchTerm.toLowerCase();
  const uniqueResults = new Set();

  recipes.forEach(recipe => {
    const matchInTitle = recipe.title.toLowerCase().includes(term);
    const matchInCategory = recipe.category.toLowerCase().includes(term);
    const matchInIngredients = recipe.ingredients.some(ing => ing.toLowerCase().includes(term));
    if (matchInTitle || matchInCategory || matchInIngredients) {
      uniqueResults.add(recipe);
    }
  });

  searchResults = Array.from(uniqueResults);

  if (searchResults.length === 0) {
    alert('No se encontraron recetas con ese término.');
    return;
  }

  hideAllMenus();
  const recipeTitles = document.getElementById('recipe-titles');
  recipeTitles.innerHTML = '';

  searchResults.forEach((recipe, index) => {
    const li = document.createElement('li');
    li.textContent = recipe.title;
    li.onclick = () => selectSearchResult(index);
    recipeTitles.appendChild(li);
  });

  document.getElementById('menu2').classList.remove('hidden');
}

// Seleccionar una receta desde los resultados de búsqueda
function selectSearchResult(index) {
  const selectedRecipe = searchResults[index];
  currentRecipeIndex = recipes.findIndex(recipe => recipe.title === selectedRecipe.title);
  if (currentRecipeIndex === -1) {
    alert('Error: No se encontró la receta seleccionada.');
    return;
  }
  showRecipe();
}

// Guardar recetas en localStorage
function saveToLocalStorage() {
  localStorage.setItem('recipes', JSON.stringify(recipes));
}

// Guardar recetas en un archivo JSON
function saveToFile() {
  const blob = new Blob([JSON.stringify(recipes, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'recetas.json';
  a.click();
}

// Cargar recetas desde un archivo JSON
function loadFromFile() {
  document.getElementById('file-input').click();
}

// Manejar la carga de archivos con validación
function handleFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const parsedData = JSON.parse(e.target.result);
      if (!Array.isArray(parsedData)) throw new Error('El archivo debe contener un arreglo de recetas.');
      parsedData.forEach((recipe, index) => {
        if (!recipe.title || typeof recipe.title !== 'string' || recipe.title.trim() === '') {
          throw new Error(`Error en receta ${index + 1}: "title" es obligatorio.`);
        }
        if (!recipe.category || typeof recipe.category !== 'string') {
          recipe.category = "Sin categoría";
        }
        if (!recipe.ingredients) {
          recipe.ingredients = [];
        } else if (typeof recipe.ingredients === 'string') {
          recipe.ingredients = recipe.ingredients.split('\n').filter(i => i.trim() !== '');
        } else if (!Array.isArray(recipe.ingredients)) {
          throw new Error(`Error en receta ${index + 1}: "ingredients" debe ser lista o texto.`);
        }
        if (typeof recipe.instructions !== 'string') {
          recipe.instructions = "";
        }
        if (recipe.image && typeof recipe.image !== 'string') {
          recipe.image = "";
        }
      });
      recipes = parsedData;
      saveToLocalStorage();
      updateRecipeCount();
      alert(`Se cargaron ${parsedData.length} recetas correctamente.`);
      showMenu2();
    } catch (error) {
      alert(`Error al cargar el archivo:\n${error.message}`);
      console.error("Error detallado:", error);
    }
  };
  reader.readAsText(file);
}

function saveRecipeToHTML() {
  if (receta_actual === null || receta_actual === undefined) {
    alert("No hay una receta seleccionada para guardar.");
    return;
  }
  const recipe = recipes[receta_actual];
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
  const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`;
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `${recipe.title.replace(/ /g, '_')}.html`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
  }, 100);
}

// Actualizar el contador de recetas
function updateRecipeCount() {
  const recipeCountElement = document.getElementById("recipe-count");
  const totalRecipes = recipes.length;
  recipeCountElement.textContent = `Total de recetas: ${totalRecipes}`;
}

// Inicialización del gesto de desplazamiento
document.addEventListener("DOMContentLoaded", () => {
  fetchRecipesFromURL(); // Cargar recetas automáticamente de la URL al iniciar

  const recipeContainer = document.getElementById("menu21");
  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;

  if (recipeContainer) {
    recipeContainer.addEventListener("touchstart", (event) => {
      touchStartX = event.touches[0].clientX;
      touchStartY = event.touches[0].clientY;
    });

    recipeContainer.addEventListener("touchend", (event) => {
      touchEndX = event.changedTouches[0].clientX;
      touchEndY = event.changedTouches[0].clientY;
      handleSwipe();
    });

    function handleSwipe() {
      const swipeThreshold = 50;
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > swipeThreshold) {
          showprevRecipe();
        } else if (deltaX < -swipeThreshold) {
          shownextRecipe();
        }
      }
    }
  }
  updateRecipeCount();
});