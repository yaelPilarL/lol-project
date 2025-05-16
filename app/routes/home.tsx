import { useEffect, useReducer } from "react";

const initialState = {
  lolItems: [],
};

const ACTION = {
  SET_ITEMS: "set_items",
};

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
      const items = await fetch(
        "https://ddragon.leagueoflegends.com/cdn/14.19.1/data/en_US/item.json",
      ).then((response) => {
        return response.json();
      });
      dispatch({ type: "set_items", dataItems: items.data });

      console.log("DATA", items);
    }
    fetchLolItems();
  }, []);

  console.log("Estado actual:", state);

  return (
    <>
      <h1>Legue of Legends Shop</h1>
      {state.lolItems.length > 0 ? (
        state.lolItems.map((item) => (
          <div key={item.name}>
            <h3>{item.name}</h3>
          </div>
        ))
      ) : (
        <p>Cargando items...</p>
      )}
    </>
  );
}
