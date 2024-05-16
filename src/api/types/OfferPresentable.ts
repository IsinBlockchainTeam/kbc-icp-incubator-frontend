import { ProductCategory } from "@kbc-lib/coffee-trading-management-lib";

export type OfferPresentable = {
    id: number;
    supplierAddress: string;
    supplierName: string;
    productCategory: ProductCategory;
}
