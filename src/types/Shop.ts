export type ShopType = 'fishing';
export type ItemCategory = 'bait' | 'rod' | 'tool';

export interface ShopItem {
    name: string;
    emoji: string;
    price: number;
    description: string;
    amount: number;
    category: ItemCategory;
}

export interface Shop {
    name: string;
    description: string;
    items: {
        [key: string]: ShopItem;
    };
}

export interface ShopData {
    [key: string]: Shop;
}
