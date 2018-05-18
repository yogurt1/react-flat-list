import React from "react";
import PropTypes from "prop-types";
import VirtualList from "react-tiny-virtual-list";
import FlatListCache from "./FlatListCache";
import FlatListItem from "./FlatListItem";

const isValidKey = key => {
  if (typeof key === "string" && key.length > 0) {
    return true;
  }

  if (typeof key === "number" && !isNaN(key)) {
    return true;
  }

  return false;
};

const defaultKeyGetter = ({ item, index }) => {
  if (typeof item === "object" && item !== null) {
    if (isValidKey(item.id)) {
      return item.id;
    }

    if (isValidKey(item.key)) {
      return item.key;
    }
  }

  return index;
};

class FlatList extends React.PureComponent {
  cache = new FlatListCache();
  listRef = React.createRef();

  getKey(index) {
    const { items, itemKey } = this.props;
    const item = items[index] || null;
    const key = item && itemKey({ index, item });
    const result = isValidKey(key) ? key : index;
    return `${result}`;
  }

  itemSize = index => {
    const key = this.getKey(index);
    const height = this.cache.getSize(key);
    return height;
  };

  measure = ({ index, height }) => {
    if (height !== this.itemSize(index)) {
      const key = this.getKey(index);
      this.cache.setSize(key, height);
      this.listRef.current.recomputeSizes(index);
      this.listRef.current.forceUpdate();
      this.forceUpdate();
    }
  };

  renderItem = ({ style, index }) => {
    const { children, items, itemProps } = this.props;
    return (
      <FlatListItem
        key={this.getKey(index)}
        index={index}
        item={items[index] || null}
        itemProps={itemProps}
        style={style}
        measure={this.measure}
      >
        {children}
      </FlatListItem>
    );
  };

  render() {
    const { defaultHeight, size, items } = this.props;
    this.cache.setDefaultSize(defaultHeight);
    return (
      <VirtualList
        ref={this.listRef}
        height={size}
        itemSize={this.itemSize}
        itemCount={items.length}
        renderItem={this.renderItem}
        estimatedItemSize={defaultHeight}
      />
    );
  }
}

FlatList.propTypes = {
  /**
   * Items
   * @type {T[]}
   */
  items: PropTypes.array,

  /**
   * Key getter
   * @type {function({ item: T, index: number }): string|number}
   */
  itemKey: PropTypes.func,

  /**
   * Estimated item height
   * @type {number}
   */
  defaultHeight: PropTypes.number,

  /**
   * Height (100% default)
   * @type {number}
   */
  size: PropTypes.number,

  /**
   * Renderer
   * @type {function({ item: T, index: number, visible: boolean, scrolling: boolean }): void}
   */
  children: PropTypes.func.isRequired
};

FlatList.defaultProps = {
  items: [],
  itemKey: defaultKeyGetter,
  defaultHeight: 0,
  size: "100%"
};

export default FlatList;
