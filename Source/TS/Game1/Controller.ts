namespace Tetris {
    export class GameController1 {
        protected view;
        protected left: Keyboard = new Keyboard("ArrowLeft", true);
        protected up = new Keyboard("ArrowUp", true);
        protected right = new Keyboard("ArrowRight", true);
        protected down = new Keyboard("ArrowDown", true);
        constructor(view:GameView){
            this.view=view;
        }
        public ShowTheGame():void{
            this.view.ShowTheGame();
        }
    }
}