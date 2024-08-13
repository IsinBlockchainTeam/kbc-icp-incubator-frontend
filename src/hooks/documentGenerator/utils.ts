export const fixYPositions = (schemas: any[]): any => {
    return schemas.map((schema) => {
        const updatedSchema: any = {};
        for (const key in schema) {
            if (schema.hasOwnProperty(key)) {
                const element = JSON.parse(JSON.stringify(schema[key]));
                if (element.position && typeof element.position.y === 'number') {
                    element.position.y -= 3;
                }
                updatedSchema[key] = element;
            }
        }
        return updatedSchema;
    });
};
