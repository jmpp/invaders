
const canvas = document.getElementById('invaders');
const context = canvas.getContext('2d');

canvas.width = 480;
canvas.height = 540;

let timer;
let player;
let aliens;
const sounds = {
    invader1       : document.getElementById('invader1'),
    invader2       : document.getElementById('invader2'),
    invader3       : document.getElementById('invader3'),
    invader4       : document.getElementById('invader4'),
    invader_killed : document.getElementById('invader_killed'),
    shoot          : document.getElementById('shoot'),
    player_death   : document.getElementById('player_death')
};
// Récupération du "high score" dans les données locales stockées du navigateur (JavaScript Local Storage API)
let highScore = parseInt(window.localStorage.getItem('invaders_high_score'), 10) || 0;

const MODE_PLAYING     = 1;
const MODE_GAME_OVER   = 2;
const MODE_PLAYER_DEAD = 3;
const MODE_NEW_WAVE    = 4;
const MODE_PAUSE       = 5;
let game_mode = MODE_PLAYING;

// Chargement de l'image du sprite avant de démarrer le jeu
const spritesheet = new Image();
spritesheet.src = 'img/spritesheet.png';
spritesheet.onload = function() { // Fonction exécutée lorsque le navigateur a fini de charger le PNG
    player = createPlayer();
    aliens = createAliens();

    // Démarrage de la boucle continue
    gameloop();
};

function update() {
    if ((Keyboard.P || Keyboard.ECHAP) && Keyboard._tapped) {
        game_mode = (game_mode === MODE_PAUSE) ? MODE_PLAYING : MODE_PAUSE;
    }

    switch(game_mode) {
    case MODE_PLAYING:
        animatePlayer(); // Fonction qui gère l'animation du joueur
        animateAliens(); // Fonction qui gère l'animation du joueur
        break;
    }
}

function render() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    switch(game_mode) {
    case MODE_PLAYING:
    case MODE_PLAYER_DEAD:
    case MODE_NEW_WAVE:
        renderPlayer(); // Dessin du joueur
        renderAliens(); // Dessin du joueur
        break;
    case MODE_PAUSE:
        renderPlayer(); // Dessin du joueur
        renderPause();
        break;
    case MODE_GAME_OVER:
        renderGameOver(); // Affichage du "game over" à l'écran
        break;
    }

    renderUI(); // Dessin des éléments de l'interface
}

// Fonction gérant la boucle de jeu
function gameloop() {
    update();
    render();

    Keyboard._tapped = false;

    timer = window.requestAnimationFrame(gameloop);
}

// Permet de définir le mode game over et tout ce qui suit
function setGameOver() {
    // Mise en mode game over
    game_mode = MODE_GAME_OVER;
    player.lives = 0;
    sounds['player_death'].play();

    // Si au cours de cette partie, le joueur a fait un meilleur score que le high score, on met à jour dans le stockage navigateur
    if (player.score > highScore) {
        highScore = player.score;
        window.localStorage.setItem('invaders_high_score', player.score);
    }
}

let go_color = 0;
let go_size = 0;
function renderGameOver() {
    
    // Affichage du texte clignotant uniquement si on a fait un "high score" !
    if (player.score === highScore) {
        go_color += 30;
        go_size = 24 - (timer % 4);

        context.textAlign = 'center';
        context.fillStyle = 'hsl('+ go_color +', 100%, 50%)';
        context.font = 'normal '+ go_size +'px "Press Start 2P", cursive';
        context.fillText('NEW HIGH SCORE!!!', canvas.width/2, canvas.height/2 - 40);
    }
    
    context.textAlign = 'center';
    context.fillStyle = '#0f0';
    context.font = 'normal 24px "Press Start 2P", cursive';
    context.fillText('GAME OVER', canvas.width/2, canvas.height/2);
    
    context.fillStyle = '#fff';
    context.font = 'normal 16px "Press Start 2P", cursive';
    context.fillText('PRESS F5', canvas.width/2, canvas.height/2 + 30);
}

function renderPause() {
    context.textAlign = 'center';
    context.fillStyle = '#0f0';
    context.font = 'normal 20px "Press Start 2P", cursive';
    context.fillText('- PAUSE -', canvas.width/2, canvas.height/2);

    // Affichage du "high score" dans le menu pause
    context.fillStyle = '#fff';
    context.font = 'normal 16px "Press Start 2P", cursive';
    context.fillText('High Score: ' + highScore + ' pts', canvas.width/2, canvas.height/2 + 30);
}