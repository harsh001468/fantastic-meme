export class GameManager {
    private currentScene: string;

    constructor() {
        this.currentScene = 'MainMenu';
    }

    public startGame() {
        this.changeScene('TrainingScene');
    }

    public changeScene(scene: string) {
        this.currentScene = scene;
        this.loadScene(scene);
    }

    private loadScene(scene: string) {
        // Logic to load the specified scene
        console.log(`Loading scene: ${scene}`);
    }

    public getCurrentScene() {
        return this.currentScene;
    }

    public endGame() {
        console.log('Game ended');
        this.changeScene('MainMenu');
    }
}