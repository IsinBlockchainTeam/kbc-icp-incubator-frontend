class Node {
    id: number;
    label: string;
    color: string = "#4edb34";


    constructor(id: number,
                label: string) {
        this.id = id;
        this.label = label;
    }
}

export default Node;
