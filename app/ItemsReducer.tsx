import type { ItemSchema } from "./ValibotSchema";
import type * as v from "valibot";

type Item = v.InferOutput<typeof ItemSchema>;

const ACTION = {
  SET_ITEMS: "set-items",
  SET_SELECTED_ITEM: "set-selected-item",
  PURCHASE_ITEM: "purchase-item",
} as const;

export type State = {
  lolItems: Item[];
  selectedItem: Item | null;
  purchasedItem: Item[];
  gold: number;
  soldItems: Item[];
  itemsInventory: Item[];
};

export type Action =
  | { type: "set-items"; dataItems: Item[] }
  | { type: "set-selected-item"; selectedItem: Item }
  | { type: "purchase-item"; purchaseItem: Item };

export function itemsReducer(state: State, action: Action) {
  switch (action.type) {
    case ACTION.SET_ITEMS: {
      return { ...state, lolItems: action.dataItems };
    }
    case ACTION.SET_SELECTED_ITEM: {
      return { ...state, selectedItem: action.selectedItem };
    }
    case ACTION.PURCHASE_ITEM: {
      const item = action.purchaseItem;

      const isInInventory = state.itemsInventory.some(
        (inventoryItem) => inventoryItem.id === item.id,
      );

      if (isInInventory) {
        const updateGold = state.gold + item.gold.sell;
        const updateInventory = state.itemsInventory.filter(
          (inventoryItem) => inventoryItem.id !== item.id,
        );

        const updateSoldItems = [...state.soldItems, item];

        return {
          ...state,
          gold: updateGold,
          itemsInventory: updateInventory,
          soldItems: updateSoldItems,
        };
      }

      const hasGold = state.gold >= item.gold.total;
      if (!hasGold) {
        return state;
      }

      const updateGold = state.gold - item.gold.total;
      const updateInventory = [...state.itemsInventory, item];
      const updatePurchasedItems = [...state.purchasedItem, item];

      return {
        ...state,
        gold: updateGold,
        itemsInventory: updateInventory,
        purchasedItem: updatePurchasedItems,
      };
    }
  }
}
