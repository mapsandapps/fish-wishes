var game = new Phaser.Game(1136, 640, Phaser.AUTO);

var GameState = {
  init: function() {
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL; // TODO: if we want to change this and make the game use the whole screen, the clickplate needs to cover all of it
    this.scale.pageAlignHorizontally = true;
    this.scale.pageAlignVertically = true;

    this.game.physics.startSystem(Phaser.Physics.ARCADE);

    this.SWIMMING_SPEED = 180;
  },
  preload: function() {
    this.load.text('level', 'assets/data/level.json');

    this.load.image('clickplate', 'assets/images/clickplate.png');
    this.load.image('background', 'assets/images/background.png');
    this.load.spritesheet('player', 'assets/images/player.png', 66, 100, 11, 0, 14);
    // TODO: can i have a shadow?
    this.load.image('lightGroundGreenHuge', 'assets/images/foreground/light_ground_green_huge.png');
    this.load.image('coralGreen1', 'assets/images/foreground/coral_green_1.png');
    this.load.image('coralGreen2', 'assets/images/foreground/coral_green_2.png');
    this.load.image('coralGreen3', 'assets/images/foreground/coral_green_3.png');
    this.load.image('coralGreen4', 'assets/images/foreground/coral_green_4.png');
    this.load.image('coralLeafy1', 'assets/images/foreground/coral_leafy_1.png');
    this.load.image('coralMushroom1', 'assets/images/foreground/coral_mushroom_1.png');
    this.load.image('coralPurple1', 'assets/images/foreground/coral_purple_1.png');
    this.load.image('coralPurple2', 'assets/images/foreground/coral_purple_2.png');
    this.load.image('darkGroundGreen1', 'assets/images/foreground/dark_ground_green_1.png');
    this.load.image('darkGroundPurple1', 'assets/images/foreground/dark_ground_purple_1.png');
    this.load.image('darkGroundRock1', 'assets/images/foreground/dark_ground_rock_1.png');
    this.load.image('lightGroundGreen1', 'assets/images/foreground/light_ground_green_1.png');
    this.load.image('lightGroundOrange1', 'assets/images/foreground/light_ground_orange_1.png');
    this.load.image('lightGroundRock1', 'assets/images/foreground/light_ground_rock_1.png');
    this.load.image('lightGroundRock2', 'assets/images/foreground/light_ground_rock_2.png');
    this.load.image('lightGroundRock3', 'assets/images/foreground/light_ground_rock_3.png');
    // TODO: make transparancy not part of the body

    this.load.image('blowfish', 'assets/images/fish/blowfish.png');
    this.load.image('blue', 'assets/images/fish/blue.png');
    this.load.image('clam', 'assets/images/fish/clam.png');
    this.load.image('green', 'assets/images/fish/green.png');
    this.load.image('lightblue', 'assets/images/fish/lightblue.png');
    this.load.image('lightgreen', 'assets/images/fish/lightgreen.png');
    this.load.image('lileel', 'assets/images/fish/lileel.png');
    this.load.image('longeel', 'assets/images/fish/longeel.png');
    this.load.image('orange', 'assets/images/fish/orange.png');
    this.load.image('pink', 'assets/images/fish/pink.png');
    this.load.image('purple', 'assets/images/fish/purple.png');
    this.load.image('red', 'assets/images/fish/red.png');
    this.load.image('snail', 'assets/images/fish/snail.png');
    this.load.image('starfish', 'assets/images/fish/starfish.png');
    this.load.image('undead', 'assets/images/fish/undead.png');
  },
  create: function() {
    this.levelData = JSON.parse(this.game.cache.getText('level'));
    this.game.world.setBounds(0, 0, this.levelData.fieldSize.x, this.levelData.fieldSize.y);

    this.background = this.add.sprite(0, 0, 'background');

    this.player = this.add.sprite(this.levelData.playerStart.x, this.levelData.playerStart.y, 'player', 1);
    this.player.anchor.setTo(0.5);
    this.player.animations.add('swimming', [0, 1, 2, 1], 6, true);
    this.game.physics.arcade.enable(this.player);
    this.player.body.collideWorldBounds = true;

    var style = { font: '20px Arial', fill: '#fff' };
    this.fishSpecies = _.uniq(_.concat(_.map(this.levelData.foregroundData, 'hiding'), _.map(this.levelData.swimmingFish, 'sprite')));
    this.scoreText = this.game.add.text(10, 20, '0/' + this.fishSpecies.length + ' species collected', style);
    this.scoreText.fixedToCamera = true;
    // TODO: right align this; probably move to right side of screen

    this.caughtSpecies = []; // FIXME: should game state like this live somewhere else?

    this.createClickplate();
    this.createForegroundItems();
    this.createSwimmingFish();
  },
  createSwimmingFish: function() {
    this.swimmingFish = this.add.group();
    this.swimmingFish.enableBody = true;

    this.levelData.swimmingFish.forEach(function(element) {
      var fish = this.swimmingFish.create(element.x, element.y, element.sprite);
      fish.anchor.setTo(0.5);
      // TODO: animation
      fish.scale.x = _.random(0, 1) ? 1 : -1; // face some left and some right
      fish.inputEnabled = true;
      fish.events.onInputDown.add(this.collectFish, this);
      fish.customParams = {
        name: element.sprite
      };
    }, this);
  },
  createForegroundItems: function() {
    this.foregroundItems = this.add.group();
    this.foregroundItems.enableBody = true;

    this.levelData.foregroundData.forEach(function(element) {
      var item = this.foregroundItems.create(element.x, element.y, element.sprite);
      item.anchor.setTo(0.5, 1); // NOTE: the point marked in the levelData is the bottom center
      item.scale.x = element.scaleX;
      item.customParams = {
        hiding: element.hiding
      };
    }, this);
  },
  createClickplate: function() {
    this.clickplate = this.game.add.sprite(0, 0, 'clickplate');
    this.clickplate.anchor.setTo(0, 0);
    this.clickplate.fixedToCamera = true;
    this.clickplate.inputEnabled = true;
    this.clickplate.events.onInputDown.add(this.movePlayer, this);
    this.game.camera.follow(this.player);
    // NOTE: anything clickable need to be "above" the clickplate
  },
  movePlayer: function(sprite, pointer, customTarget) {
    this.player.targetX = pointer.worldX;
    this.player.targetY = pointer.worldY;
    console.log('moving from point:', Math.floor(this.player.x) + ',', Math.floor(this.player.y));
    console.log('moving to point:', Math.floor(this.player.targetX) + ',', Math.floor(this.player.targetY));
    if (this.player.x < this.player.targetX) {
      console.log('direction: right');
      this.player.scale.x = 1;
    } else {
      console.log('direction: left');
      this.player.scale.x = -1;
    }
    var duration = (this.game.physics.arcade.distanceToXY(this.player, this.player.targetX, this.player.targetY) / this.SWIMMING_SPEED) * 1000;
    this.player.animations.play('swimming');
    this.playerTween = this.game.add.tween(this.player).to({
      x: this.player.targetX,
      y: this.player.targetY
    }, duration, Phaser.Easing.Linear.None, true);
    this.playerTween.onComplete.add(function() {
      // this.player.animations.play('idleAnimation') // TODO
      this.player.animations.stop();
      this.player.frame = 1;
    }, this);
  },
  createLevel: function() {
  },
  update: function() {
    this.game.physics.arcade.overlap(this.player, this.foregroundItems, this.rustle, null, this);
  },
  rustle: function(player, item, playerShape, itemShape, equation) {
    // TODO: animate plant if player is moving while touching it
    if (item.customParams.hiding) {
      this.unhideFish(item.customParams.hiding, item.body);
      item.customParams.hiding = null;
    }
  },
  unhideFish: function(fishSprite, itemBody) {
    console.log('startled', fishSprite + '!');
    var fishX = itemBody.position.x + (itemBody.width / 2);
    var fishY = itemBody.position.y + (itemBody.height / 2);
    // TODO: do i want to add the fish to a group?
    var fish = this.add.sprite(fishX, fishY, fishSprite);
    fish.anchor.setTo(0.5);
    fish.customParams = {
      name: fishSprite
    };
    fish.scale.x = _.random(0, 1) ? 1 : -1; // face some left and some right
    fish.inputEnabled = true;
    fish.events.onInputDown.add(this.collectFish, this);
  },
  collectFish: function(fish, event) {
    console.log(fish.customParams.name, 'collected!');
    this.score += 1;
    // check for uniqueness of species
    if (_.includes(this.caughtSpecies, fish.customParams.name)) {
      console.log('duplicate of already caught');
    } else {
      console.log('new species!');
      this.caughtSpecies.push(fish.customParams.name);
      console.log('species caught:', JSON.stringify(this.caughtSpecies));
    }

    this.scoreText.text = this.caughtSpecies.length + '/' + this.fishSpecies.length + ' species collected';
    // TODO: possibly freeze the UI and animate the player to the fish before collection
    // TODO: animate the fish disappearing
    // TODO: maybe temporarily change the player's z-index to be what the fish's was (change it back when the player moves)
    fish.kill();
    this.checkForWin();
  },
  checkForWin: function() {
    if (this.caughtSpecies.length >= this.fishSpecies.length) {
      console.log('you win!');
    } else {
      console.log('keep playing...');
    }
  }
};

game.state.add('GameState', GameState);
game.state.start('GameState');
