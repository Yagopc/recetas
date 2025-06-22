// Variables globales
let recipes = JSON.parse(localStorage.getItem('recipes')) || [];
let currentRecipeIndex = null;
let receta_actual = 0; // Inicializamos con 0 (primera receta)
let lastMenu = 'menu1'; // Por defecto, el menú principal
let searchResults = []; // Variable para almacenar los resultados de búsqueda

// Ocultar todos los menús
function hideAllMenus() {
  const activeMenu = document.querySelector('.container:not(.hidden)');
  if (activeMenu) {
    lastMenu = activeMenu.id; // Guardar el ID del menú activo
  }
  document.querySelectorAll('.container').forEach(menu => menu.classList.add('hidden'));
}

// Volver al último menú
function goBackToLastMenu() {
  if (lastMenu) {
    hideAllMenus();
    document.getElementById(lastMenu).classList.remove('hidden');
  } else {
    goBackToMenu1(); // Si no hay un menú previo, volver al menú principal
  }
}

// Mostrar menú de categorías
function showCategoryMenu() {
  hideAllMenus();
  const checkboxes = document.querySelectorAll('#menu-categories input[type="checkbox"]');
  checkboxes.forEach(checkbox => checkbox.checked = false);
  document.getElementById('menu-categories').classList.remove('hidden');
}

// Volver al menú principal
function goBackToMenu1() {
  hideAllMenus();
  document.getElementById('menu1').classList.remove('hidden');
}

// Mostrar menú de recetas guardadas
function showMenu2() {
  hideAllMenus();
  const recipeTitles = document.getElementById('recipe-titles');
  recipeTitles.innerHTML = '';

  // Ordenar las recetas alfabéticamente por título
  recipes.sort((a, b) => a.title.localeCompare(b.title));

  recipes.forEach((recipe, index) => {
    const li = document.createElement('li');
    li.textContent = recipe.title;
    li.onclick = () => selectRecipe(index);
    recipeTitles.appendChild(li);
  });

  document.getElementById('menu2').classList.remove('hidden');
}

// Mostrar menú para agregar una nueva receta
function showNewRecipeMenu() {
  hideAllMenus();
  document.getElementById('menu-new-recipe').classList.remove('hidden');
}

// Seleccionar una receta de la lista
function selectRecipe(index) {
  currentRecipeIndex = index;

  // Elimina la clase "selected" de todos los elementos
  const recipeItems = document.querySelectorAll('#recipe-titles li');
  recipeItems.forEach(item => item.classList.remove('selected'));

  // Agrega la clase "selected" al título seleccionado
  recipeItems[index].classList.add('selected');

  // Muestra las acciones para la receta seleccionada
  document.getElementById('recipe-actions').classList.remove('hidden');
}

// Mostrar detalles de la receta seleccionada


function loadFromURL() {
  const url = "https://yagopc.github.io/Reservas/recetas.json";

  fetch(url)
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    })
    .then(data => {
      if (!Array.isArray(data)) {
        throw new Error("El archivo JSON no contiene un arreglo de recetas.");
      }

      // Validación básica de estructura
      data.forEach((recipe, index) => {
        if (typeof recipe.title !== 'string' || typeof recipe.category !== 'string' ||
            !Array.isArray(recipe.ingredients) || typeof recipe.instructions !== 'string') {
          throw new Error(`Receta inválida en la posición ${index + 1}`);
        }
      });

      recipes = data;
      saveToLocalStorage();
      updateRecipeCount(); // actualizar contador si lo estás mostrando
      alert("Recetas actualizadas desde la web.");
    })
    .catch(error => {
      alert(`Error al cargar las recetas desde la URL: ${error.message}`);
    });
}

function showRecipe() {
  const recipe = recipes[currentRecipeIndex];

  // Actualizar la variable receta_actual
  receta_actual = currentRecipeIndex;

  // Mostrar los detalles de la receta
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
  document.getElementById('menu21').classList.remove('hidden'); // Mostrar la ficha de la receta
}

