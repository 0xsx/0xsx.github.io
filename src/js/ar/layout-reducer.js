
const defaultState = {
  currentModalWindow: null,
  pageWidth: 600,
  pageHeight: 800,
  modalWidth: 600,
  modalHeight: 800,
  isLoading: true,
  initScrollOffset: null,  // null means no offset is saved.
  headerHeight: 80,
  modalPadding: 16,
  largeHeaderHeight: 80,  // Should match the css value.
  medHeaderHeight: 60,  // Should match the css value.
  smallHeaderHeight: 40,  // Should match the css value.
  medScreenSize: 700,  // Should match the css value.
  smallScreenSize: 560,  // Should match the css value.
  largeImageCanvasSize: 300,  // Should match the css value.
  medImageCanvasSize: 200,  // Should match the css value.
  smallImageCanvasSize: 128  // Should match the css value
};



export default function reducer(state=defaultState, action) {
  
  switch (action.type) {

    case "SET_CURRENT_MODAL_WINDOW": {
      return {...state, currentModalWindow: action.payload}
    }

    case "SET_PAGE_WIDTH": {
      return {...state, pageWidth: action.payload}
    }

    case "SET_PAGE_HEIGHT": {
      return {...state, pageHeight: action.payload}
    }

    case "SET_MODAL_WIDTH": {
      return {...state, modalWidth: action.payload}
    }

    case "SET_MODAL_HEIGHT": {
      return {...state, modalHeight: action.payload}
    }

    case "SET_IS_LOADING": {
      return {...state, isLoading: action.payload}
    }

    case "SET_INIT_SCROLL_OFFSET": {
      return {...state, initScrollOffset: action.payload}
    }

    case "SET_HEADER_HEIGHT": {
      return {...state, headerHeight: action.payload}
    }


    default: {
      return state;
    }

  }

}

