export interface Simulation {
    simulate(timeout: number): void;
}

export class SimulationSlots {
    private slots: Simulation[][];
    private currentSlot: number;

    constructor(numberOfSlots: number) {
        this.slots = [];
        for (let i = 0; i < numberOfSlots; ++i)
            this.slots.push([]);
        this.currentSlot = 0;
    }

    add(simulation: Simulation): void {
        let minIndex: number, minValue: number;
        this.slots.forEach((s, i) => {
            if (minValue === undefined || minValue > s.length) {
                minValue = s.length;
                minIndex = i;
            }
        });
        this.slots[minIndex].push(simulation);
    }

    remove(simulation: Simulation): void {
        this.slots.find(sl => {
            const i = sl.findIndex(s => s === simulation);
            if (i !== -1) {
                sl.splice(i, 1);
                return true;
            }
            return false;
        });
    }

    simulate(timeout: number): void {
        const t = timeout * this.slots.length;
        this.slots[this.currentSlot].forEach(s => s.simulate(t));
        ++this.currentSlot;
        if (this.currentSlot >= this.slots.length)
            this.currentSlot = 0;
    }
}