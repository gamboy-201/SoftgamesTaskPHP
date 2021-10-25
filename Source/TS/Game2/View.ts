/// <reference path="../Keyboard.ts"/>

namespace Tetris {
    let view: GameView2;
    export class GameView2 {
        public mainContainer: PIXI.Container;
        public innerContainer: PIXI.Container;
        public textContainer: PIXI.Container;
        public backgroundImage: PIXI.Sprite;
        public backgroundShader: PIXI.Sprite;
        public bg_full: PIXI.Sprite;
        public maskObj: PIXI.Graphics;
        private restartBtn:any;
        private playbtn: any;
        private textArr:any[] = [];
        private emtArr:any[] = [];
        private randomText: string;
        constructor() {
            this.mainContainer = new PIXI.Container();
            this.mainContainer.name = "Game2ScreenContainer";
            this.innerContainer = new PIXI.Container();
            this.innerContainer.name = "Game2InnerLoadingScreenContainer";
            this.textContainer = new PIXI.Container();
            this.textContainer.name = "textContainer";
            this.textContainer.position.set(450,200);
            this.innerContainer.addChild(this.textContainer);
            this.randomText = "Lorem ipsum dolor sit";
            this.mainContainer.visible = false;
            this.innerContainer.visible = false;
            this.AddBackgroundImage();
            this.addAllToStage();
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
            this.selectRandomTextAndEmoticon();
            this.addRestartButton();
        }

        protected selectRandomTextAndEmoticon(): void {
            let fontSizeRn = 18+Math.floor(Math.random() * (20));
            for (let i = 0; i < 3; i++) {
                let randomSelection = Math.floor(Math.random() * 2);
                if (randomSelection == 0) {
                    let startIndex = Math.floor(Math.random() * (this.randomText.length - 10));
                    let endIndex = startIndex + Math.floor(Math.random() * (this.randomText.length - startIndex + 1));
                    let randomText = this.randomText.substring(startIndex, endIndex);
                    let textNew = new PIXI.Text(randomText, styleMenu);
                    textNew.style.fontSize = fontSizeRn;
                    if(this.textArr.length>0){
                        textNew.x = this.textArr[this.textArr.length-1].width+this.textArr[this.textArr.length-1].x+5;
                    }
                    else{
                        textNew.x=0;
                    }
                    this.textArr.push(textNew);
                    this.textContainer.addChild(textNew);
                }
                else{
                    let emrandomSelection = Math.floor(Math.random() * 2);
                    let resourceEm;
                    if(emrandomSelection==0){
                        resourceEm = globalResources["emoticon1"];
                    }
                    else{
                        resourceEm = globalResources["emoticon2"];
                    }
                    let sprite = new Sprite(resourceEm.texture);
                    sprite.height=fontSizeRn+5;
                    sprite.width=fontSizeRn+5;
                    if(this.textArr.length>0){
                        sprite.x = this.textArr[this.textArr.length-1].width+this.textArr[this.textArr.length-1].x+5;
                    }
                    else{
                        sprite.x=0;
                    }
                    this.textArr.push(sprite);
                    this.textContainer.addChild(sprite);
                }
            }
            setTimeout(this.destroyAllAndReset.bind(this),2000);
        }

        protected destroyAllAndReset():void{
            for(let i=0;i<this.textArr.length;i++){
                this.textArr[i].destroy();
            }
            this.textArr=[];
            setTimeout(this.selectRandomTextAndEmoticon.bind(this),200);
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