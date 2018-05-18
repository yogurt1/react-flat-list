import React from "react";

class FlatListItem extends React.PureComponent {
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

export default FlatListItem;
