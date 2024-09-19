export class InputManager {
    constructor() {
        this.mouseX = 0;
        this.mouseY = 0;

        this.leftMouseButtonDown = false;
        this.rightMouseButtonDown = false;
        this.middleMouseButtonDown = false;

        this.leftMouseButtonPressed = false;
        this.rightMouseButtonPressed = false;
        this.middleMouseButtonPressed = false;

        document.addEventListener('contextmenu', (event) => event.preventDefault());

        const pointerEventCallback = (event) => {
            this.mouseX = event.clientX * devicePixelRatio;
            this.mouseY = event.clientY * devicePixelRatio;

            this.leftMouseButtonPressed |= !this.leftMouseButtonDown && (event.buttons & 1) != 0;
            this.rightMouseButtonPressed |= !this.rightMouseButtonDown && (event.buttons & 2) != 0;
            this.middleMouseButtonPressed |= !this.middleMouseButtonDown && (event.buttons & 4) != 0;

            this.leftMouseButtonDown = (event.buttons & 1) != 0;
            this.rightMouseButtonDown = (event.buttons & 2) != 0;
            this.middleMouseButtonDown = (event.buttons & 4) != 0;
        };

        document.addEventListener('pointerdown', pointerEventCallback);
        document.addEventListener('pointermove', pointerEventCallback);
        document.addEventListener('pointerup', pointerEventCallback);
        document.addEventListener('pointercancel', pointerEventCallback);
    }

    resetPressedButtons() {
        this.leftMouseButtonPressed = false;
        this.rightMouseButtonPressed = false;
        this.middleMouseButtonPressed = false;
    }
}

export default InputManager;
