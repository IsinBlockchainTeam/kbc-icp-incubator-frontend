import {defaultNodeEdgeColor, validNodeEdgeColor} from "../../../utils/supplyChainGraphUtils";

export const nodes = [
    {
        id: 1,
        label: "Cumhur Karakas",
        color: validNodeEdgeColor,
        info: {
            facilityName: 'Cumhur Karakas',
            location: 'Izmir, Menemen, Kesi',
            nation: 'Turkey',
            region: 'Aegean',
            processes: [],
            standards: ['GOTS'],
            certificates: ['CERT1', 'CERT2']
        },
    },
    {
        id: 2,
        label: "Karakas Circir Factory",
        color: validNodeEdgeColor,
        info: {
            facilityName: 'Karakas Circir Factory',
            location: 'Izmir, Menemen, Kesi',
            nation: 'Turkey',
            region: 'Aegean',
            processes: [],
            standards: ['GOTS'],
            certificates: ['CERT1']
        }
    },
    {
        id: 3,
        label: "Marchi e Fildi SPA",
        color: validNodeEdgeColor,
        info: {
            facilityName: 'Marchi e Fildi SPA',
            location: 'Via Maestri del Lavoro, 4/A, 13900 Biella ',
            nation: 'Italia',
            region: 'Piemonte',
            processes : ['Spinning'],
            standards: ['GOTS'],
            certificates: ['OEKO Tex 100', 'GRS']
        }
    },
    {
        id: 4,
        label: "Berto E.G. Industria Tessile",
        color: defaultNodeEdgeColor,
        info: {
            facilityName: 'Berto E.G. Industria Tessile',
            location: ' VIA E. BERTO, 3 35024 BOVOLENTA (PD)',
            nation: 'Italia',
            region: 'Veneto',
            processes: [],
            standards: ['GOTS'],
            certificates: ['CERT1']
        }
    },
    {
        id: 5,
        label: "Denim Service Srl",
        color: validNodeEdgeColor,
        info: {
            facilityName: 'Denim Service Srl',
            location: 'CUTTING:Via S. Pio X, 36060 Pianezze (VI)',
            nation: 'Italia',
            region: 'Veneto',
            processes: [],
            standards: ['GOTS'],
            certificates: ['CERT4']
        }
    },
    {
        id: 6,
        label: "Vivienne Westwood",
        color: validNodeEdgeColor,
        info: {
            facilityName: 'Vivienne Westwood',
            location: '???',
            nation: '???',
            region: '???',
            processes: [],
            standards: ['GOTS'],
            certificates: ['CERT1']
        }
    },
    {
        id: 7,
        label: "Marchi e Fildi SPA",
        color: validNodeEdgeColor,
        info: {
            facilityName: 'Marchi e Fildi SPA',
            location: 'Via Maestri del Lavoro, 4/A, 13900 Biella ',
            nation: 'Italia',
            region: 'Piemonte',
            processes: [],
            standards: ['GOTS'],
            certificates: ['CERT3']
        }
    },

];
export const edges = [
    { from: 1, to: 2, label: "Cotton fiber"},
    { from: 2, to: 3, label: "Cotton fiber"},
    { from: 3, to: 4, label: "Cotton fiber - 35%"},
    { from: 4, to: 5, label: "Centaurus"},
    { from: 5, to: 6, label: "W HARRIS JEANS"},
    { from: 7, to: 4, label: "Recycled - 65%"},
]
