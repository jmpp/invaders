const aliensMap = [
    'A','A','A','A','A','A','A','A','A','A','A',

    'B','B','B','B','B','B','B','B','B','B','B',
    'B','B','B','B','B','B','B','B','B','B','B',

    'C','C','C','C','C','C','C','C','C','C','C',
    'C','C','C','C','C','C','C','C','C','C','C'
];

const NB_ALIENS_PER_LINE = 11;

const aliensConfig = {
    'A' : {
        points : 40,
        sprites : [
            { x:6 , y:3 , w:16 , h:16 },
            { x:6 , y:25 , w:16 , h:16 }
        ]
    },
    'B' : {
        points : 20,
        sprites : [
            { x:32 , y:3 , w:22 , h:16 },
            { x:32 , y:25 , w:22 , h:16 }
        ]
    },
    'C' : {
        points : 10,
        sprites : [
            { x:60 , y:3 , w:24 , h:16 },
            { x:60 , y:25 , w:24 , h:16 }
        ]
    },
};

function createAliens() {
    const aliens = [];

    for (let i = 0, line = 0; i < aliensMap.length; i++) {
        if (i % NB_ALIENS_PER_LINE === 0) {
            line++;
        }

        aliens.push({
            x : 10 + i % NB_ALIENS_PER_LINE * 35,
            y : 100 + line * 28,
            points : aliensConfig[ aliensMap[i] ].points,
            spriteIndex : 0,
            id : aliensMap[i]
        });
    }

    return aliens;
}

function animateAliens() {

}

function renderAliens() {
    for (let i = 0; i < aliens.length; i++) {
        
        let letter = aliens[i].id;
        let spriteIndex = aliens[i].spriteIndex;

        context.drawImage(
            spritesheet,
            
            aliensConfig[letter].sprites[spriteIndex].x,
            aliensConfig[letter].sprites[spriteIndex].y,
            aliensConfig[letter].sprites[spriteIndex].w,
            aliensConfig[letter].sprites[spriteIndex].h,

            aliens[i].x,
            aliens[i].y,
            aliensConfig[letter].sprites[spriteIndex].w,
            aliensConfig[letter].sprites[spriteIndex].h
        );
    }
}