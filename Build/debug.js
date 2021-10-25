"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/// <reference path = "../DTS/pixi.d.ts"/>
var Tetris;
/// <reference path = "../DTS/pixi.d.ts"/>
(function (Tetris) {
    Tetris.Texture = PIXI.utils.TextureCache, Tetris.Sprite = PIXI.Sprite, Tetris.loader = PIXI.Loader.shared, Tetris.tickerShared = PIXI.Ticker.shared, Tetris.SpriteArray = {}, Tetris.compoundCorrectness = [0, 0, 0];
})(Tetris || (Tetris = {}));
var Tetris;
(function (Tetris) {
    Tetris.style = {
        fontFamily: 'MS Courier New',
        fontSize: 48,
        fontStyle: '',
        fontWeight: 'bold',
        fill: ['#00ff99'],
        stroke: '#4a1850',
        strokeThickness: 2,
        dropShadow: true,
        dropShadowColor: '#d4d4d4',
        dropShadowBlur: 4,
        dropShadowAngle: Math.PI / 6,
        dropShadowDistance: 6,
        wordWrap: true,
        wordWrapWidth: 440,
    }, Tetris.styleMenu = {
        fontFamily: 'Arial',
        fontSize: 48,
        fill: ['#ffffff'],
        fontWeight: 'bold'
    }, Tetris.styleMenuBtn = {
        fontFamily: 'Arial',
        fontSize: 24,
        fill: ['#ffffff'],
        fontWeight: 'bold'
    }, Tetris.boxWidth = 35, Tetris.boxHeight = 35, Tetris.assetList = ["backgroundShader", "backgroundStars", "but_restart", "buttonStock1d", "but_exit", "PlayBtn", "emoticon1", "emoticon2", "particle", "Sparks"], Tetris.assetListSprite = ["cards"], Tetris.globalResources = {}, Tetris.particleJson = {
        "alpha": {
            "start": 1,
            "end": 1
        },
        "scale": {
            "start": 1.5,
            "end": 0.2,
            "minimumScaleMultiplier": 1
        },
        "color": {
            "start": "#db8a21",
            "end": "#dec77c"
        },
        "speed": {
            "start": 200,
            "end": 50,
            "minimumSpeedMultiplier": 1
        },
        "acceleration": {
            "x": 0,
            "y": 0
        },
        "maxSpeed": 0,
        "startRotation": {
            "min": 180,
            "max": 360
        },
        "noRotation": false,
        "rotationSpeed": {
            "min": 0,
            "max": 0
        },
        "lifetime": {
            "min": 0.2,
            "max": 3
        },
        "blendMode": "normal",
        "frequency": 0.005,
        "emitterLifetime": -1,
        "maxParticles": 500,
        "pos": {
            "x": 0,
            "y": 0
        },
        "addAtBack": false,
        "spawnType": "rect",
        "spawnRect": {
            "x": 0,
            "y": 0,
            "w": 100,
            "h": 100
        }
    }, Tetris.ticker = Tetris.tickerShared;
})(Tetris || (Tetris = {}));
var Tetris;
(function (Tetris) {
    var DraggingShape = /** @class */ (function (_super) {
        __extends(DraggingShape, _super);
        function DraggingShape(elementName, electronCount) {
            var _this = _super.call(this) || this;
            _this.collisionActive = true;
            _this.dragging = false;
            _this.elementName = "";
            _this.electronCount = 0;
            if (elementName) {
                _this.elementName = elementName;
            }
            if (electronCount) {
                _this.electronCount = electronCount;
            }
            _this.on('mousedown', _this.HandleMouseDown, _this);
            _this.on('mousemove', _this.HandleMouseMove, _this);
            _this.on('mouseup', _this.HandleMouseUp, _this);
            _this.dragging = false;
            return _this;
        }
        DraggingShape.prototype.CheckForCollision = function (withElement) {
            var isCollision = false;
            var ypos = this.y;
            var xpos = this.x;
            if (xpos >= withElement.x - 20 && xpos <= withElement.x + 20 && ypos >= withElement.y - 20 && ypos <= withElement.y + 20) {
                if (this.elementName = withElement.elementName) {
                    isCollision = true;
                }
            }
            return isCollision;
        };
        DraggingShape.prototype.HandleMouseDown = function (e) {
            console.log('Picked up');
            this.x = e.data.global.x - this.width;
            this.y = e.data.global.y;
            this.dragging = true;
        };
        DraggingShape.prototype.HandleMouseMove = function (e) {
            if (this.dragging) {
                console.log('Moving');
                this.x = e.data.global.x - this.width;
                this.y = e.data.global.y;
            }
            //this.dragging = false;
        };
        DraggingShape.prototype.HandleMouseUp = function (e) {
            console.log('Moving');
            this.x = e.data.global.x - this.width;
            this.y = e.data.global.y;
            this.dragging = false;
        };
        return DraggingShape;
    }(PIXI.Graphics));
    Tetris.DraggingShape = DraggingShape;
})(Tetris || (Tetris = {}));
var Tetris;
(function (Tetris) {
    var DroppableShape = /** @class */ (function (_super) {
        __extends(DroppableShape, _super);
        function DroppableShape(elementName, electronCount) {
            var _this = _super.call(this) || this;
            _this.collisionActive = true;
            _this.elementName = "";
            _this.electronCount = 0;
            if (elementName) {
                _this.elementName = elementName;
            }
            if (electronCount) {
                _this.electronCount = electronCount;
            }
            return _this;
        }
        DroppableShape.prototype.CheckForCollision = function (withElement) {
            var isCollision = false;
            var ypos = this.y;
            var xpos = this.x;
            if (xpos >= withElement.x - 20 && xpos <= withElement.x + 20 && ypos >= withElement.y - 20 && ypos <= withElement.y + 20) {
                if (this.elementName = withElement.elementName) {
                    isCollision = true;
                }
            }
            return isCollision;
        };
        return DroppableShape;
    }(PIXI.Graphics));
    Tetris.DroppableShape = DroppableShape;
})(Tetris || (Tetris = {}));
var Tetris;
(function (Tetris) {
    var Keyboard = /** @class */ (function () {
        function Keyboard(value, isAxisButton) {
            this.key = {};
            this.value = value;
            this.isDown = false;
            this.isUp = true;
            this.isAxisButton = isAxisButton;
            this.subscribeEvents();
        }
        Keyboard.prototype.subscribeEvents = function () {
            window.addEventListener("keydown", this.downHandler.bind(this));
            window.addEventListener("keyup", this.upHandler.bind(this));
        };
        Keyboard.prototype.unSubscribeEvents = function () {
            window.removeEventListener("keydown", this.downHandler.bind(this));
            window.removeEventListener("keyup", this.upHandler.bind(this));
        };
        Keyboard.prototype.downHandler = function (event) {
            if (event.key === this.value) {
                this.press();
                event.preventDefault();
            }
        };
        Keyboard.prototype.upHandler = function (event) {
            if (event.key === this.value) {
                this.release();
                event.preventDefault();
            }
        };
        Keyboard.prototype.press = function () {
        };
        Keyboard.prototype.release = function () {
        };
        return Keyboard;
    }());
    Tetris.Keyboard = Keyboard;
})(Tetris || (Tetris = {}));
var Tetris;
(function (Tetris) {
    var LoadingController = /** @class */ (function () {
        function LoadingController(view) {
            this.view = view;
        }
        LoadingController.prototype.showLoadingScreen = function () {
            this.view.ShowLoadingScreen();
        };
        return LoadingController;
    }());
    Tetris.LoadingController = LoadingController;
})(Tetris || (Tetris = {}));
var Tetris;
(function (Tetris) {
    var view;
    var LoadingView = /** @class */ (function () {
        function LoadingView() {
            this.selectionButtons = [];
            this.mainContainer = new PIXI.Container();
            this.mainContainer.name = "LoadingScreenContainer";
            this.innerContainer = new PIXI.Container();
            this.innerContainer.name = "InnerLoadingScreenContainer";
            // this.mainContainer.addChild(this.innerContainer);
            this.AddBackgroundImage();
            this.createShapes();
            this.addAllToStage();
            this.mainContainer.visible = false;
            this.innerContainer.visible = false;
            this.resize();
        }
        LoadingView.prototype.ShowLoadingScreen = function () {
            this.mainContainer.visible = true;
            this.innerContainer.visible = true;
            window.onresize = this.resize.bind(this);
        };
        LoadingView.prototype.AddBackgroundImage = function () {
            var resourceBackground = Tetris.globalResources["backgroundStars"];
            this.backgroundImage = this.mainContainer.addChild(new Tetris.Sprite(resourceBackground.texture));
        };
        LoadingView.prototype.createShapes = function () {
            // let submitButton = new PIXI.Graphics();
            // submitButton.lineStyle(3, 0xff0000);
            // submitButton.beginFill(0xffffff, 1).drawRect(0, 0, 300, 50).endFill();
            // let submitText = new PIXI.Text("PLAY", style);
            // submitButton.addChild(submitText);
            // submitText.position.set(85,-5);
            // submitButton.on('mousedown', this.ContinueToTheGame,this);
            // submitButton.interactive = true;
            // submitButton.position.set(490,650);
            // this.innerContainer.addChild(submitButton);
        };
        LoadingView.prototype.ContinueToTheGame = function (gameIndex) {
            switch (gameIndex) {
                case 0:
                    Tetris.gameView = new Tetris.GameView1();
                    Tetris.gameController = new Tetris.GameController1(Tetris.gameView);
                    break;
                case 1:
                    Tetris.gameView = new Tetris.GameView2();
                    Tetris.gameController = new Tetris.GameController2(Tetris.gameView);
                    break;
                case 2:
                    Tetris.gameView = new Tetris.GameView3();
                    Tetris.gameController = new Tetris.GameController3(Tetris.gameView);
                    break;
            }
            Tetris.gameController.ShowTheGame();
            this.mainContainer.visible = false;
            this.innerContainer.visible = false;
        };
        LoadingView.prototype.addAllToStage = function () {
            Tetris.app.stage.addChild(this.mainContainer);
            Tetris.app.stage.addChild(this.innerContainer);
            this.addSelectionButtons();
        };
        LoadingView.prototype.addSelectionButtons = function () {
            var menuText = new PIXI.Text("CHOOSE FEATURE", Tetris.styleMenu);
            menuText.position.set(420, 170);
            this.innerContainer.addChild(menuText);
            var btnResource = Tetris.globalResources["buttonStock1d"];
            for (var i = 0; i < 3; i++) {
                this.selectionButtons[i] = new Tetris.Sprite(btnResource.texture);
                this.selectionButtons[i].on('mousedown', this.ContinueToTheGame.bind(this, i), this);
                this.selectionButtons[i].interactive = true;
                this.selectionButtons[i].anchor.set(0.5);
                this.selectionButtons[i].position.set(490 + this.selectionButtons[i].width / 2, 200 + 120 * i + this.selectionButtons[i].height / 2);
                var featureText = new PIXI.Text("", Tetris.styleMenuBtn);
                featureText.text = this.getText(i);
                featureText.x = (this.selectionButtons[i].width - featureText.width) / 2 - this.selectionButtons[i].width / 2;
                featureText.y = -20;
                this.selectionButtons[i].addChild(featureText);
                this.innerContainer.addChild(this.selectionButtons[i]);
            }
        };
        LoadingView.prototype.getText = function (gameIndex) {
            var textRt = "";
            switch (gameIndex) {
                case 0:
                    textRt = "SPRITE STACK";
                    break;
                case 1:
                    textRt = "MIXED TEXT";
                    break;
                case 2:
                    textRt = "PARTICLES";
                    break;
            }
            return textRt;
        };
        LoadingView.prototype.resize = function () {
            var scaleMax = Math.max(window.innerWidth / 1280, window.innerHeight / 720);
            this.mainContainer.pivot.set(640, 360);
            this.mainContainer.x = (window.innerWidth) / 2;
            this.mainContainer.y = (window.innerHeight) / 2;
            this.mainContainer.scale.set(scaleMax);
            var scaleMin = Math.min(window.innerWidth / 1280, window.innerHeight / 720);
            this.innerContainer.pivot.set(640, 360);
            this.innerContainer.x = (window.innerWidth) / 2;
            this.innerContainer.y = (window.innerHeight) / 2;
            this.innerContainer.scale.set(scaleMin);
        };
        return LoadingView;
    }());
    Tetris.LoadingView = LoadingView;
})(Tetris || (Tetris = {}));
var Tetris;
(function (Tetris) {
    var GameController1 = /** @class */ (function () {
        function GameController1(view) {
            this.left = new Tetris.Keyboard("ArrowLeft", true);
            this.up = new Tetris.Keyboard("ArrowUp", true);
            this.right = new Tetris.Keyboard("ArrowRight", true);
            this.down = new Tetris.Keyboard("ArrowDown", true);
            this.view = view;
        }
        GameController1.prototype.ShowTheGame = function () {
            this.view.ShowTheGame();
        };
        return GameController1;
    }());
    Tetris.GameController1 = GameController1;
})(Tetris || (Tetris = {}));
/// <reference path="../Keyboard.ts"/>
var Tetris;
/// <reference path="../Keyboard.ts"/>
(function (Tetris) {
    var view;
    var GameView1 = /** @class */ (function () {
        function GameView1() {
            this.cards = [];
            this.cardCounter = 144;
            this.totalNumberOfCards = 144;
            this.pathArr = [{ x: 450, y: 120 }, { x: 550, y: 140 }];
            this.pathArr1 = [{ x: 550, y: 140 }, { x: 640, y: 200 }, { x: 680, y: 320 }];
            this.tweensArray = [];
            this.mainContainer = new PIXI.Container();
            this.mainContainer.name = "Game1ScreenContainer";
            this.innerContainer = new PIXI.Container();
            this.innerContainer.name = "Game1InnerLoadingScreenContainer";
            this.initialContainer = new PIXI.Container();
            this.initialContainer.name = "Game1InitialContainer";
            this.finalContainer = new PIXI.Container();
            this.finalContainer.name = "Game1FinalContainer";
            this.innerContainer.addChild(this.initialContainer);
            this.innerContainer.addChild(this.finalContainer);
            this.AddBackgroundImage();
            this.addAllToStage();
            this.mainContainer.visible = false;
            this.innerContainer.visible = false;
            this.resize();
        }
        GameView1.prototype.AddBackgroundImage = function () {
            var resourceBackground = Tetris.globalResources["backgroundStars"];
            this.backgroundImage = this.mainContainer.addChild(new Tetris.Sprite(resourceBackground.texture));
        };
        GameView1.prototype.ShowTheGame = function () {
            this.mainContainer.visible = true;
            this.innerContainer.visible = true;
            window.onresize = this.resize.bind(this);
        };
        GameView1.prototype.addAllToStage = function () {
            Tetris.app.stage.addChild(this.mainContainer);
            Tetris.app.stage.addChild(this.innerContainer);
            this.createCardDeck();
            this.addPlayButton();
            this.addRestartButton();
        };
        GameView1.prototype.addPlayButton = function () {
            var btnResource = Tetris.globalResources["PlayBtn"];
            this.playbtn = new Tetris.Sprite(btnResource.texture);
            this.playbtn.on('mousedown', this.moveToOtherDeck, this);
            this.playbtn.interactive = true;
            this.playbtn.position.set(550, 550);
            this.playbtn.scale.set(0.5);
            this.innerContainer.addChild(this.playbtn);
        };
        GameView1.prototype.createCardDeck = function () {
            for (var i = 0; i < this.totalNumberOfCards; i++) {
                var randomCardNo = Math.floor(Math.random() * 37);
                var resourceCard = PIXI.Texture.from("cards_" + randomCardNo + ".png");
                this.cards[i] = new Tetris.Sprite(resourceCard);
                this.initialContainer.addChild(this.cards[i]);
                this.cards[i].position.set(400, 100 + i);
                this.cards[i].name = "Card" + i;
            }
        };
        GameView1.prototype.moveToOtherDeck = function () {
            this.playbtn.off('mousedown');
            this.moveTheCardToOtherDeck();
        };
        GameView1.prototype.moveTheCardToOtherDeck = function () {
            var currentNumber = this.cardCounter - 1;
            gsap.to(this.cards[this.cardCounter], {
                duration: 1,
                ease: "power1.inOut",
                motionPath: {
                    path: this.pathArr
                }
            });
            this.cardCounter--;
            if (this.cardCounter >= 0) {
                setTimeout(this.moveTheCardToOtherDeck.bind(this), 1000);
                setTimeout(this.moveTheCardToOtherDeckFinal.bind(this, currentNumber), 1005);
            }
        };
        GameView1.prototype.moveTheCardToOtherDeckFinal = function (currentNumber) {
            this.finalContainer.addChild(this.cards[currentNumber]);
            gsap.to(this.cards[currentNumber], {
                duration: 1,
                ease: "power1.inOut",
                motionPath: {
                    path: this.pathArr1
                }
            });
            setTimeout(this.addToFinalContainer.bind(this, currentNumber), 1020);
        };
        GameView1.prototype.addToFinalContainer = function (currentNumber) {
            this.cards[currentNumber].y += this.totalNumberOfCards - currentNumber;
        };
        GameView1.prototype.resize = function () {
            var scaleMax = Math.max(window.innerWidth / 1280, window.innerHeight / 720);
            this.mainContainer.pivot.set(640, 360);
            this.mainContainer.x = (window.innerWidth) / 2;
            this.mainContainer.y = (window.innerHeight) / 2;
            this.mainContainer.scale.set(scaleMax);
            var scaleMin = Math.min(window.innerWidth / 1280, window.innerHeight / 720);
            this.innerContainer.pivot.set(640, 360);
            this.innerContainer.x = (window.innerWidth) / 2;
            this.innerContainer.y = (window.innerHeight) / 2;
            this.innerContainer.scale.set(scaleMin);
        };
        GameView1.prototype.createShape = function (shapeType) {
        };
        GameView1.prototype.addRestartButton = function () {
            var btnResource = Tetris.globalResources["but_exit"];
            this.restartBtn = new Tetris.Sprite(btnResource.texture);
            this.restartBtn.on('mousedown', this.ContinueToLoading, this);
            this.restartBtn.interactive = true;
            this.restartBtn.position.set(700, 50);
            this.restartBtn.scale.set(0.5);
            this.innerContainer.addChild(this.restartBtn);
        };
        GameView1.prototype.endGameAndDestroy = function () {
            this.mainContainer.destroy();
            this.innerContainer.destroy();
            Tetris.gameView = null;
            Tetris.gameController = null;
        };
        GameView1.prototype.ContinueToLoading = function () {
            this.endGameAndDestroy();
            Tetris.loadingController.showLoadingScreen();
        };
        return GameView1;
    }());
    Tetris.GameView1 = GameView1;
})(Tetris || (Tetris = {}));
var Tetris;
(function (Tetris) {
    var GameController2 = /** @class */ (function () {
        function GameController2(view) {
            this.left = new Tetris.Keyboard("ArrowLeft", true);
            this.up = new Tetris.Keyboard("ArrowUp", true);
            this.right = new Tetris.Keyboard("ArrowRight", true);
            this.down = new Tetris.Keyboard("ArrowDown", true);
            this.view = view;
        }
        GameController2.prototype.ShowTheGame = function () {
            var _this = this;
            this.view.ShowTheGame();
            this.left.press = function () {
                _this.view.moveFormLeft();
            };
            this.up.press = function () {
                _this.view.rotateForm();
            };
            this.right.press = function () {
                _this.view.moveFormRight();
            };
            this.down.press = function () {
                _this.view.hardDown();
            };
        };
        return GameController2;
    }());
    Tetris.GameController2 = GameController2;
})(Tetris || (Tetris = {}));
/// <reference path="../Keyboard.ts"/>
var Tetris;
/// <reference path="../Keyboard.ts"/>
(function (Tetris) {
    var view;
    var GameView2 = /** @class */ (function () {
        function GameView2() {
            this.textArr = [];
            this.emtArr = [];
            this.mainContainer = new PIXI.Container();
            this.mainContainer.name = "Game2ScreenContainer";
            this.innerContainer = new PIXI.Container();
            this.innerContainer.name = "Game2InnerLoadingScreenContainer";
            this.textContainer = new PIXI.Container();
            this.textContainer.name = "textContainer";
            this.textContainer.position.set(450, 200);
            this.innerContainer.addChild(this.textContainer);
            this.randomText = "Lorem ipsum dolor sit";
            this.mainContainer.visible = false;
            this.innerContainer.visible = false;
            this.AddBackgroundImage();
            this.addAllToStage();
            this.resize();
        }
        GameView2.prototype.AddBackgroundImage = function () {
            var resourceBackground = Tetris.globalResources["backgroundStars"];
            this.backgroundImage = this.mainContainer.addChild(new Tetris.Sprite(resourceBackground.texture));
        };
        GameView2.prototype.ShowTheGame = function () {
            this.mainContainer.visible = true;
            this.innerContainer.visible = true;
            window.onresize = this.resize.bind(this);
        };
        GameView2.prototype.addAllToStage = function () {
            Tetris.app.stage.addChild(this.mainContainer);
            Tetris.app.stage.addChild(this.innerContainer);
            this.selectRandomTextAndEmoticon();
            this.addRestartButton();
        };
        GameView2.prototype.selectRandomTextAndEmoticon = function () {
            var fontSizeRn = 18 + Math.floor(Math.random() * (20));
            for (var i = 0; i < 3; i++) {
                var randomSelection = Math.floor(Math.random() * 2);
                if (randomSelection == 0) {
                    var startIndex = Math.floor(Math.random() * (this.randomText.length - 10));
                    var endIndex = startIndex + Math.floor(Math.random() * (this.randomText.length - startIndex + 1));
                    var randomText = this.randomText.substring(startIndex, endIndex);
                    var textNew = new PIXI.Text(randomText, Tetris.styleMenu);
                    textNew.style.fontSize = fontSizeRn;
                    if (this.textArr.length > 0) {
                        textNew.x = this.textArr[this.textArr.length - 1].width + this.textArr[this.textArr.length - 1].x + 5;
                    }
                    else {
                        textNew.x = 0;
                    }
                    this.textArr.push(textNew);
                    this.textContainer.addChild(textNew);
                }
                else {
                    var emrandomSelection = Math.floor(Math.random() * 2);
                    var resourceEm = void 0;
                    if (emrandomSelection == 0) {
                        resourceEm = Tetris.globalResources["emoticon1"];
                    }
                    else {
                        resourceEm = Tetris.globalResources["emoticon2"];
                    }
                    var sprite = new Tetris.Sprite(resourceEm.texture);
                    sprite.height = fontSizeRn + 5;
                    sprite.width = fontSizeRn + 5;
                    if (this.textArr.length > 0) {
                        sprite.x = this.textArr[this.textArr.length - 1].width + this.textArr[this.textArr.length - 1].x + 5;
                    }
                    else {
                        sprite.x = 0;
                    }
                    this.textArr.push(sprite);
                    this.textContainer.addChild(sprite);
                }
            }
            setTimeout(this.destroyAllAndReset.bind(this), 2000);
        };
        GameView2.prototype.destroyAllAndReset = function () {
            for (var i = 0; i < this.textArr.length; i++) {
                this.textArr[i].destroy();
            }
            this.textArr = [];
            setTimeout(this.selectRandomTextAndEmoticon.bind(this), 200);
        };
        GameView2.prototype.resize = function () {
            var scaleMax = Math.max(window.innerWidth / 1280, window.innerHeight / 720);
            this.mainContainer.pivot.set(640, 360);
            this.mainContainer.x = (window.innerWidth) / 2;
            this.mainContainer.y = (window.innerHeight) / 2;
            this.mainContainer.scale.set(scaleMax);
            var scaleMin = Math.min(window.innerWidth / 1280, window.innerHeight / 720);
            this.innerContainer.pivot.set(640, 360);
            this.innerContainer.x = (window.innerWidth) / 2;
            this.innerContainer.y = (window.innerHeight) / 2;
            this.innerContainer.scale.set(scaleMin);
        };
        GameView2.prototype.createShape = function (shapeType) {
        };
        GameView2.prototype.addRestartButton = function () {
            var btnResource = Tetris.globalResources["but_exit"];
            this.restartBtn = new Tetris.Sprite(btnResource.texture);
            this.restartBtn.on('mousedown', this.ContinueToLoading, this);
            this.restartBtn.interactive = true;
            this.restartBtn.position.set(700, 50);
            this.restartBtn.scale.set(0.5);
            this.innerContainer.addChild(this.restartBtn);
        };
        GameView2.prototype.endGameAndDestroy = function () {
            this.mainContainer.destroy();
            this.innerContainer.destroy();
            Tetris.gameView = null;
            Tetris.gameController = null;
        };
        GameView2.prototype.ContinueToLoading = function () {
            this.endGameAndDestroy();
            Tetris.loadingController.showLoadingScreen();
        };
        return GameView2;
    }());
    Tetris.GameView2 = GameView2;
})(Tetris || (Tetris = {}));
var Tetris;
(function (Tetris) {
    var GameController3 = /** @class */ (function () {
        function GameController3(view) {
            this.left = new Tetris.Keyboard("ArrowLeft", true);
            this.up = new Tetris.Keyboard("ArrowUp", true);
            this.right = new Tetris.Keyboard("ArrowRight", true);
            this.down = new Tetris.Keyboard("ArrowDown", true);
            this.view = view;
        }
        GameController3.prototype.ShowTheGame = function () {
            var _this = this;
            this.view.ShowTheGame();
            this.left.press = function () {
                _this.view.moveFormLeft();
            };
            this.up.press = function () {
                _this.view.rotateForm();
            };
            this.right.press = function () {
                _this.view.moveFormRight();
            };
            this.down.press = function () {
                _this.view.hardDown();
            };
        };
        return GameController3;
    }());
    Tetris.GameController3 = GameController3;
})(Tetris || (Tetris = {}));
/// <reference path="../Keyboard.ts"/>
var Tetris;
/// <reference path="../Keyboard.ts"/>
(function (Tetris) {
    var view;
    var GameView3 = /** @class */ (function () {
        function GameView3() {
            this.mainContainer = new PIXI.Container();
            this.mainContainer.name = "Game2ScreenContainer";
            this.innerContainer = new PIXI.Container();
            this.innerContainer.name = "Game2InnerLoadingScreenContainer";
            this.emitterContainer = new PIXI.Container();
            this.emitterContainer.name = "emitterContainer";
            this.innerContainer.addChild(this.emitterContainer);
            this.AddBackgroundImage();
            this.addAllToStage();
            this.mainContainer.visible = false;
            this.innerContainer.visible = false;
            this.resize();
        }
        GameView3.prototype.AddBackgroundImage = function () {
            var resourceBackground = Tetris.globalResources["backgroundStars"];
            this.backgroundImage = this.mainContainer.addChild(new Tetris.Sprite(resourceBackground.texture));
        };
        GameView3.prototype.ShowTheGame = function () {
            this.mainContainer.visible = true;
            this.innerContainer.visible = true;
            window.onresize = this.resize.bind(this);
        };
        GameView3.prototype.addAllToStage = function () {
            Tetris.app.stage.addChild(this.mainContainer);
            Tetris.app.stage.addChild(this.innerContainer);
            this.showParticleAnimation();
            this.addRestartButton();
        };
        GameView3.prototype.resize = function () {
            var scaleMax = Math.max(window.innerWidth / 1280, window.innerHeight / 720);
            this.mainContainer.pivot.set(640, 360);
            this.mainContainer.x = (window.innerWidth) / 2;
            this.mainContainer.y = (window.innerHeight) / 2;
            this.mainContainer.scale.set(scaleMax);
            var scaleMin = Math.min(window.innerWidth / 1280, window.innerHeight / 720);
            this.innerContainer.pivot.set(640, 360);
            this.innerContainer.x = (window.innerWidth) / 2;
            this.innerContainer.y = (window.innerHeight) / 2;
            this.innerContainer.scale.set(scaleMin);
        };
        GameView3.prototype.showParticleAnimation = function () {
            this.emitterContainer.position.set(580, 450);
            this.particleEmitter = new PIXI.particles.Emitter(this.emitterContainer, [PIXI.Texture.from("Assets/particle.png"), PIXI.Texture.from("Assets/Sparks.png")], Tetris.particleJson);
            this.particleEmitter.emit = true;
            this.particleEmitter.autoUpdate = true;
        };
        GameView3.prototype.createShape = function (shapeType) {
        };
        GameView3.prototype.addRestartButton = function () {
            var btnResource = Tetris.globalResources["but_exit"];
            this.restartBtn = new Tetris.Sprite(btnResource.texture);
            this.restartBtn.on('mousedown', this.ContinueToLoading, this);
            this.restartBtn.interactive = true;
            this.restartBtn.position.set(700, 50);
            this.restartBtn.scale.set(0.5);
            this.innerContainer.addChild(this.restartBtn);
        };
        GameView3.prototype.endGameAndDestroy = function () {
            this.mainContainer.destroy();
            this.innerContainer.destroy();
            Tetris.gameView = null;
            Tetris.gameController = null;
        };
        GameView3.prototype.ContinueToLoading = function () {
            this.endGameAndDestroy();
            Tetris.loadingController.showLoadingScreen();
        };
        return GameView3;
    }());
    Tetris.GameView3 = GameView3;
})(Tetris || (Tetris = {}));
/// <reference path="./Alias.ts" />
/// <reference path="./Constants.ts"/>
/// <reference path="./DraggingShape.ts"/>
/// <reference path="./DroppableShape.ts"/>
/// <reference path="./Loading/Controller.ts"/>
/// <reference path="./Loading/View.ts"/>
/// <reference path="./Game1/Controller.ts"/>
/// <reference path="./Game1/View.ts"/>
/// <reference path="./Game2/Controller.ts"/>
/// <reference path="./Game2/View.ts"/>
/// <reference path="./Game3/Controller.ts"/>
/// <reference path="./Game3/View.ts"/>
var Tetris;
/// <reference path="./Alias.ts" />
/// <reference path="./Constants.ts"/>
/// <reference path="./DraggingShape.ts"/>
/// <reference path="./DroppableShape.ts"/>
/// <reference path="./Loading/Controller.ts"/>
/// <reference path="./Loading/View.ts"/>
/// <reference path="./Game1/Controller.ts"/>
/// <reference path="./Game1/View.ts"/>
/// <reference path="./Game2/Controller.ts"/>
/// <reference path="./Game2/View.ts"/>
/// <reference path="./Game3/Controller.ts"/>
/// <reference path="./Game3/View.ts"/>
(function (Tetris) {
    var Main = /** @class */ (function () {
        function Main() {
            Tetris.app = new PIXI.Application({ resizeTo: window, backgroundColor: 0x000000, antialias: true, resolution: 1 });
            Tetris.app.stage.interactive = true;
            document.body.appendChild(Tetris.app.view);
            this.loadAllImages();
        }
        Main.prototype.InitializeLoadingScreen = function () {
            Tetris.loadingView = new Tetris.LoadingView();
            Tetris.loadingController = new Tetris.LoadingController(Tetris.loadingView);
            Tetris.loadingController.showLoadingScreen();
        };
        Main.prototype.loadAllImages = function () {
            this.loadGeneralImages();
        };
        Main.prototype.loadGeneralImages = function () {
            for (var imageid in Tetris.assetList) {
                Tetris.loader.add(Tetris.assetList[imageid], "Assets/" + Tetris.assetList[imageid] + ".png");
            }
            Tetris.loader.load(this.loadSpriteSheet.bind(this));
        };
        Main.prototype.loadSpriteSheet = function (loader, resources) {
            Tetris.globalResources = resources;
            for (var imageid in Tetris.assetListSprite) {
                loader.add(Tetris.assetListSprite[imageid], "Assets/" + Tetris.assetListSprite[imageid] + ".json");
            }
            loader.load(this.StartInitialize.bind(this));
        };
        Main.prototype.StartInitialize = function (loader, resources) {
            Tetris.globalResources = resources;
            this.InitializeLoadingScreen();
        };
        return Main;
    }());
    Tetris.Main = Main;
})(Tetris || (Tetris = {}));
/// <reference path="main.ts" />
var Tetris;
/// <reference path="main.ts" />
(function (Tetris) {
    var instance = new Tetris.Main();
})(Tetris || (Tetris = {}));
