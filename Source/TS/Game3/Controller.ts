namespace Tetris {
    export class GameController3 {
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
            this.left.press = () => {
                this.view.moveFormLeft();
            };
            this.up.press = () => {
               this.view.rotateForm();
            };
            this.right.press = () => {
                this.view.moveFormRight();
            };
            this.down.press = () => {
                this.view.hardDown();
            };
        }
    }
}