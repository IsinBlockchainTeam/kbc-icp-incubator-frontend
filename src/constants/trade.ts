export const incotermsMap = new Map<string, { responsibleParty: string; details: string }>([
    [
        'FCA',
        {
            responsibleParty: 'Buyer',
            details:
                'FCA (Free Carrier) - The buyer assumes all risks and costs from the moment the goods are handed over to the carrier at the named place'
        }
    ],
    [
        'FOB',
        {
            responsibleParty: 'Buyer',
            details:
                'FOB (Free on Board) - The buyer assumes all risks and costs once the goods are on board the vessel.'
        }
    ],
    [
        'CIF',
        {
            responsibleParty: 'Seller',
            details:
                'CFR (Cost and Freight) - The seller is responsible for delivering the goods on board the vessel and paying the costs and freight to bring the goods to the named port of destination. The seller handles export clearance.'
        }
    ],
    [
        'CFR',
        {
            responsibleParty: 'Seller',
            details:
                'CIF (Cost, Insurance, and Freight) - The seller is responsible for delivering the goods on board the vessel, paying the costs and freight to bring the goods to the named port of destination, and providing marine insurance. The seller handles export clearance.'
        }
    ]
]);
