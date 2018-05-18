import React from "react";
import PropTypes from "prop-types";
import VirtualList from "react-tiny-virtual-list";
import { isNumber, isString, isObject } from "typechecker";

// TODO: Multi-column, use Grid
// TODO: Dynamic cell width

class FlatListCache {
  sizes = new Map();
  defaultSize = 0;

  getSize(key) {
    return this.sizes.get(key) || this.defaultSize;
  }

  setSize(key, newSize) {
    const lastSize = this.getSize(key);

    if (newSize === lastSize) {
      return false;
    }

    if (newSize === this.defaultSize) {
      this.sizes.delete(key);
    } else {
      this.sizes.set(key, newSize);
    }

    return true;
  }

  setDefaultSize(defaultSize) {
    this.defaultSize = defaultSize;
  }

  removeSize(item) {
    this.sizes.delete(item);
  }

  clearSizes() {
    this.sizes = new WeakMap();
  }
}

class FlatListItemMeasurer extends React.PureComponent {
  containerRef = React.createRef();

  measure = () => {
    const { measure, index } = this.props;
    const element = this.containerRef.current;
    const styleHeight = element.style.height;
    element.style.height = "auto";
    const newHeight = element.firstChild.offsetHeight;
    element.style.height = styleHeight;
    measure({
      index,
      height: newHeight
    });
  };

  componentDidMount() {
    const step = () => {
      this.measure();
      this.rafId = requestAnimationFrame(step);
    };

    this.rafId = requestAnimationFrame(step);
  }

  componentWillUnmount() {
    cancelAnimationFrame(this.rafId);
  }

  render() {
    const {
      measure,
      children,
      style,
      item,
      index,
      itemProps,
      ...props
    } = this.props;

    return (
      <div {...props} ref={this.containerRef} style={style}>
        {children({
          ...itemProps,
          index,
          item,
          measure: this.measure
        })}
      </div>
    );
  }
}

class FlatList extends React.PureComponent {
  cache = new FlatListCache();
  listRef = React.createRef();

  getKey(index) {
    const { items, itemKey } = this.props;
    const item = items[index] || null;
    const key = item && itemKey({ index, item });
    return key || `${index}`;
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
      <FlatListItemMeasurer
        key={this.getKey(index)}
        index={index}
        item={items[index] || null}
        itemProps={itemProps}
        style={style}
        measure={this.measure}
      >
        {children}
      </FlatListItemMeasurer>
    );
  };

  render() {
    const { defaultHeight, height, items } = this.props;
    this.cache.setDefaultSize(defaultHeight);
    return (
      <VirtualList
        ref={this.listRef}
        height={height}
        itemSize={this.itemSize}
        itemCount={items.length}
        renderItem={this.renderItem}
        estimatedItemSize={defaultHeight}
        items={items}
      />
    );
  }
}

const defaultKeyGetter = ({ item, index }) => {
  if (isObject(item) && item.id) {
    const { id } = item;

    if (isNumber(id) || isString(id)) {
      return `${id}`;
    }
  }

  return `${index}`;
};

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
  height: PropTypes.number,

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
  height: "100%"
};

export default FlatList;
