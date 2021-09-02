(function game() {
	const gameStart = document.querySelector('#game-start');
	const gameArea = document.querySelector('#game-area');
	const gameScoreValue = document.querySelector('#score-value');
	const gameScoreEl = document.querySelector('#game-score');
	const gameOverEl = document.querySelector('#game-over');
	const wizard = document.querySelector('#wizard');
	const classes = {
		fireBall: 'fire-ball',
		cloud: 'cloud',
		bug: 'bug',
	};

	const pressedKeys = new Set();

	const config = {
		speed: 2,
		movingMultiplier: 4,
		fireBallMultiplier: 5,
		fireInterval: 800,
		bugSpawnInterval: 1000,
		cloudSpawnInterval: 3000,
		bugKillScore: 1000,
	};

	const utils = {
		pxToNumber(val) {
			return +val.replace('px', '');
		},
		numberToPx(val) {
			return `${val}px`;
		},
		randomNumberBetween(min, max) {
			return Math.floor(Math.random() * max) + min;
		},
		hasCollision(el1, el2) {
			const el1Rect = el1.getBoundingClientRect();
			const el2Rect = el2.getBoundingClientRect();

			return !(
				el1Rect.top > el2Rect.bottom ||
				el1Rect.bottom < el2Rect.top ||
				el1Rect.right < el2Rect.left ||
				el1Rect.left > el2Rect.right
			);
		},
	};

	const scene = {
		get fireBalls() {
			return Array.from(document.querySelectorAll('.fire-ball'));
		},
		get clouds() {
			return Array.from(document.querySelectorAll('.cloud'));
		},
		get bugs() {
			return Array.from(document.querySelectorAll('.bug'));
		},
	};

	const wizardCoordinates = {
		wizard,
		set x(newX) {
			if (newX < 0) {
				newX = 0;
			} else if (newX + wizard.offsetWidth > gameArea.offsetWidth) {
				newX = gameArea.offsetWidth - wizard.offsetWidth;
			}
			this.wizard.style.left = utils.numberToPx(newX);
		},
		get x() {
			return utils.pxToNumber(this.wizard.style.left);
		},
		set y(newY) {
			if (newY < 0) {
				newY = 0;
			} else if (newY + wizard.offsetHeight > gameArea.offsetHeight) {
				newY = gameArea.offsetHeight - wizard.offsetHeight;
			}
			this.wizard.style.top = utils.numberToPx(newY);
		},
		get y() {
			return utils.pxToNumber(this.wizard.style.top);
		},
	};

	function createGameplay() {
		return {
			loopID: null,
			nextRenderQueue: [],
			lastFireBallTimestamp: 0,
			lastBugSpawnTimestamp: 0,
			lastCloudSpawnTimestamp: 0,
			colorLevelsTimestamp: 0,
		};
	}

	let gameplay;

	function init() {
		gameplay = createGameplay();
		gameScoreValue.innerHTML = 0;
		wizardCoordinates.x = 200;
		wizardCoordinates.y = 200;
		wizard.classList.remove('hide');
		gameOverEl.classList.add('hide');
		gameLoop();
	}

	function gameOver() {
		window.cancelAnimationFrame(gameplay.loopID);
		gameOverEl.classList.remove('hide');
		gameStart.classList.remove('hide');
	}

	function addGameElementFactory(className) {
		return function addElement(x, y) {
			const e = document.createElement('div');
			e.classList.add(className);
			e.style.left = utils.numberToPx(x);
			e.style.top = utils.numberToPx(y);
			gameArea.appendChild(e);
		};
	}

	const addFireBall = addGameElementFactory(classes.fireBall);
	const addCloud = addGameElementFactory(classes.cloud);
	const addBug = addGameElementFactory(classes.bug);

	const pressedKeyActionMap = {
		ArrowUp() {
			wizardCoordinates.y -= config.speed * config.movingMultiplier;
		},
		ArrowDown() {
			wizardCoordinates.y += config.speed * config.movingMultiplier;
		},
		ArrowLeft() {
			wizardCoordinates.x -= config.speed * config.movingMultiplier;
		},
		ArrowRight() {
			wizardCoordinates.x += config.speed * config.movingMultiplier;
		},
		Space(timestamp) {
			if (
				wizard.classList.contains('wizard-fire') ||
				timestamp - gameplay.lastFireBallTimestamp < config.fireInterval
			)
				return;
			addFireBall(
				wizardCoordinates.x + wizard.offsetWidth,
				wizardCoordinates.y + wizard.offsetHeight * 0.4
			);
			gameplay.lastFireBallTimestamp = timestamp;
			wizard.classList.add('wizard-fire');
			gameplay.nextRenderQueue = gameplay.nextRenderQueue.concat(function clearWizardFire() {
				if (pressedKeys.has('Space')) return false;
				wizard.classList.remove('wizard-fire');
				return true;
			});
		},
	};

	function onGameStart() {
		gameStart.classList.add('hide');
		init();
	}

	function processPressedKeys(timestamp) {
		pressedKeys.forEach((pressedKey) => {
			const handler = pressedKeyActionMap[pressedKey];
			if (handler) handler(timestamp);
		});
	}

	function processFireBalls() {
		scene.fireBalls.forEach((fireball) => {
			const newX =
				config.speed * config.fireBallMultiplier + utils.pxToNumber(fireball.style.left);
			if (newX > gameArea.offsetWidth) {
				fireball.remove();
				return;
			}
			fireball.style.left = utils.numberToPx(newX);
		});
	}

	function processNextRenderQueue() {
		gameplay.nextRenderQueue = gameplay.nextRenderQueue.reduce((acc, currFn) => {
			if (currFn()) return acc;
			return acc.concat(currFn);
		}, []);
	}

	function processGameElementFactory(
		addFn,
		elementWidth,
		gameplayTimestampName,
		className,
		configName,
		additiondalElementProcessor
	) {
		return function (timestamp) {
			if (timestamp - gameplay[gameplayTimestampName] > config[configName]) {
				const x = gameArea.offsetWidth;
				const y = utils.randomNumberBetween(0, gameArea.offsetHeight - elementWidth);
				addFn(x, y);
				gameplay[gameplayTimestampName] = timestamp;
			}
			scene[className].forEach((e) => {
				const newX = utils.pxToNumber(e.style.left) - config.speed;
				if (additiondalElementProcessor && additiondalElementProcessor(e)) return;
				if (newX + 200 < 0) e.remove();
				e.style.left = utils.numberToPx(newX);
			});
		};
	}

	function bugElementProcessor(bugEl) {
		const fireball = scene.fireBalls.find((fe) => utils.hasCollision(fe, bugEl));
		if (fireball) {
			fireball.remove();
			bugEl.remove();
			gameScoreValue.innerHTML = config.bugKillScore + +gameScoreValue.innerHTML;
			return true;
		}
		if (
			utils.hasCollision(bugEl, wizard)
			// || utils.pxToNumber(bugEl.style.left) <= 0 + bugEl.offsetWidth
		) {
			gameOver();
			return true;
		}
	}

	const procesClouds = processGameElementFactory(
		addCloud,
		200,
		'lastCloudSpawnTimestamp',
		'clouds',
		'cloudSpawnInterval'
	);
	const processBug = processGameElementFactory(
		addBug,
		60,
		'lastBugSpawnTimestamp',
		'bugs',
		'bugSpawnInterval',
		bugElementProcessor
	);

	function applyGravity() {
		const isInAir = wizardCoordinates.y !== gameArea.offsetHeight - wizard.offsetHeight;
		if (isInAir) wizardCoordinates.y += config.speed;
	}

	const levels = [
		[10000, 'orange', 'violet', 2],
		[20000, 'red', 'black', 4],
		[40000, 'crimson', 'blue', 5],
		[50000, 'red', 'black', 6],
		[60000, 'lime', 'violet', 7],
	];

	let counter = 0;
	let classNameToRemove = '';
	function speedyBoi() {
		if (+gameScoreValue.innerHTML > levels[counter][0]) {
			if (classNameToRemove) gameArea.classList.remove(classNameToRemove);
			++counter;
			config.fireInterval -= 150;
			gameScoreEl.style.color = levels[counter][1];
			gameArea.classList.add(levels[counter][2]);
			config.speed = levels[counter][3];
			classNameToRemove = levels[counter][2];
		}
	}

	function gameLoop(timestamp) {
		gameplay.loopID = window.requestAnimationFrame(gameLoop);
		processPressedKeys(timestamp);
		applyGravity(timestamp);
		speedyBoi(timestamp);
		processNextRenderQueue(timestamp);
		procesClouds(timestamp);
		processBug(timestamp);
		processFireBalls(timestamp);
		gameScoreValue.innerHTML++;
	}

	gameStart.addEventListener('click', onGameStart);

	document.addEventListener('keydown', ({ code }) => pressedKeys.add(code));
	document.addEventListener('keyup', ({ code }) => pressedKeys.delete(code));
})();
