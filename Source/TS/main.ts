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
namespace Tetris {
    export class Main {
        
        loadingController:any;
        loadingView:any;
        gameController:any;
        gameView:any;
        
        constructor() {
            app = new PIXI.Application({ resizeTo: window, backgroundColor: 0x000000, antialias: true,resolution: 1 });
            app.stage.interactive = true;
            document.body.appendChild(app.view);
            this.loadAllImages();
        }
 

        protected InitializeLoadingScreen():void{
            loadingView = new LoadingView();
            loadingController = new LoadingController(loadingView);
            loadingController.showLoadingScreen();
        }

       

        private loadAllImages(): void {
            this.loadGeneralImages();
        }

        private loadGeneralImages():void{
            for (let imageid in assetList) {
                loader.add(assetList[imageid], "Assets/" + assetList[imageid] + ".png");
            }
            loader.load(this.loadSpriteSheet.bind(this));
        }
        
        private loadSpriteSheet(loader: any, resources: any):void{
            globalResources = resources;
            for (let imageid in assetListSprite) {
                loader.add(assetListSprite[imageid], "Assets/" + assetListSprite[imageid] + ".json");
            }
            loader.load(this.StartInitialize.bind(this));
        }

        

        private StartInitialize(loader: any, resources: any): void {
            globalResources = resources;
            this.InitializeLoadingScreen();
        }
    }
}
