; (function game(){
    const gameStart = document.querySelector('.game-start');
    const gameArea = document.querySelector('.game-area');
    const gameScore = document.querySelector('.game-score');
    const gameOver = document.querySelector('.game-over');

    function onGameStart() {
        gameStart.classList.add('hide');
        addWizard();
        document.addEventListener('keydown', keydownHandler.bind(this));
        document.addEventListener('keyup', keyUpHandler.bind(this));
    }
    
    function addWizard() {
        const wizard = document.createElement('div');
        wizard.classList.add('wizard');
        wizard.style.top = '200px';
        wizard.style.left = '200px';
        gameArea.appendChild(wizard);
    }

    const pressedKeys = new Set();

    gameStart.addEventListener('click', onGameStart);

    function keydownHandler({code}) {
        pressedKeys.add(code);
        console.log(pressedKeys);
    }

    function keyUpHandler({code}) {
        pressedKeys.delete(code);
        console.log(pressedKeys);
    }

}())