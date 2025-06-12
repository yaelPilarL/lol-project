import type { ItemSchema } from "./ValibotSchema";
import type * as v from "valibot";

type Item = v.InferOutput<typeof ItemSchema>;

const ACTION = {
  SET_ITEMS: "set-items",
  SET_SELECTED_ITEM: "set-selected-item",
  PURCHASE_ITEM: "purchase-item",
  UNDO: "undo",
} as const;

export type HistoryEntry = {
  type: "purchase" | "sell";
  item: Item;
  gold: number;
};

export type State = {
  lolItems: Item[];
  selectedItem: Item | null;
  gold: number;
  itemsInventory: Item[];
  history: HistoryEntry[];
};

export type Action =
  | { type: "set-items"; dataItems: Item[] }
  | { type: "set-selected-item"; selectedItem: Item }
  | { type: "purchase-item"; purchaseItem: Item }
  | { type: "undo" };

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

        const sellHistory: HistoryEntry = {
          type: "sell",
          item: item,
          gold: item.gold.sell,
        };

        const updateHistory = [...state.history, sellHistory];

        return {
          ...state,
          gold: updateGold,
          itemsInventory: updateInventory,
          history: updateHistory,
        };
      }

      const hasGold = state.gold >= item.gold.total;
      if (!hasGold) {
        return state;
      }

      const updateGold = state.gold - item.gold.total;
      const updateInventory = [...state.itemsInventory, item];
      const purchaseHistory: HistoryEntry = {
        type: "purchase",
        item: item,
        gold: item.gold.total,
      };

      const updateHistory = [...state.history, purchaseHistory];

      return {
        ...state,
        gold: updateGold,
        itemsInventory: updateInventory,
        history: updateHistory,
      };
    }
    case ACTION.UNDO: {
      const lastStateItem = state.history[state.history.length - 1];

      if (lastStateItem.type === "sell") {
        const updateGold = state.gold - lastStateItem.gold;
        const updateInventory = [...state.itemsInventory, lastStateItem.item];
        return {
          ...state,
          history: state.history.slice(0, -1),
          gold: updateGold,
          itemsInventory: updateInventory,
        };
      }

      const updateGold = state.gold + lastStateItem.gold;
      const updateInventory = state.itemsInventory.filter(
        (inventoryItem) => inventoryItem.id !== lastStateItem.item.id,
      );

      return {
        ...state,
        history: state.history.slice(0, -1),
        gold: updateGold,
        itemsInventory: updateInventory,
      };
    }
  }
}
