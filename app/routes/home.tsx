import { useEffect, useReducer } from "react";
import "~/styles/app.css";
import * as v from "valibot";
import { ItemSchema, ItemsResponseSchema, DataSchema } from "~/ValibotSchema";
import {
  getBootItems,
  getBasicItems,
  getConsumableItems,
  getEpicItems,
  getLengedaryItems,
  getStarterItems,
} from "~/ItemsByGroups";

import { itemsReducer, type Action } from "~/ItemsReducer";

type Item = v.InferOutput<typeof ItemSchema>;

const initialState = {
  lolItems: [],
  selectedItem: null,
  purchasedItem: [],
  gold: 20000,
  soldItems: [],
  itemsInventory: [],
};

export default function () {
  const [state, dispatch] = useReducer(itemsReducer, initialState);

  useEffect(() => {
    async function fetchLolItems() {
      return await fetch(
        "https://ddragon.leagueoflegends.com/cdn/14.19.1/data/en_US/item.json",
      )
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          const itemsData = v.parse(ItemsResponseSchema, data);

          const dataSchema = v.parse(
            v.array(DataSchema),
            Object.entries(itemsData.data),
          );

          const lolItemsId = dataSchema.map(([id, item]) => {
            return { ...item, id };
          });

          const CHAMPION_EXClUSIVE_ITEM_IDS = [
            3599, 3600, 3330, 3901, 3902, 3903,
          ];
          const OBSIDIAN_EDGE_ID = 1040;
          const SHATTERED_GUARD_ID = 2421;

          const FILTER_ID = [
            ...CHAMPION_EXClUSIVE_ITEM_IDS,
            OBSIDIAN_EDGE_ID,
            SHATTERED_GUARD_ID,
          ];

          const lolItems = v
            .parse(v.array(ItemSchema), lolItemsId)
            .filter(
              (item) =>
                item.maps[11] === true &&
                item.gold.purchasable === true &&
                !FILTER_ID.includes(item.id),
            )
            .sort((a, b) => a.gold.total - b.gold.total);

          dispatch({ type: "set-items", dataItems: lolItems });
        });
    }
    fetchLolItems();
  }, []);

  console.log("STATE", state);

  const bootItems = getBootItems(state.lolItems);
  const consumableItems = getConsumableItems(state.lolItems);
  const starterItems = getStarterItems(state.lolItems);
  const basicItems = getBasicItems(state.lolItems);
  const epicItems = getEpicItems(state.lolItems);
  const legendaryItems = getLengedaryItems(state.lolItems);

  return (
    <>
      <h1 className="title">League Of Legends</h1>
      <div className="container-wrapper">
        <div className="items-grid">
          {state.lolItems.length > 0 ? (
            <>
              <h2>Boots</h2>
              <ul>{bootItems.map((item) => itemCard(item, dispatch))}</ul>

              <h2>Consumable</h2>
              <ul>{consumableItems.map((item) => itemCard(item, dispatch))}</ul>

              <h2>Starter</h2>
              <ul>{starterItems.map((item) => itemCard(item, dispatch))}</ul>

              <h2>Basic</h2>
              <ul>{basicItems.map((item) => itemCard(item, dispatch))}</ul>

              <h2>Epic</h2>
              <ul>{epicItems.map((item) => itemCard(item, dispatch))}</ul>

              <h2>Legendary</h2>
              <ul>{legendaryItems.map((item) => itemCard(item, dispatch))}</ul>
            </>
          ) : (
            <p>Without items...</p>
          )}
        </div>

        <div className="store-grid">
          <h2 className="title-store">STORE</h2>

          <div className="available-gold">
            <p>{state.gold}</p>
          </div>

          {state.selectedItem
            ? storeItemCard(
                state.selectedItem,
                state.lolItems,
                state.gold,
                state.itemsInventory,
                dispatch,
              )
            : null}
        </div>

        <div className="inventory-grid">
          <h2 className="title-inventory">Inventory</h2>
          {state.itemsInventory.length > 0 ? (
            <ul className="inventory-items">
              {state.itemsInventory.map((item) => itemCard(item, dispatch))}
            </ul>
          ) : (
            <p className="empty-inventory-message">Your inventory is empty.</p>
          )}
        </div>
      </div>
    </>
  );
}

function storeItemCard(
  selectedItem: Item,
  lolItems: Item[],
  gold: number,
  itemsInventory: Item[],
  dispatch: React.Dispatch<Action>,
) {
  const findItemById = (id: number) => lolItems.find((item) => item.id === id);

  const isInInventory = itemsInventory.some(
    (itemId) => itemId.id === selectedItem.id,
  );

  const hasGold = selectedItem.gold.total <= gold;

  return (
    <div className="item-card">
      <div className="selected-item">{itemCard(selectedItem, dispatch)}</div>

      <button
        type="button"
        className="available-button"
        onClick={() =>
          dispatch({
            type: "purchase-item",
            purchaseItem: selectedItem,
          })
        }
        disabled={!hasGold || isInInventory}
      >
        Purchase Item
      </button>

      <button
        type="button"
        className="available-button"
        onClick={() =>
          dispatch({
            type: "purchase-item",
            purchaseItem: selectedItem,
          })
        }
        disabled={!isInInventory}
      >
        Sell
      </button>

      {selectedItem.from && selectedItem.from.length > 0 ? (
        <div className="item-from">
          <h3>From</h3>
          <ul className="store-items">
            {[...new Set(selectedItem.from)].map((itemId) => {
              const item = findItemById(itemId);
              return item ? (
                <ul key={item.id} className="store-items">
                  {itemCard(item, dispatch)}
                </ul>
              ) : null;
            })}
          </ul>
        </div>
      ) : null}

      {selectedItem.into && selectedItem.into.length > 0 ? (
        <div className="item-into">
          <h3>Into</h3>
          <ul className="store-items">
            {[...new Set(selectedItem.into)].map((itemId) => {
              const item = findItemById(itemId);
              return item ? (
                <ul key={item.id} className="store-items">
                  {itemCard(item, dispatch)}
                </ul>
              ) : null;
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function itemCard(item: Item, dispatch: React.Dispatch<Action>) {
  return (
    <li key={item.id} className="item-card">
      <section>
        <button
          className="item-button"
          type="button"
          onClick={() =>
            dispatch({ type: "set-selected-item", selectedItem: item })
          }
        >
          <img
            src={`https://ddragon.leagueoflegends.com/cdn/14.19.1/img/item/${item.image.full}`}
            alt={item.name}
          />
        </button>
      </section>
      <span>{item.gold.total}</span>
    </li>
  );
}
