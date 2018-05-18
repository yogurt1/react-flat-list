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

export default FlatListCache;
