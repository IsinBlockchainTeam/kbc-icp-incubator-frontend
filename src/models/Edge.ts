// TODO Check if we do need a blockchain specific class or if it can be merged
class Edge {
    from: number;
    to: number;
    label: string;
    color: string = "#000000";

    constructor(from: number,
                to: number,
                label: string) {
        this.from = from;
        this.to = to;
        this.label = label
    }
}

export default Edge;