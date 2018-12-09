import React from "react";
import {Scrollbars} from "react-custom-scrollbars";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import * as nav from "../ar/nav-action";




class Anchor extends React.Component {

  constructor(props, context) {
    super(props, context);

    
  }


  render() {
    
    const childMap = React.Children.map(this.props.children, child => {
      return (
        <div id={"anchor-" + this.props.name}>{child}</div> 
      );
    });


    return (
      <div style={{minHeight: this.props.minHeight}}>
        {childMap}
      </div>
    )
  }
}





class AnchoredScrollbars extends Scrollbars {

  componentDidMount() {

    super.componentDidMount();


    for (let child of this.props.children) {
      if (child.type.name === "Anchor") {
        if (this.props.selectedAnchor === child.props.name) {
          let elem = document.getElementById("anchor-" + child.props.name);
          this.scrollTop(elem.offsetTop < this.props.headerHeight ? 0
                         : elem.offsetTop - this.props.headerHeight);
          break;
        } 
      }
    }
  }


  componentDidUpdate(prevProps) {

    if (this.props.initScrollOffset === null) {
      for (let child of this.props.children) {
        if (child.type.name === "Anchor") {
          if (this.props.selectedAnchor === child.props.name) {
            let elem = document.getElementById("anchor-" + child.props.name);
            this.scrollTop(elem.offsetTop < this.props.headerHeight ? 0
                           : elem.offsetTop - this.props.headerHeight);
            break;
          }
        }
      }
    }

    else {
      this.scrollTop(this.props.initScrollOffset);
    }
  }



}


AnchoredScrollbars.propTypes = {
  ...Scrollbars.propTypes,
  selectedAnchor: PropTypes.string,
  initScrollOffset: PropTypes.number
};


AnchoredScrollbars.defaultProps = {
  ...Scrollbars.defaultProps,
  selectedAnchor: "",
  initScrollOffset: null
};




@connect((store) => {
  return {
    pageHeight: store.layout.pageHeight,
    pageWidth: store.layout.pageWidth,
    headerHeight: store.layout.headerHeight,
    initScrollOffset: store.layout.initScrollOffset,
    pathParts: store.nav.pathParts,
  };
}, null, null, {withRef: true})
class AnchoredScroll extends React.Component {

  constructor(props, context) {
    super(props, context);

    this.anchorOffsets = {}
    this.scrollbarsRef = React.createRef();
  }




  componentDidMount() {

    for (let child of this.props.children) {
      if (child.type.name === "Anchor") {
        let elem = document.getElementById("anchor-" + child.props.name);
        this.anchorOffsets[child.props.name] = elem.offsetTop;
      }
    }
  }




  componentWillUpdate(nextProps) {

    for (let child of nextProps.children) {
      if (child.type.name === "Anchor") {
        let elem = document.getElementById("anchor-" + child.props.name);
        this.anchorOffsets[child.props.name] = elem.offsetTop;
      }
    }
  }



  getScrollTop() {
    return this.scrollbarsRef.current.getScrollTop();
  }



  render() {

    const selectedName = this.props.pathParts.join("-");

    return (<AnchoredScrollbars ref={this.scrollbarsRef}

      style={{height: this.props.pageHeight, minHeight: this.props.pageHeight,
              width: this.props.pageWidth, minWidth: this.props.pageWidth}}
      headerHeight={this.props.headerHeight}

      autoHide
      autoHideTimeout={1000}
      autoHideDuration={200}

      selectedAnchor={selectedName}

      initScrollOffset={this.props.initScrollOffset}

      onScrollFrame={(e)=>{

        let closestDist = Infinity;
        let closestName = "";
        let closestAnchorFound = false;

        for (let key in this.anchorOffsets) {
          let dist = Math.abs(e.scrollTop - this.anchorOffsets[key] - this.props.headerHeight);
          if (dist < closestDist) {
            closestDist = dist;
            closestName = key;
            closestAnchorFound = true;
          }
        }

        window.location.hash = "#/" + closestName;
        this.props.dispatch(nav.setSelectedAnchor(closestName));
        
      }}
      >{this.props.children}</AnchoredScrollbars>);
  }



}


export {AnchoredScroll};
export {Anchor};
