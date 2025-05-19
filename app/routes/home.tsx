import { useEffect, useReducer } from "react";
import * as v from "valibot";
import "~/styles/app.css";

const GoldSchema = v.object({
  base: v.number(),
  purchasable: v.union([v.number(), v.string()]),
  sell: v.pipe(v.number()),
  total: v.pipe(v.number()),
});
type Gold = v.InferOutput<typeof GoldSchema>;

const ItemsSchema = v.object({
  id: v.pipe(v.string(), v.transform(Number)),
  name: v.pipe(v.string(), v.minLength(1)),
  image: v.pipe(v.string(), v.minLength(1)),
  into: v.pipe(v.array(v.string())),
  maps: v.union([v.number(), v.string()]),
  gold: v.pipe(GoldSchema),
  stats: v.union([v.null(), v.number()]),
  tags: v.union([v.array(v.null()), v.array(v.string())]),
});
type Items = v.InferOutput<typeof ItemsSchema>;

const initialState = {
  lolItems: [],
};

const ACTION = {
  SET_ITEMS: "set_items",
};

//@ts-ignore
function reducer(state, action) {
  switch (action.type) {
    case ACTION.SET_ITEMS: {
      return { ...state, lolItems: action.dataItems };
    }
  }
  throw Error("There has been an error in reducer function");
}

export default function () {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    async function fetchLolItems() {
      return await fetch(
        "https://ddragon.leagueoflegends.com/cdn/14.19.1/data/en_US/item.json",
      )
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          console.log("DATA", data);
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

          const items = Object.entries(data.data);
          console.log("items", items);

          const lolItems = items
            .map(([id, item]) => ({
              id: Number(id),
              name: item.name,
              img: item.image.sprite,
              into: item.into,
              maps: item.maps[11],
              gold: {
                base: item.gold.base,
                purchasable: item.gold.purchasable,
                sell: item.gold.sell,
                total: item.gold.total,
              },
              stats: item.stats,
              tags: item.tags,
            }))
            .filter((item) => !FILTER_ID.includes(item.id))
            .filter((item) => item.gold.purchasable === true);

          dispatch({ type: "set_items", dataItems: lolItems });
          console.log("lolItems", lolItems);
        });
    }
    fetchLolItems();
  }, []);

  console.log("state", state);
  return (
    <>
      <h1>Legue of Legends Shop</h1>
      <div className="container">
        {state.lolItems.length > 0 ? (
          state.lolItems.map((item) => (
            <div key={item.id}>
              <h3>{item.name}</h3>
            </div>
          ))
        ) : (
          <p>Without items...</p>
        )}
      </div>
    </>
  );
}

// look for a better way for gold
// function goldI(id: number) {
//   const itemId = items.find(([itemId]) => Number(itemId) === id);
//   if (itemId) {
//     return [{
//       base: item.gold.base,
//       purchasable: item.gold.purchasable,
//       sell: item.gold.sell,
//       total: item.gold.total,
//     }];
//   }
// }
