import { render } from '@testing-library/react';
import { MaterialInfoCardContent } from '@/components/CardContents/MaterialInfoCardContent';
import { Material, ProductCategory } from '@kbc-lib/coffee-trading-management-lib';

describe('MaterialInfoCardContent', () => {
    it('renders empty component when material is undefined', () => {
        const { container } = render(<MaterialInfoCardContent material={undefined} />);
        expect(container.querySelector('.ant-empty')).toBeInTheDocument();
    });

    it('renders material information correctly', () => {
        const material = new Material(1, 'owner1', 'Material1', new ProductCategory(1, 'Product Category 1'), 'typology', '85', '20%', false);
        const { getByText } = render(<MaterialInfoCardContent material={material} />);
        expect(getByText('Material1')).toBeInTheDocument();
        expect(getByText('Product Category 1')).toBeInTheDocument();
        expect(getByText('typology')).toBeInTheDocument();
        expect(getByText('85')).toBeInTheDocument();
        expect(getByText('20%')).toBeInTheDocument();
    });
});
