const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 800,
    physics: {
        default: 'arcade',
        arcade: { debug: false }
    },
    scene: [Shooter]
};

const game = new Phaser.Game(config);