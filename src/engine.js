const FIXED_UPDATE_TIMESTEP = 60 / 1000;

export class Engine {
    /** @param {HTMLCanvasElement} canvas */
    constructor(canvas) {
        this.canvas = canvas;

        document.addEventListener('contextmenu', event => event.preventDefault());

        this.resize();
        addEventListener('resize', this.resize);

        let currentTime = null;
        let timeSinceFixedUpdate = 0;

        const requestAnimationFrameCallback = (timestamp) => {
            timestamp /= 1000;

            const deltaTime = timestamp - currentTime;
            currentTime = timestamp;

            timeSinceFixedUpdate += deltaTime;
            while (timeSinceFixedUpdate >= FIXED_UPDATE_TIMESTEP) {
                this.fixedUpdate(FIXED_UPDATE_TIMESTEP);
                timeSinceFixedUpdate -= FIXED_UPDATE_TIMESTEP;
            }

            this.update(deltaTime);
            this.draw(deltaTime);

            requestAnimationFrame(requestAnimationFrameCallback);
        };

        requestAnimationFrame(requestAnimationFrameCallback);
    }

    resize() {
        this.canvas.width = document.documentElement.clientWidth * window.devicePixelRatio;
        this.canvas.height = document.documentElement.clientHeight * window.devicePixelRatio;
    }

    fixedUpdate(deltaTime) {
        // console.log('fixedUpdate', deltaTime);
    }

    update(deltaTime) {
        // console.log('update', deltaTime);
    }

    draw(deltaTime) {
        // console.log('draw', deltaTime);
    }
}

export default Engine;
