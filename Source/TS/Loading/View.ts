namespace Tetris {
    let view: LoadingView;
    export class LoadingView {
        public mainContainer: PIXI.Container;
        public innerContainer: PIXI.Container;
        public backgroundImage: PIXI.Sprite;
        public backgroundShader: PIXI.Sprite;
        public bg_full: PIXI.Sprite;
        public maskObj: PIXI.Graphics;
        private playbtn: any;
        public selectionButtons: PIXI.Sprite[] = [];
        constructor() {
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
        public ShowLoadingScreen(): void {
            this.mainContainer.visible = true;
            this.innerContainer.visible = true;
            window.onresize = this.resize.bind(this);
        }

        protected AddBackgroundImage() {
            let resourceBackground = globalResources["backgroundStars"];
            this.backgroundImage = this.mainContainer.addChild(new Sprite(resourceBackground.texture));
        }

        protected createShapes(): void {
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
        }

        protected ContinueToTheGame(gameIndex:number): void {
            switch(gameIndex){
                case 0:
                    gameView = new GameView1();
                    gameController = new GameController1(gameView);
                    break;
                case 1:
                    gameView = new GameView2();
                    gameController = new GameController2(gameView);
                    break;
                case 2:
                    gameView = new GameView3();
                    gameController = new GameController3(gameView);
                    break;
            }
            gameController.ShowTheGame();
            this.mainContainer.visible = false;
            this.innerContainer.visible = false;
        }

        protected addAllToStage(): void {
            app.stage.addChild(this.mainContainer);
            app.stage.addChild(this.innerContainer);
            this.addSelectionButtons();
        }

        protected addSelectionButtons(): void {
            let menuText = new PIXI.Text("CHOOSE FEATURE", styleMenu);
            menuText.position.set(420,170);
            this.innerContainer.addChild(menuText);
            let btnResource = globalResources["buttonStock1d"];
            for (let i = 0; i < 3; i++) {
                this.selectionButtons[i] = new Sprite(btnResource.texture);
                this.selectionButtons[i].on('mousedown', this.ContinueToTheGame.bind(this,i), this);
                this.selectionButtons[i].interactive = true;
                this.selectionButtons[i].anchor.set(0.5);
                this.selectionButtons[i].position.set(490 + this.selectionButtons[i].width/2, 200+120*i + this.selectionButtons[i].height/2);

                let featureText = new PIXI.Text("", styleMenuBtn);
                featureText.text = this.getText(i);
                featureText.x=(this.selectionButtons[i].width-featureText.width)/2 - this.selectionButtons[i].width/2;
                featureText.y=-20;
                this.selectionButtons[i].addChild(featureText);

                this.innerContainer.addChild(this.selectionButtons[i]);
            }
        }

        protected getText(gameIndex:number):string{
            let textRt = "";
            switch(gameIndex){
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
    }
}