// Mostrar recetas filtradas por categoría
function showCategoryRecipes(category) {
  hideAllMenus();
  lastCategory = category; // Guardamos la categoría actual
  const recipeTitles = document.getElementById('recipe-titles');
  recipeTitles.innerHTML = '';

  // Filtrar las recetas por la categoría seleccionada
  const filteredRecipes = recipes.filter(recipe => recipe.category.toLowerCase() === category.toLowerCase());

  if (filteredRecipes.length === 0) {
    alert(`No hay recetas en la categoría "${category}".`);
    goBackToMenu1();
    return;
  }

  // Mostrar las recetas filtradas
  filteredRecipes.forEach((recipe) => {
    const li = document.createElement('li');
    li.textContent = recipe.title;

    // Manejar la selección de la receta
    li.onclick = () => {
      const globalIndex = recipes.findIndex(r => r.title === recipe.title);
      currentRecipeIndex = globalIndex;

      if (currentRecipeIndex !== -1) {
        showRecipe(); // Mostrar detalles de la receta seleccionada
      } else {
        alert('Error: No se pudo encontrar la receta.');
      }
    };

    recipeTitles.appendChild(li);
  });

  document.getElementById('menu2').classList.remove('hidden'); // Mostrar listado filtrado
}

// Volver al listado filtrado por categoría
function goBackToLastCategory() {
  if (lastCategory) {
    showCategoryRecipes(lastCategory); // Regresa al listado por categoría
  } else {
    goBackToMenu1(); // Si no hay categoría, regresa al menú principal
  }
}

