import React from "react";
import {connect} from "react-redux";
import {Redirect} from "react-router-dom"

import * as layout from "../ar/layout-action";
import * as nav from "../ar/nav-action";

import AppMain from "./AppMain"


@connect((store) => {
  return {
    pathParts: store.nav.pathParts,
    medScreenSize: store.layout.medScreenSize,
    smallScreenSize: store.layout.smallScreenSize,
    largeHeaderHeight: store.layout.largeHeaderHeight,
    medHeaderHeight: store.layout.medHeaderHeight,
    smallHeaderHeight: store.layout.smallHeaderHeight
  };
})
class AppShell extends React.Component {

  constructor(props, context) {
    super(props, context);

    this.prevLocation = this.props.location.pathname;
    this.prevPathParts = this.props.pathParts;

    this.navChanged = false;
    this.locationChanged = false;
    this.prevChanged = true;

    this.updateDimensions = this.updateDimensions.bind(this);

    this.props.dispatch(nav.navTo(this.prevLocation.split("-")));

  }


  updateDimensions() {
    this.props.dispatch(layout.setPageHeight(window.innerHeight));
    this.props.dispatch(layout.setPageWidth(window.innerWidth));

    if (window.innerWidth > this.props.medScreenSize) {
      this.props.dispatch(layout.setHeaderHeight(this.props.largeHeaderHeight));
    }
    else if (window.innerWidth > this.props.smallScreenSize) {
      this.props.dispatch(layout.setHeaderHeight(this.props.medHeaderHeight));
    }
    else {
      this.props.dispatch(layout.setHeaderHeight(this.props.smallHeaderHeight));
    }
  }


  componentDidMount() {
    this.updateDimensions();
    window.addEventListener("resize", this.updateDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions);
  }


  componentWillUpdate(prevProps) {

    var newLocationPathParts = this.props.location.pathname.split("-");
    
    while (newLocationPathParts[0][0] === "/") {
      newLocationPathParts[0] = newLocationPathParts[0].slice(1, newLocationPathParts[0].length);
    }

    if (this.props.pathParts !== newLocationPathParts) {
      this.locationChanged = this.props.location.pathname !== this.prevLocation && !this.prevChanged;
      this.navChanged = this.props.pathParts !== this.prevPathParts && !this.prevChanged;

      this.prevLocation = this.props.location.pathname;
      this.prevPathParts = this.props.pathParts;
      this.prevChanged = this.locationChanged || this.navChanged;

    }

  }




  render() {
    return (
      <div>
        {this.navChanged && !this.locationChanged ?
          <Redirect to={this.props.pathParts.join("-")}/> : null}
        <AppMain />
      </div>

      
    );
  }


}

export default AppShell;

