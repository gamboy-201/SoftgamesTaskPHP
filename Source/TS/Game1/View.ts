/// <reference path="../Keyboard.ts"/>

namespace Tetris {
    let view: GameView1;
    export class GameView1 {
        public mainContainer: PIXI.Container;
        public innerContainer: PIXI.Container;
        public backgroundImage: PIXI.Sprite;
        public backgroundShader: PIXI.Sprite;
        public bg_full: PIXI.Sprite;
        public maskObj: PIXI.Graphics;
        private restartBtn:any;
        private playbtn: any;
        private cards: PIXI.Sprite[] = [];
        private initialContainer: PIXI.Container;
        private finalContainer: PIXI.Container;
        private cardCounter: number = 144;
        private totalNumberOfCards: number = 144;
        private moveInterval: any;
        private pathArr = [{ x: 450, y: 120 }, { x: 550, y: 140 }];
        private pathArr1 = [{ x: 550, y: 140 },{ x: 640, y: 200 }, { x: 680, y: 320 }];
        private tweensArray:any[] = []; 
        constructor() {
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


        protected AddBackgroundImage() {
            let resourceBackground = globalResources["backgroundStars"];
            this.backgroundImage = this.mainContainer.addChild(new Sprite(resourceBackground.texture));
        }

        public ShowTheGame(): void {
            this.mainContainer.visible = true;
            this.innerContainer.visible = true;
            window.onresize = this.resize.bind(this);
        }


        protected addAllToStage(): void {
            app.stage.addChild(this.mainContainer);
            app.stage.addChild(this.innerContainer);
            this.createCardDeck();
            this.addPlayButton();
            this.addRestartButton();
        }

        protected addPlayButton() {
            let btnResource = globalResources["PlayBtn"];
            this.playbtn = new Sprite(btnResource.texture);
            this.playbtn.on('mousedown', this.moveToOtherDeck, this);
            this.playbtn.interactive = true;
            this.playbtn.position.set(550, 550);
            this.playbtn.scale.set(0.5);
            this.innerContainer.addChild(this.playbtn);
        }

        protected createCardDeck(): void {
            for (let i = 0; i < this.totalNumberOfCards; i++) {
                let randomCardNo = Math.floor(Math.random() * 37);
                let resourceCard = PIXI.Texture.from(`cards_${randomCardNo}.png`);
                this.cards[i] = new Sprite(resourceCard);
                this.initialContainer.addChild(this.cards[i]);
                this.cards[i].position.set(400, 100 + i);
                this.cards[i].name = "Card" + i;
            }
        }

        protected moveToOtherDeck(): void {
            this.playbtn.off('mousedown');
            this.moveTheCardToOtherDeck();
        }

        protected moveTheCardToOtherDeck(): void {
            let currentNumber = this.cardCounter - 1;
            
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
                setTimeout(this.moveTheCardToOtherDeckFinal.bind(this,currentNumber), 1005);
            }
        }

        protected moveTheCardToOtherDeckFinal(currentNumber:number): void {
            this.finalContainer.addChild(this.cards[currentNumber]);
            gsap.to(this.cards[currentNumber], {
                duration: 1,
                ease: "power1.inOut",
                motionPath: {
                    path: this.pathArr1
                }
            });
            setTimeout(this.addToFinalContainer.bind(this,currentNumber), 1020);
        }

        protected addToFinalContainer(currentNumber:number):void{
            this.cards[currentNumber].y+= this.totalNumberOfCards-currentNumber;
        }

      


        protected resize(): void {
            let scaleMax = Math.max(window.innerWidth / 1280, window.innerHeight / 720);
            this.mainContainer.pivot.set(640, 360);
            this.mainContainer.x = (window.innerWidth) / 2;
            this.mainContainer.y = (window.innerHeight) / 2;
            this.mainContainer.scale.set(scaleMax);

            let scaleMin = Math.min(window.innerWidth / 1280, window.innerHeight / 720);
            this.innerContainer.pivot.set(640, 360);
            this.innerContainer.x = (window.innerWidth) / 2;
            this.innerContainer.y = (window.innerHeight) / 2;
            this.innerContainer.scale.set(scaleMin);
        }





        protected createShape(shapeType: string): void {

        }

        protected addRestartButton(){
            let btnResource = globalResources["but_exit"];
            this.restartBtn = new Sprite(btnResource.texture);
            this.restartBtn.on('mousedown', this.ContinueToLoading,this);
            this.restartBtn.interactive = true;
            this.restartBtn.position.set(700,50);
            this.restartBtn.scale.set(0.5);
            this.innerContainer.addChild(this.restartBtn);
        }


        protected endGameAndDestroy(): void {
            this.mainContainer.destroy();
            this.innerContainer.destroy();
            gameView = null;
            gameController = null;
        }

        protected ContinueToLoading(): void {
            this.endGameAndDestroy();
            loadingController.showLoadingScreen();
        }

    }
}