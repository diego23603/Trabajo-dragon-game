let dragons = []; // Array para almacenar los dragones
let selectedDragon = null; // Inicializa selectedDragon como null
let dragonY = 200; // Posición vertical del dragón
let obstacleX = 800; // Posición horizontal del obstáculo
let obstacleY = Math.random() * (400 - 50); // Altura aleatoria para el obstáculo
let obstacleSpeed = 3; // Velocidad del obstáculo
let gameInterval; // Intervalo del juego
let score = 0; // Puntuación del jugador
let gameOver = false; // Estado del juego
const gameOverSound = new Audio('/sounds/game-over.mp3'); // Sonido de fin del juego

// Variables para el fondo
const bgImage = new Image();
bgImage.src = 'https://img.freepik.com/vector-gratis/fondo-videojuego-dibujado-mano_23-2150315377.jpg?size=626&ext=jpg&ga=GA1.1.2002160653.1727800946&semt=ais_hybrid'; // URL de la imagen de fondo
let bgX = 0; // Posición X del fondo
let bgSpeed = 0.2; // Velocidad de desplazamiento del fondo

// Flag para determinar si el juego está en curso
let gameStarted = false;

// Función para cargar dragones desde el servidor
function loadDragons() {
    fetch('/dragons') // Coincide con la ruta configurada en tu servidor
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }
            return response.json();
        })
        .then(data => {
            dragons = data; // Asigna los dragones obtenidos
            renderDragons(); // Llama a renderizar los dragones
        })
        .catch(error => {
            console.error('Error al cargar los dragones:', error);
            alert('No se pudieron cargar los dragones. Usando datos predeterminados.');
            // Carga dragones predeterminados en caso de error
            dragons = [
                { name: 'Dragón 1', image: '/images/dragon1.png', size: 100 },
                { name: 'Dragón 2', image: '/images/dragon2.png', size: 100 },
                { name: 'Dragón 3', image: '/images/dragon3.png', size: 100 }
            ];
            renderDragons();
        });
}

// Función para guardar los dragones en el servidor
function saveDragons() {
    fetch('/dragons', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dragons) // Envía el array de dragones actualizado
    })
        .then(() => console.log('Dragones guardados correctamente.'))
        .catch(error => console.error('Error al guardar los dragones:', error));
}

// Función para renderizar los dragones en el contenedor
function renderDragons() {
    const dragonsContainer = document.getElementById('dragonsContainer');
    dragonsContainer.innerHTML = ''; // Limpia el contenedor

    dragons.forEach((dragon, index) => {
        const dragonLabel = document.createElement('label');
        dragonLabel.innerHTML = `
            <input type="radio" name="dragon" value="${dragon.name}" onclick="selectDragon(${index})">
            <img src="${dragon.image}" alt="${dragon.name}" width="${dragon.size}">
            <button onclick="deleteDragon(${index})">Eliminar</button>
        `;
        dragonsContainer.appendChild(dragonLabel);
    });
}

// Función para seleccionar un dragón basado en el índice
function selectDragon(index) {
    selectedDragon = dragons[index]; // Selecciona el dragón basado en el índice
    document.getElementById('selectedDragon').innerText = `Dragón seleccionado: ${selectedDragon.name}`;

    // Muestra el formulario de edición con los detalles del dragón seleccionado
    document.getElementById('editDragonForm').style.display = 'block';
    document.getElementById('editDragonName').value = selectedDragon.name;
    document.getElementById('editDragonSize').value = selectedDragon.size;
    document.getElementById('editDragonImage').value = selectedDragon.image;
}

// Función para editar un dragón
function updateDragon() {
    if (selectedDragon) {
        selectedDragon.name = document.getElementById('editDragonName').value;
        selectedDragon.size = parseInt(document.getElementById('editDragonSize').value, 10);
        selectedDragon.image = document.getElementById('editDragonImage').value;
        saveDragons(); // Guarda los cambios en el servidor
        renderDragons(); // Renderiza la lista de dragones actualizada
    }
}

// Función para añadir un dragón
function addDragon() {
    const name = document.getElementById('dragonName').value;
    const size = parseInt(document.getElementById('dragonSize').value);
    const image = document.getElementById('dragonImage').value;

    if (name && size && image) {
        const newDragon = { name, image, size };
        dragons.push(newDragon); // Agrega el nuevo dragón al array
        renderDragons(); // Actualiza la lista de dragones
        saveDragons(); // Guarda los dragones en el servidor o archivo JSON
    } else {
        alert("Por favor, completa todos los campos para añadir un dragón.");
    }

    // Limpia el formulario
    document.getElementById('dragonName').value = '';
    document.getElementById('dragonSize').value = '';
    document.getElementById('dragonImage').value = '';
}

// Función para eliminar un dragón
function deleteDragon(index) {
    dragons.splice(index, 1); // Elimina el dragón del array
    saveDragons(); // Guarda los cambios en el servidor
    renderDragons(); // Renderiza la lista de dragones actualizada
}

