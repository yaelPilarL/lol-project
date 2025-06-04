import { useEffect, useReducer } from "react";
import "~/styles/app.css";
import * as v from "valibot";
import { ItemSchema, ItemsResponseSchema, DataSchema } from "~/schema";

type Item = v.InferOutput<typeof ItemSchema>;

const initialState = {
  lolItems: [],
  selectedItem: null,
};

const ACTION = {
  SET_ITEMS: "set-items",
  SET_SELECTED_ITEM: "set-selected-item",
} as const;

type State = { lolItems: Item[]; selectedItem: Item | null };

type Action =
  | { type: "set-items"; dataItems: Item[] }
  | { type: "set-selected-item"; selectedItem: Item };

function itemsReducer(state: State, action: Action) {
  switch (action.type) {
    case ACTION.SET_ITEMS: {
      return { ...state, lolItems: action.dataItems };
    }
    case ACTION.SET_SELECTED_ITEM: {
      return { ...state, selectedItem: action.selectedItem };
    }
  }
}

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

  const handleClick = (item: Item) => {
    dispatch({ type: "set-selected-item", selectedItem: item });
  };

  console.log("selectedItem", state.selectedItem);

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
              <ul>{bootItems.map((item) => Card(item, handleClick))}</ul>

              <h2>Consumable</h2>
              <ul>{consumableItems.map((item) => Card(item, handleClick))}</ul>

              <h2>Starter</h2>
              <ul>{starterItems.map((item) => Card(item, handleClick))}</ul>

              <h2>Basic</h2>
              <ul>{basicItems.map((item) => Card(item, handleClick))}</ul>

              <h2>Epic</h2>
              <ul>{epicItems.map((item) => Card(item, handleClick))}</ul>

              <h2>Legendary</h2>
              <ul>{legendaryItems.map((item) => Card(item, handleClick))}</ul>
            </>
          ) : (
            <p>Without items...</p>
          )}
        </div>
        <div className="store-grid">
          <h2 className="title">STORE</h2>
          {state.selectedItem
            ? storeCard(state.selectedItem, state.lolItems)
            : null}
        </div>
      </div>
    </>
  );
}

function storeCard(selectedItem: Item, lolItems: Item[]) {
  const findItemById = (id: number) => lolItems.find((item) => item.id === id);

  return (
    <div className="item-card">
      <div className="selected-item">
        <img
          src={`https://ddragon.leagueoflegends.com/cdn/14.19.1/img/item/${selectedItem.image.full}`}
          alt={selectedItem.name}
        />
        <p>{selectedItem.gold.total}</p>
      </div>

      {selectedItem.from && selectedItem.from.length > 0 ? (
        <div className="item-from">
          <h3>From</h3>
          {selectedItem.from.map((itemId) => {
            const item = findItemById(itemId);
            return item ? (
              <div key={item.id} className="build-item">
                <img
                  src={`https://ddragon.leagueoflegends.com/cdn/14.19.1/img/item/${item.image.full}`}
                  alt={item.name}
                />
                <span>{item.gold.total}</span>
              </div>
            ) : null;
          })}
        </div>
      ) : null}

      {selectedItem.into && selectedItem.into.length > 0 ? (
        <div className="item-into">
          <h3>Into</h3>
          {selectedItem.into.map((itemId) => {
            const item = findItemById(itemId);
            return item ? (
              <div key={item.id} className="build-item">
                <img
                  src={`https://ddragon.leagueoflegends.com/cdn/14.19.1/img/item/${item.image.full}`}
                  alt={item.name}
                />
                <span>{item.gold.total}</span>
              </div>
            ) : null;
          })}
        </div>
      ) : null}
    </div>
  );
}

function Card(item: Item, handleClick: (item: Item) => void) {
  return (
    <li key={item.id} className="item-card">
      <section>
        <button type="button" onClick={() => handleClick(item)}>
          <img
            src={`https://ddragon.leagueoflegends.com/cdn/14.19.1/img/item/${item.image.full}`}
            alt={item.name}
          />
        </button>
      </section>
      <span className="item-gold">
        <b>{item.gold.total}</b>
      </span>
    </li>
  );
}

function getBootItems(lolItems: Item[]) {
  return lolItems.filter((item) => item.tags.includes("Boots"));
}

function getConsumableItems(lolItems: Item[]) {
  return lolItems.filter(
    (item) =>
      item.tags.includes("Consumable") ||
      !item.stats ||
      (item.gold.base === 0 && item.gold.sell === 0),
  );
}

function getStarterItems(lolItems: Item[]) {
  const tagsInclude = ["Lane", "Jungle"];
  const tagsExclude = ["Consumable"];

  const starterItems = lolItems
    .filter((item) => {
      return item.tags.some((tag) => tagsInclude.includes(tag));
    })
    .filter((item) => {
      return !item.tags.some((tag) => tagsExclude.includes(tag));
    })
    .filter((item) => {
      return !item.from && item.gold.base > 0;
    })
    .filter((item) => {
      return !(
        item.tags.length === 2 &&
        item.tags.includes("Damage") &&
        item.tags.includes("Lane")
      );
    });

  const uniqueStarterItems = Array.from(
    new Map(starterItems.map((item) => [item.name, item])).values(),
  );

  return uniqueStarterItems;
}

function getBasicItems(lolItems: Item[]) {
  return lolItems
    .filter((item) => {
      return !item.from;
    })
    .filter((item) => {
      return !item.tags.includes("Boots");
    })
    .filter((item) => {
      return item.into && item.into.length >= 3;
    })
    .filter((item) => {
      return !(item.tags.includes("Mana") && item.tags.includes("ManaRegen"));
    });
}

function getEpicItems(lolItems: Item[]) {
  return lolItems
    .filter((item) => {
      return item.depth === 2 || item.consumeOnFull === true;
    })
    .filter((item) => {
      return item.consumeOnFull === true || (item.into && item.from);
    })
    .filter((item) => {
      return !item.tags.includes("Boots");
    })
    .filter((item) => {
      return !(item.stats && item.stats.FlatHPPoolMod === 250);
    });
}

function getLengedaryItems(lolItems: Item[]) {
  return lolItems
    .filter((item) => {
      return !item.into && item.from;
    })
    .filter((item) => {
      return item.depth === 2 || item.depth === 3;
    })
    .filter((item) => {
      return !item.tags.includes("Boots");
    });
}
