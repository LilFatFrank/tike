import { Action } from "./action";
import { SET_USER_CHANNELS, SET_PAGE_NOT_FOUND, SET_ERROR } from "./actions";
import State from "./statemodel";

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case SET_USER_CHANNELS:
      return {
        ...state,
        userChannels: action.payload,
      };
    case SET_PAGE_NOT_FOUND:
      return {
        ...state,
        pageNotFound: action.payload,
      };
    case SET_ERROR:
      return {
        ...state,
        appError: action.payload,
      };
    default:
      return state;
  }
};

export default reducer;
