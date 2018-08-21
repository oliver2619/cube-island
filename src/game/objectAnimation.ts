export class ObjectAnimation {
    private time = 0;

    constructor(private duration: number, private onAnimate?: (time: number, totalTime: number) => void, private onComplete?: () => void) {}

    animate(timeout: number): boolean {
        this.time += timeout;
        if (this.time >= this.duration) {
            this.time = this.duration;
            if (this.onAnimate !== undefined)
                this.onAnimate(this.time, this.duration);
            if (this.onComplete !== undefined)
                this.onComplete();
            return false;
        }
        if (this.onAnimate !== undefined)
            this.onAnimate(this.time, this.duration);
        return true;
    }
}

export const SmoothAnimation = (time: number) => {return time * time * (3 - 2 * time);};

export const JumpBackAnimation = (time: number) => {return 4 * time * (1 - time);};
