const NB_ALIENS_PER_LINE = 11;
const ALIEN_SPACE_X = 35;
const ALIEN_SPACE_Y = 28;
const aliensMap = [
    40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40,
    20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20,
    20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20,
    10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10,
    10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10 
];
const aliensSprites = {
    40 : [
        { x:6 , y:3  , width:16 , height:16 },
        { x:6 , y:25 , width:16 , height:16 }
    ],
    20 : [
        { x:32 , y:3  , width:22 , height:16 },
        { x:32 , y:25 , width:22 , height:16 }
    ],
    10 : [
        { x:60 , y:25 , width:24 , height:16 },
        { x:60 , y:3  , width:24 , height:16 }
    ]
};

let aliensTimer = 1000; // intervalle de mouvements d'aliens en milli-secondes
let lastAlienMovement = 0; // instant "t" du dernier déplacement des aliens
let alienExplosions = []; // Tableau qui servira à stocker les sprites d'explosion
let aliensShots = []; // Tableau qui contiendra la liste des éventuels tirs d'aliens
let alienSoundNb = 1; // numéro de son de l'alien (variera de 1 à 4, en boucle)

function createAliens() {
    const aliens = [];

    for (let i = 0, line = 0; i < aliensMap.length; i++) {
        if (i % NB_ALIENS_PER_LINE === 0) {
            line++;
        }

        if (aliensMap[i] === 0) { continue; }

        let alienWidth = aliensSprites[ aliensMap[i] ][ 0 ].width;
        let alienHeight = aliensSprites[ aliensMap[i] ][ 0 ].height;

        aliens.push({
            x           : 12 + i % NB_ALIENS_PER_LINE * ALIEN_SPACE_X + (24 - alienWidth) / 2 | 0,
            y           : 100 + line * ALIEN_SPACE_Y,
            width       : alienWidth,
            height      : alienHeight,
            points      : aliensMap[i],
            direction   : 1,
            spriteIndex : 0
        });
    }

    return aliens;
}

