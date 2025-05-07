class Shooter extends Phaser.Scene {
    constructor() {
        super({ key: 'Shooter' });
    }

    preload() {
        this.load.image('player', 'assets/images/playerShip2_blue.png');
        this.load.image('enemyYellow', 'assets/images/shipYellow_manned.png');
        this.load.image('enemyPink', 'assets/images/shipPink_manned.png');
        this.load.image('laserBlue', 'assets/images/laserBlue04.png');
        this.load.image('laserPink', 'assets/images/laserPink1.png');
        this.load.image('laserYellow', 'assets/images/laserYellow1.png');
        this.load.image('laserRed06', 'assets/images/laserRed06.png');
        this.load.image('laserRed11', 'assets/images/laserRed11.png');
        this.load.image('burstPink', 'assets/images/laserPink_groundBurst.png');
        this.load.image('burstYellow', 'assets/images/laserYellow_groundBurst.png');
        this.load.image('buttonBlue', 'assets/images/buttonBlue.png');
        this.load.image('meteor', 'assets/images/meteorBrown_small1.png');
        this.load.audio('explosion', 'assets/audio/explosionCrunch_001.ogg');
    }

    create() {
        this.score = 0;
        this.health = 3;
        this.gameStarted = false;
        this.enemyCount = 0;
        this.level = 1;
        this.highScores = JSON.parse(localStorage.getItem('highScores')) || [];

        this.meteor = this.add.tileSprite(400, 500, 800, 1000, 'meteor').setAlpha(0.2);

        this.startButton = this.add.image(400, 500, 'buttonBlue').setInteractive().on('pointerdown', () => this.startGame());
        this.startText = this.add.text(350, 490, 'START', { fontSize: '24px', fill: '#222', fontWeight: 'bold' });

        this.restartButton = this.add.image(400, 500, 'buttonBlue').setInteractive().setVisible(false).on('pointerdown', () => this.scene.restart({ skipStart: true }));
        this.restartText = this.add.text(340, 490, 'RESTART', { fontSize: '24px', fill: '#222', fontWeight: 'bold' }).setVisible(false);

        this.saveScoreButton = this.add.image(400, 560, 'buttonBlue').setInteractive().setVisible(false).on('pointerdown', () => this.saveScore());
        this.saveScoreText = this.add.text(325, 550, 'SAVE SCORE', { fontSize: '24px', fill: '#222', fontWeight: 'bold' }).setVisible(false);

        this.restartText = this.add.text(340, 490, 'RESTART', { fontSize: '24px', fill: '#222', fontWeight: 'bold' }).setVisible(false);

        this.nextLevelButton = this.add.image(400, 500, 'buttonBlue').setInteractive().setVisible(false).on('pointerdown', () => this.startNextLevel());
        this.nextLevelText = this.add.text(330, 490, 'NEXT LEVEL', { fontSize: '24px', fill: '#222', fontWeight: 'bold' }).setVisible(false);

        this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '20px', fill: '#FFF' });
        this.healthText = this.add.text(650, 16, 'Lives: ♥♥♥', { fontSize: '20px', fill: '#FFF' });

        this.toggleScoresButton = this.add.image(400, 620, 'buttonBlue').setInteractive().setVisible(false).on('pointerdown', () => this.toggleLeaderboard());

        this.toggleScoresText = this.add.text(305, 610, 'SHOW SCORES', {fontSize: '24px',fill: '#222',fontWeight: 'bold'}).setVisible(false);

        this.leaderboardTexts = [];for (let i = 0; i < 5; i++) {let text = this.add.text(250, 660 + i * 30, '', {fontSize: '20px',fill: '#FFF'}).setVisible(false);this.leaderboardTexts.push(text);}
    }

    toggleLeaderboard() {
        const isVisible = this.leaderboardTexts[0].visible;
        const newState = !isVisible;
        this.leaderboardTexts.forEach((t, i) => {
            if (this.highScores[i] !== undefined) {
                t.setText(`${i + 1}. ${this.highScores[i]}`).setVisible(newState);
            } else {
                t.setVisible(false);
            }
        });
        this.toggleScoresText.setText(newState ? 'HIDE SCORES' : 'SHOW SCORES');
    }

    startGame() {
        this.gameStarted = true;
        this.startButton.setVisible(false);
        this.startText.setVisible(false);

        this.player = this.physics.add.sprite(400, 950, 'player').setCollideWorldBounds(true);
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.playerLasers = this.physics.add.group();
        this.enemyLasers = this.physics.add.group();
        this.enemies = this.physics.add.group();

        this.spawnInitialEnemies();

        this.physics.add.overlap(this.playerLasers, this.enemies, this.hitEnemy, null, this);
        this.physics.add.overlap(this.enemyLasers, this.player, this.hitPlayer, null, this);

        this.toggleScoresButton.setVisible(false);
        this.toggleScoresText.setVisible(false);
        this.leaderboardTexts.forEach(t => t.setVisible(false));
    }

    startNextLevel() {
        this.level++;
        this.enemyCount = 0;
        this.health = 3;
        this.healthText.setText('Lives: ♥♥♥');
        this.nextLevelButton.setVisible(false);
        this.nextLevelText.setVisible(false);
        this.clearEnemiesAndBullets();
        this.gameStarted = true;
        this.spawnInitialEnemies();
        this.toggleScoresButton.setVisible(false);
        this.toggleScoresText.setVisible(false);
        this.leaderboardTexts.forEach(t => t.setVisible(false));
    }

    clearEnemiesAndBullets() {
        this.enemies.clear(true, true);
        this.enemyLasers.clear(true, true);
        this.playerLasers.clear(true, true);
    }

    update() {
        if (!this.gameStarted) return;

        this.meteor.tilePositionY += 1;

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-200);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(200);
        } else {
            this.player.setVelocityX(0);
        }

        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-200);
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(200);
        } else {
            this.player.setVelocityY(0);
        }

        if (Phaser.Input.Keyboard.JustDown(this.spaceBar)) {
            this.fireLaser();
        }

        Phaser.Actions.Call(this.enemies.getChildren(), enemy => {
            enemy.update();
        });
    }

    fireLaser() {
        let laser = this.playerLasers.create(this.player.x, this.player.y - 20, 'laserBlue');
        laser.setVelocityY(-300);
    }

    spawnInitialEnemies() {
        this.spawnSingleEnemy('enemyYellow');
        this.spawnSingleEnemy('enemyPink');
    }

    spawnSingleEnemy(type) {
        let enemy = this.enemies.create(Phaser.Math.Between(50, 750), 100, type);
        enemy.health = this.level === 1 ? 3 : 5;
        enemy.speed = this.level === 1 ? 0.5 : 0.3;
        enemy.type = type;
        enemy.direction = 1;
        enemy.tick = 0;

        enemy.update = () => {
            if (!this.gameStarted) return;

            if (enemy.type === 'enemyYellow') {
                enemy.tick++;
                enemy.x = 400 + 250 * Math.sin(enemy.tick * 0.01);
                enemy.y = 100 + 40 * Math.sin(enemy.tick * 0.02);
            } else {
                enemy.x += enemy.direction * 1.2;
                if (enemy.x >= 750 || enemy.x <= 50) enemy.direction *= -1;
            }
            if (Phaser.Math.Between(0, 1000) > 995) this.enemyFireLaser(enemy);
        };

        enemy.name = Phaser.Math.RND.uuid();
    }

    enemyFireLaser(enemy) {
        let laserType = this.level === 1
            ? (enemy.type === 'enemyYellow' ? 'laserRed11' : 'laserRed06')
            : (enemy.type === 'enemyYellow' ? 'laserYellow' : 'laserPink');

        let laser = this.enemyLasers.create(enemy.x, enemy.y + 20, laserType);
        laser.setVelocityY(100);
        laser.ownerId = enemy.name;
    }

    hitEnemy(laser, enemy) {
        laser.destroy();
        enemy.health--;
        if (enemy.health <= 0) {
            this.enemyLasers.getChildren().forEach(l => {
                if (l.ownerId === enemy.name) {
                    l.destroy();
                }
            });

            let burst = this.add.sprite(enemy.x, enemy.y, enemy.type === 'enemyYellow' ? 'burstYellow' : 'burstPink');
            this.time.delayedCall(1000, () => burst.destroy());

            enemy.destroy();
            this.sound.play('explosion');

            this.enemyCount++;
            this.score += enemy.type === 'enemyYellow' ? 100 : 150;
            this.scoreText.setText('Score: ' + this.score);

            if ((this.level === 1 && this.enemyCount >= 20) || (this.level === 2 && this.enemyCount >= 40)) {
                if (this.level === 1) {
                    this.nextLevelButton.setVisible(true);
                    this.nextLevelText.setVisible(true);
                } else {
                    this.endGame();
                }
                this.gameStarted = false;
            } else {
                if (this.enemies.countActive(true) < 2) {
                    this.spawnSingleEnemy(Phaser.Math.RND.pick(['enemyYellow', 'enemyPink']));
                }
            }
        }
    }

    hitPlayer(player, laser) {
        if (!this.gameStarted) return;
    
        laser.destroy();
        this.health--;
        this.healthText.setText('Lives: ' + '♥'.repeat(this.health));
    
        if (this.health <= 0) {
            this.gameStarted = false;
    
            this.highScores.push(this.score);
            this.highScores.sort((a, b) => b - a);
            localStorage.setItem('highScores', JSON.stringify(this.highScores.slice(0, 10)));
    
            this.saveScoreButton.setVisible(true);
            this.saveScoreText.setVisible(true);
            this.restartButton.setVisible(true);
            this.restartText.setVisible(true);
            this.toggleScoresButton.setVisible(true);
            this.toggleScoresText.setVisible(true);
    
            this.player.destroy();
        }
    }

    endGame() {
        this.gameStarted = false;
    
        this.highScores.push(this.score);
        this.highScores.sort((a, b) => b - a);
        localStorage.setItem('highScores', JSON.stringify(this.highScores.slice(0, 10)));
    
        this.saveScoreButton.setVisible(true);
        this.saveScoreText.setVisible(true);
        this.restartButton.setVisible(true);
        this.restartText.setVisible(true);

        this.toggleScoresButton.setVisible(true);
        this.toggleScoresText.setVisible(true);
    
        this.player.destroy();
    }
}