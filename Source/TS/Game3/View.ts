/// <reference path="../Keyboard.ts"/>

namespace Tetris {
    let view: GameView3;
    export class GameView3 {
        public mainContainer: PIXI.Container;
        public innerContainer: PIXI.Container;
        public emitterContainer: PIXI.Container;
        public backgroundImage: PIXI.Sprite;
        public backgroundShader: PIXI.Sprite;
        public bg_full: PIXI.Sprite;
        public maskObj: PIXI.Graphics;
        private restartBtn:any;
        private particleEmitter:any;
        private playbtn:any;
        constructor() {
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
            this.showParticleAnimation();
            this.addRestartButton();
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


        protected showParticleAnimation():void{ 
            this.emitterContainer.position.set(580,450);
            this.particleEmitter = new PIXI.particles.Emitter(this.emitterContainer, [PIXI.Texture.from(`Assets/particle.png`),PIXI.Texture.from(`Assets/Sparks.png`)], particleJson);
            this.particleEmitter.emit = true;
            this.particleEmitter.autoUpdate = true;
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