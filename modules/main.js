; (function game() {
    const gameButtonEl = document.getElementById('game-button');
    const wizardEl = document.getElementById('wizard');
    const pointsEl = document.getElementById('points');
    const gameArea = document.getElementById('container');

    function launchFireball() {
        wizardEl.style.backgroundImage = "url('/images/wizard-fire.png')";
        const fireball = document.createElement('div');
        fireball.classList.add('fireball');
        fireball.style.top = `${+wizardEl.style.top.slice(0, -2) + 28}px`;
        fireball.style.left = `${+wizardEl.style.left.slice(0, -2) + 77}px`;
        gameArea.appendChild(fireball);
    }

    const keys = {
        ArrowUp: () => { if (Number(wizardEl.style.top.slice(0, -2)) >= 77) wizardEl.style.top = `${+wizardEl.style.top.slice(0,-2) - 77}px`},
        ArrowDown: () => { if (Number(wizardEl.style.top.slice(0, -2)) <= (window.screen.availHeight - 210)) wizardEl.style.top = `${+wizardEl.style.top.slice(0,-2) + 77}px`},
        ArrowLeft: () => {if (Number(wizardEl.style.left.slice(0, -2)) >= 44) wizardEl.style.left = `${+wizardEl.style.left.slice(0,-2) - 44}px`},
        ArrowRight: () => {if (Number(wizardEl.style.left.slice(0, -2)) <= (window.screen.availWidth - 120)) wizardEl.style.left = `${+wizardEl.style.left.slice(0,-2) + 44}px`},
        Space: () => {launchFireball()}
    };

    function keyDownHandler({code}) {
        if (keys.hasOwnProperty(code)) {
            keys[code]();
        };
    };

    function keyUpHandler({code}) {
        if (keys.hasOwnProperty(code)) {
            if (code === 'Space') {
                wizardEl.style.backgroundImage = "url('/images/wizard.png')";
            }
        }
    };

    function init() {
        wizardEl.style.left = '200px';
        wizardEl.style.top = '200px';
        wizardEl.classList.remove('hidden');

        document.addEventListener('keydown', keyDownHandler.bind(this));
        document.addEventListener('keyup', keyUpHandler.bind(this));
    };
 
    gameButtonEl.addEventListener('click', function handleButton() {
        gameButtonEl.classList.add('hidden');
        init();
    });

}());