// Botón "Volver" desde el menú de detalles de receta
function goBackToMenu2() {
  if (lastCategory) {
    goBackToLastCategory(); // Volver al listado por categoría
  } else {
    showMenu2(); // Volver al listado general de recetas
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

  // Filtrar las recetas que coincidan con TODAS las categorías seleccionadas
  const filteredRecipes = recipes.filter(recipe => {
    // Verificar si TODAS las categorías seleccionadas están incluidas en el campo "category" de la receta
    return selectedCategories.every(category => 
      recipe.category.toLowerCase().includes(category.toLowerCase())
    );
  });

  if (filteredRecipes.length === 0) {
    alert(`No hay recetas que coincidan con todas las categorías seleccionadas.`);
    goBackToMenu1();
    return;
  }

  // Mostrar las recetas filtradas
  filteredRecipes.forEach((recipe) => {
    const li = document.createElement('li');
    li.textContent = recipe.title;

    // Manejar la selección de la receta
    li.onclick = () => {
      const globalIndex = recipes.findIndex(r => r.title === recipe.title);
      currentRecipeIndex = globalIndex;

      if (currentRecipeIndex !== -1) {
        showRecipe(); // Mostrar detalles de la receta seleccionada
      } else {
        alert('Error: No se pudo encontrar la receta.');
      }
    };

    recipeTitles.appendChild(li);
  });

  document.getElementById('menu2').classList.remove('hidden'); // Mostrar listado filtrado
}
function searchRecipe() {
  const searchTerm = prompt('Introduce el término de búsqueda:').toLowerCase();

  if (!searchTerm) return;

  const uniqueResults = new Set();

  recipes.forEach(recipe => {
    const matchInTitle = recipe.title.toLowerCase().includes(searchTerm);
    const matchInCategory = recipe.category.toLowerCase().includes(searchTerm);
    const matchInIngredients = recipe.ingredients.some(ing => ing.toLowerCase().includes(searchTerm));

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

  showRecipe(); // Mostrar detalles de la receta seleccionada
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

// Manejar la carga de archivos
// Manejar la carga de archivos con validación
function handleFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const parsedData = JSON.parse(e.target.result);

      // Validar si es un array
      if (!Array.isArray(parsedData)) {
        throw new Error('El archivo debe contener un arreglo de recetas.');
      }

      // Validar la estructura de cada receta
      parsedData.forEach((recipe, index) => {
        if (typeof recipe.title !== 'string' || recipe.title.trim() === '') {
          throw new Error(`Error en la receta ${index + 1}: "title" es obligatorio y debe ser un texto.`);
        }
        if (typeof recipe.category !== 'string' || recipe.category.trim() === '') {
          throw new Error(`Error en la receta ${index + 1}: "category" es obligatorio y debe ser un texto.`);
        }
        if (!Array.isArray(recipe.ingredients) || recipe.ingredients.some(ing => typeof ing !== 'string')) {
          throw new Error(`Error en la receta ${index + 1}: "ingredients" debe ser una lista de textos.`);
        }
        if (typeof recipe.instructions !== 'string' || recipe.instructions.trim() === '') {
          throw new Error(`Error en la receta ${index + 1}: "instructions" es obligatorio y debe ser un texto.`);
        }
        if (recipe.image && typeof recipe.image !== 'string') {
          throw new Error(`Error en la receta ${index + 1}: "image" debe ser una URL o estar vacío.`);
        }
      });

      // Si pasa todas las validaciones, actualizar las recetas
      recipes = parsedData;
      saveToLocalStorage();
      alert('Recetas cargadas exitosamente');
    } catch (error) {
      alert(`El archivo no tiene un formato válido. ${error.message}`);
    }
  };

  reader.readAsText(file);
}

function saveRecipeToHTML() {
  console.log("Intentando guardar la receta...");
  console.log("receta_actual:", receta_actual);

  // Verificar si hay una receta seleccionada
  if (receta_actual === null || receta_actual === undefined) {
    alert("No hay una receta seleccionada para guardar.");
    return;
  }

  const recipe = recipes[receta_actual];
  console.log("Receta seleccionada:", recipe);

  // Crear el contenido HTML de la receta
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${recipe.title}</title>
    </head>
    <body>
    recipe = currentRecipeIndex;
      <h1>${recipe.title}</h1>
      <p><strong>Categoría:</strong> ${recipe.category}</p>
      <p><strong>Ingredientes:</strong> ${recipe.ingredients.join(', ')}</p>
      <p><strong>Elaboración:</strong> ${recipe.instructions}</p>
      ${recipe.image ? `<img src="${recipe.image}" alt="${recipe.title}" style="max-width:100%;">` : ''}
    </body>
    </html>
  `;

  // Crear un Data URL con el contenido HTML
  const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`;

  // Crear un enlace para descargar el archivo
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `${recipe.title.replace(/ /g, '_')}.html`; // Nombre del archivo
  document.body.appendChild(a); // Añadir el enlace al DOM

  // Simular clic en el enlace
  a.click();

  // Eliminar el enlace del DOM
  setTimeout(() => {
    document.body.removeChild(a);
    console.log("Enlace eliminado."); // Mensaje de depuración
  }, 100); // Esperar un momento antes de eliminar el enlace
}
// Actualizar el contador de recetas
function updateRecipeCount() {
  const recipeCountElement = document.getElementById("recipe-count");
  const totalRecipes = recipes.length;
  recipeCountElement.textContent = `Total de recetas: ${totalRecipes}`;
}

// Inicialización del gesto de desplazamiento
document.addEventListener("DOMContentLoaded", () => {
  const recipeContainer = document.getElementById("menu21"); // Contenedor de la receta
  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;

  // Detectar cuando se inicia el toque
  recipeContainer.addEventListener("touchstart", (event) => {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
  });

  // Detectar cuando termina el toque
  recipeContainer.addEventListener("touchend", (event) => {
    touchEndX = event.changedTouches[0].clientX;
    touchEndY = event.changedTouches[0].clientY;
    handleSwipe(); // Manejar el gesto de desplazamiento
  });

  function handleSwipe() {
    const swipeThreshold = 50; // Sensibilidad del gesto en píxeles
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    // Verificar si el desplazamiento en X es mayor que en Y
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > swipeThreshold) {
        showprevRecipe(); // Deslizar a la derecha → receta anterior
      } else if (deltaX < -swipeThreshold) {
        shownextRecipe(); // Deslizar a la izquierda → siguiente receta
      }
    }
  }

  updateRecipeCount(); // Actualizar el contador de recetas al cargar la página
});