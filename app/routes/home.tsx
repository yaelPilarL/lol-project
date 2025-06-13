import type React from "react";
import { useEffect, useReducer } from "react";
import "~/styles/app.css";
import * as v from "valibot";
import {
  type ItemSchema,
  ItemsResponseSchema,
  DataSchema,
  ItemDetailsSchema,
} from "~/ValibotSchema";
import {
  getBootItems,
  getBasicItems,
  getConsumableItems,
  getEpicItems,
  getLengedaryItems,
  getStarterItems,
} from "~/ItemsByGroups";

import {
  itemsReducer,
  type Action,
  type History,
  type State,
} from "~/ItemsReducer";

type Item = v.InferOutput<typeof ItemSchema>;

const initialState = {
  lolItems: [],
  selectedItem: null,
  gold: 20000,
  itemsInventory: [],
  history: [],
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
            return {
              ...item,
              id: Number(id),
              into: item.into?.map(Number),
              from: item.from?.map(Number),
            };
          });

          dispatch({ type: "set-items", dataItems: lolItemsId });
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
              <ul>
                {bootItems.map((item) => (
                  <ItemCard key={item.id} item={item} dispatch={dispatch} />
                ))}
              </ul>

              <h2>Consumable</h2>
              <ul>
                {consumableItems.map((item) => (
                  <ItemCard key={item.id} item={item} dispatch={dispatch} />
                ))}
              </ul>

              <h2>Starter</h2>
              <ul>
                {starterItems.map((item) => (
                  <ItemCard key={item.id} item={item} dispatch={dispatch} />
                ))}
              </ul>

              <h2>Basic</h2>
              <ul>
                {basicItems.map((item) => (
                  <ItemCard key={item.id} item={item} dispatch={dispatch} />
                ))}
              </ul>

              <h2>Epic</h2>
              <ul>
                {epicItems.map((item) => (
                  <ItemCard key={item.id} item={item} dispatch={dispatch} />
                ))}
              </ul>

              <h2>Legendary</h2>
              <ul>
                {legendaryItems.map((item) => (
                  <ItemCard key={item.id} item={item} dispatch={dispatch} />
                ))}
              </ul>
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

          {state.selectedItem ? (
            <StoreItemCard state={state} dispatch={dispatch} />
          ) : null}
        </div>

        <div className="inventory-grid">
          <h2 className="title-inventory">Inventory</h2>
          {state.itemsInventory.length > 0 ? (
            <ul className="inventory-items">
              {state.itemsInventory.map((item) => (
                <ItemCard key={item.id} item={item} dispatch={dispatch} />
              ))}
            </ul>
          ) : (
            <p className="empty-inventory-message">Your inventory is empty.</p>
          )}
        </div>
      </div>
    </>
  );
}

const StoreItemCard = ({
  state,
  dispatch,
}: { state: State; dispatch: React.Dispatch<Action> }) => {
  const findItemById = (id: number) =>
    state.lolItems.find((item) => item.id === id);

  const selectedItem = state.selectedItem;
  if (!selectedItem) return null;

  const isInInventory = state.itemsInventory.some(
    (itemId) => itemId.id === selectedItem.id,
  );

  const hasGold = selectedItem.gold.total <= state.gold;

  return (
    <div className="item-card">
      <div className="selected-item">
        <ItemCard item={selectedItem} dispatch={dispatch} />
      </div>

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

      <button
        type="button"
        className="available-button"
        onClick={() =>
          dispatch({
            type: "undo",
          })
        }
        disabled={history.length === 0}
      >
        Undo
      </button>

      {selectedItem.from && selectedItem.from.length > 0 ? (
        <div className="item-from">
          <h3>From</h3>
          <ul className="store-items">
            {[...new Set(selectedItem.from)].map((itemId) => {
              const item = findItemById(itemId);
              return item ? (
                <ul key={item.id} className="store-items">
                  <ItemCard item={item} dispatch={dispatch} />
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
                  <ItemCard item={item} dispatch={dispatch} />
                </ul>
              ) : null;
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
};

const ItemCard = ({
  item,
  dispatch,
}: { item: Item; dispatch: React.Dispatch<Action> }) => {
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
};
