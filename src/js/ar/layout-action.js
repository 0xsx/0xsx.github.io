
export function setCurrentModalWindow(name) {
  return {
    type: "SET_CURRENT_MODAL_WINDOW",
    payload: name
  };
}


export function setPageWidth(width) {
  return {
    type: "SET_PAGE_WIDTH",
    payload: width
  };
}



export function setPageHeight(height) {
  return {
    type: "SET_PAGE_HEIGHT",
    payload: height
  };
}



export function setModalWidth(width) {
  return {
    type: "SET_MODAL_WIDTH",
    payload: width
  };
}



export function setModalHeight(height) {
  return {
    type: "SET_MODAL_HEIGHT",
    payload: height
  };
}


export function setIsLoading(isLoading) {
  return {
    type: "SET_IS_LOADING",
    payload: isLoading
  };
}




export function setInitScrollOffset(offset) {
  return {
    type: "SET_INIT_SCROLL_OFFSET",
    payload: offset
  };
}


export function setHeaderHeight(height) {
  return {
    type: "SET_HEADER_HEIGHT",
    payload: height
  };
}


