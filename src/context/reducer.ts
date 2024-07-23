import { Action } from "./action";
import { SET_USER_CHANNELS } from "./actions";
import State from "./statemodel";

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case SET_USER_CHANNELS:
      return {
        ...state,
        userChannels: action.payload,
      };
    default:
      return state;
  }
};

export default reducer;
