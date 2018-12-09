import expect from "expect"

const defaultState = {
  pathParts: [""],
  selectedAnchor: ""
};

export default function reducer(state=defaultState, action) {
  
  switch (action.type) {

    case "SET_NAV_PATH": {
      expect(action.payload).toBeInstanceOf(Array)
      var path = action.payload;
      
      var prunedPath = [];
      for (var i=0; i < path.length; ++i) {
        if (path[i] !== "") {
          var part = path[i];

          while (part[0] === "/") {
            part = part.slice(1, part.length);
          }

          prunedPath.push(part);
        }


      }
      return {...state, pathParts: prunedPath}
    }

    case "SET_SELECTED_ANCHOR": {
      return {...state, selectedAnchor: action.payload}
    }

    default: {
      return state;
    }

  }

}