function animateAliens() {

    // Mouvement des aliens de gauche à droite et vers le bas
    if (Date.now() - lastAlienMovement > aliensTimer) {
        lastAlienMovement = Date.now(); // Mise à jour de l'instant du dernier mouvement du joueur à "maintenant"!

        /*
            sounds['invader' + alienSoundNb].play();
            alienSoundNb++;
            if (alienSoundNb > 4) {
                alienSoundNb = 1;
            }
        */
        sounds['invader' + (alienSoundNb++ % 4 + 1)].play();

        // Vérification si un des aliens du groupe a atteint le joueur
        // Pour cela, récupération des coordonnées de l'alien le plus bas dans le groupe
        let extremeDownAlien = Math.max( ...aliens.map(a => a.y) );
        if (extremeDownAlien + 16 >= player.y) {
            player.lives = 0;
            sounds['player_death'].play();
            game_mode = MODE_GAME_OVER;
        }

        // Récupération du X de l'alien le plus à droite (et à gauche)
        let extremeRightAlien = Math.max( ...aliens.map(a => a.x) ) + ALIEN_SPACE_X;
        let extremeLeftAlien = Math.min( ...aliens.map(a => a.x) );
        
        // Parcours du tableau d'aliens pour mise à jour
        for (let i = 0; i < aliens.length; i++) {

            if (Math.random() > 0.99) {
                createAlienShot(aliens[i]);
            }

            // Si le groupe d'aliens touche un bord de l'écran, chaque alien change sa variable de direction, ainsi que sa position verticale (pour descendre d'un cran)
            if (extremeRightAlien > canvas.width && aliens[i].direction === 1 ||
                extremeLeftAlien <= 0 && aliens[i].direction === -1) {
                aliens[i].direction *= -1;
                aliens[i].y += 22;
            }
            else {
                aliens[i].x += 12 * aliens[i].direction;
            }

            aliens[i].spriteIndex = (aliens[i].spriteIndex === 0) ? 1 : 0;
            /* if (aliens[i].spriteIndex === 0) {
                aliens[i].spriteIndex = 1;
            } else {
                aliens[i].spriteIndex = 0;
            } */

        }
    } // -- fin du mouvement des aliens

    // Vérification si un alien se prend un tir de "player.bullet"
    if (player.bullet !== null) {
        for (let i = 0; i < aliens.length; i++) {
            if (player.bullet.x > aliens[i].x &&
                player.bullet.x <= aliens[i].x + aliens[i].width &&
                player.bullet.y > aliens[i].y &&
                player.bullet.y <= aliens[i].y + aliens[i].height) {
                // Collision !
                createExplosion(aliens[i]);
                // Son
                sounds['invader_killed'].play();
                // Augmentation du score du joueur
                player.score += aliens[i].points;
                player.bullet = null;
                // Augmentation de la vitesse générale des aliens
                aliensTimer -= 15;
                if (aliensTimer < 75) {
                    aliensTimer = 75;
                }
                // Suppression de l'alien du tableau
                aliens.splice(i, 1);
                break;
            }
        }
    }

    // Suppression des animations d'explosion ayant dépassé les 100ms
    for (let i = 0; i < alienExplosions.length; i++) {
        if (Date.now() - alienExplosions[i].dateCreated > 100) {
            alienExplosions.splice(i, 1);
            i--;
        }
    }

    // Gestion des shots aliens
    for (let i = 0; i < aliensShots.length; i++) {
        aliensShots[i].y += aliensShots[i].speed;

        // Si un tir d'alien déborde en bas du canvas
        if (aliensShots[i].y > canvas.height) {
            aliensShots.splice(i, 1);
            i--;
        }
        else if (
            aliensShots[i].x > player.x &&
            aliensShots[i].x + aliensShots[i].width < player.x + player.sprite.width &&
            aliensShots[i].y + aliensShots[i].height > player.y &&
            aliensShots[i].y < player.y + player.sprite.height
        ) {
            // Moins une vie
            player.lives--;

            // Plus de vies ?
            if (player.lives === 0) {
                game_mode = MODE_GAME_OVER;
                break;
            }

            // Suppression des tirs alien en cours, et du shoot player
            aliensShots.length = 0; // vide l'array en javascript
            player.bullet = null;

            // "Boom !"
            sounds['player_death'].play();

            // Changement du mode de jeu pour 2 secondes
            game_mode = MODE_PLAYER_DEAD;
            setTimeout(() => {
                // Replacement du joueur à sa position initiale
                player.x = 100;

                game_mode = MODE_PLAYING;
            }, 2000);
        }
    }

} // -- fin de la fonction animateAliens()

function renderAliens() {
    for (let i = 0; i < aliens.length; i++) {
        
        let points      = aliens[i].points;
        let spriteIndex = aliens[i].spriteIndex;

        context.drawImage(
            spritesheet,
            
            aliensSprites[points][spriteIndex].x,
            aliensSprites[points][spriteIndex].y,
            aliensSprites[points][spriteIndex].width,
            aliensSprites[points][spriteIndex].height,

            aliens[i].x,
            aliens[i].y,
            aliensSprites[points][spriteIndex].width,
            aliensSprites[points][spriteIndex].height
        );
    }

    // Dessin des explosions
    for (let i = 0; i < alienExplosions.length; i++) {
        context.drawImage(
            spritesheet,

            alienExplosions[i].sprite.x,
            alienExplosions[i].sprite.y,
            alienExplosions[i].sprite.width,
            alienExplosions[i].sprite.height,

            alienExplosions[i].x,
            alienExplosions[i].y,
            alienExplosions[i].sprite.width,
            alienExplosions[i].sprite.height
        );
    }

    // Dessin des shots des aliens
    for (let i = 0; i < aliensShots.length; i++) {
        context.fillStyle = '#fff';
        context.fillRect(aliensShots[i].x, aliensShots[i].y, aliensShots[i].width, aliensShots[i].height);
    }
}

// Fonction qui créé un objet représentant une explosion, à partir d'un alien
function createExplosion(alien) {
    alienExplosions.push({
        x : alien.x,
        y : alien.y,
        sprite : {
            x : 88,
            y : 25,
            width : 26,
            height : 16
        },
        dateCreated : Date.now()
    });
}

function createAlienShot(alien) {
    // Son
    sounds['shoot'].play();
    // Ajout d'un shot alien dans le tableau correspondant
    aliensShots.push({
        x : alien.x + alien.width/2,
        y : alien.y + alien.height,
        width : 4,
        height : 10,
        speed : 5
    });
}