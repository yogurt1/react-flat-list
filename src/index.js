import React from "react";
import { render } from "react-dom";
import FlatList from "./FlatList";
import shortid from "shortid";
import randomColor from "random-color";
import randomWords from "random-words";

const items = Array.from({ length: 10000 }).map(() => ({
  id: shortid(),
  text: randomWords({ min: 20, max: 150 }).join(" "),
  color: randomColor().hexString()
}));

global.shortid = shortid;

const Item = ({ item }) => (
  <div
    style={{
      backgroundColor: item.color,
      fontSize: 14,
      fontFamily: "sans-serif",
      padding: 8,
      lineHeight: 1.3
    }}
  >
    {item.text}
  </div>
);

const App = () => (
  <div
    style={{
      width: "70%",
      height: "80%",
      magrin: 10
    }}
  >
    <FlatList defaultHeight={70} size={600} items={items}>
      {({ item }) => <Item key={item.id} item={item} />}
    </FlatList>
  </div>
);

render(<App />, document.getElementById("root"));
