function renderUI() {
    context.fillStyle = '#0f0';
    context.font = 'normal 20px "Press Start 2P", cursive';
    context.textAlign = 'left';
    context.fillText('SCORE: ' + player.score, 20, 40);

    context.textAlign = 'right';
    context.fillText('VIES: ' + player.lives, canvas.width - 20, 40);

    // Dessin de la ligne verte horizontale

    context.strokeStyle = '#0f0';
    context.moveTo(20, canvas.height - 40);
    context.lineTo(canvas.width - 20, canvas.height - 40);
    context.stroke();

    // Indication pour mettre en pause

    context.fillStyle = '#c0c0c0';
    context.textAlign = 'right';
    context.font = 'normal 14px "Press Start 2P", cursive';
    context.fillText('P = "pause"', canvas.width - 20, canvas.height - 12);
}