// Función para iniciar el juego
function playGame() {
    if (!selectedDragon) {
        alert("Por favor, selecciona un dragón para jugar.");
        return;
    }

    // Reiniciar variables del juego
    dragonY = 200;
    obstacleX = 800;
    obstacleY = Math.random() * (400 - 50);
    obstacleSpeed = 3;
    score = 0;
    gameOver = false;
    gameStarted = true; // Indica que el juego ha comenzado

    // Configurar el canvas
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 800;
    canvas.height = 400;

    // Cargar la imagen del dragón
    const dragonImg = new Image();
    dragonImg.src = selectedDragon.image;

    // Cargar la imagen del obstáculo
    const obstacleImg = new Image();
    obstacleImg.src = "/images/obstacle.png"; // Asegúrate de tener la imagen del obstáculo

    // Escuchar eventos de teclado para mover el dragón
    document.addEventListener('keydown', moveDragon);

    // Iniciar el bucle del juego
    gameInterval = setInterval(() => {
        if (!gameOver) {
            updateGame(ctx, dragonImg, obstacleImg);
        }
    }, 20); // Actualiza cada 20 ms
}

// Mueve el dragón
function moveDragon(event) {
    if (!gameStarted) return; // No hace nada si el juego no ha comenzado

    if (event.key === 'ArrowUp') {
        event.preventDefault(); // Evita que la página se desplace hacia arriba
        dragonY -= 10; // Mueve el dragón hacia arriba
    } else if (event.key === 'ArrowDown') {
        event.preventDefault(); // Evita que la página se desplace hacia abajo
        dragonY += 10; // Mueve el dragón hacia abajo
    }

    // Limitar el movimiento del dragón dentro del canvas
    const canvas = document.getElementById("gameCanvas");
    if (dragonY < 0) {
        dragonY = 0; // Limita el movimiento hacia arriba
    } else if (dragonY + selectedDragon.size > canvas.height) {
        dragonY = canvas.height - selectedDragon.size; // Limita el movimiento hacia abajo
    }
}

// Actualiza el estado del juego
function updateGame(ctx, dragonImg, obstacleImg) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Dibuja el fondo dinámico
    drawBackground(ctx);

    // Dibuja el dragón
    ctx.drawImage(dragonImg, 50, dragonY, selectedDragon.size, selectedDragon.size);

    // Mueve el obstáculo
    obstacleX -= obstacleSpeed;

    // Si el obstáculo sale del canvas, reinicia su posición y genera nueva altura
    if (obstacleX < -75) {
        obstacleX = ctx.canvas.width;
        obstacleY = Math.random() * (400 - 50);
        score++;
        increaseObstacleSpeed(); // Aumenta la velocidad del obstáculo
    }

    // Dibuja el obstáculo
    ctx.drawImage(obstacleImg, obstacleX, obstacleY, 75, 75);

    // Verifica colisión
    if (checkCollision(50, dragonY, selectedDragon.size, selectedDragon.size, obstacleX, obstacleY, 75, 75)) {
        endGame(ctx);
    }

    // Muestra la puntuación
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText(`Puntuación: ${score}`, 10, 20);
}

// Dibuja el fondo dinámico
function drawBackground(ctx) {
    bgX -= bgSpeed; // Desplaza el fondo
    if (bgX <= -ctx.canvas.width) {
        bgX = 0; // Reinicia la posición del fondo
    }
    ctx.drawImage(bgImage, bgX, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(bgImage, bgX + ctx.canvas.width, 0, ctx.canvas.width, ctx.canvas.height); // Dibuja el fondo en la posición de la derecha
}

// Verifica colisiones entre el dragón y el obstáculo
function checkCollision(dragonX, dragonY, dragonWidth, dragonHeight, obstacleX, obstacleY, obstacleWidth, obstacleHeight) {
    return (
        dragonX < obstacleX + obstacleWidth &&
        dragonX + dragonWidth > obstacleX &&
        dragonY < obstacleY + obstacleHeight &&
        dragonY + dragonHeight > obstacleY
    );
}

// Aumenta la velocidad del obstáculo
function increaseObstacleSpeed() {
    if (score % 5 === 0) { // Aumenta la velocidad cada 5 puntos
        obstacleSpeed += 0.5;
    }
}

// Termina el juego
function endGame(ctx) {
    clearInterval(gameInterval);
    gameOver = true; // Establece el estado del juego a terminado
    document.removeEventListener('keydown', moveDragon); // Elimina el evento de tecla

    // Muestra un mensaje de Game Over
    ctx.fillStyle = 'red';
    ctx.font = '40px Arial';
    ctx.fillText('¡Game Over!', ctx.canvas.width / 2 - 100, ctx.canvas.height / 2);
    ctx.fillText(`Puntuación final: ${score}`, ctx.canvas.width / 2 - 100, ctx.canvas.height / 2 + 50);
    gameOverSound.play(); // Reproduce el sonido de fin del juego
}

// Cargar dragones al iniciar la aplicación
loadDragons();