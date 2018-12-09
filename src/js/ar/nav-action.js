
export function navTo(pathParts) {
  return {
    type: "SET_NAV_PATH",
    payload: pathParts
  };
}

export function setSelectedAnchor(selectedAnchor) {
  return {
    type: "SET_SELECTED_ANCHOR",
    payload: selectedAnchor
  };
}


