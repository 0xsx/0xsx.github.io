import React from "react";
import ReactDOM from "react-dom";
import {Provider} from "react-redux";
import {HashRouter, Route} from "react-router-dom"
import {combineReducers, createStore} from "redux";



import AppShell from "./components/AppShell";

import nav from "./ar/nav-reducer";
import layout from "./ar/layout-reducer";


const combinedReducer = combineReducers({
  nav,
  layout
});

const store = createStore(combinedReducer);

ReactDOM.render(
  

  <Provider store={store}>
    <HashRouter>
      <Route path="" component={AppShell}/>
    </HashRouter>
  </Provider>,

  document.getElementById("app"));

