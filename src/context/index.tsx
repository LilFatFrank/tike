import { createContext, FC, useReducer } from "react";
import State from "./statemodel";
import initialState from "./state";
import { Action } from "./action";
import reducer from "./reducer";

interface ContextProps {
  children: React.ReactNode;
}

export const AppContext = createContext<[State, React.Dispatch<Action>]>([
  initialState,
  () => {},
]);

export const AppContextProvider: FC<ContextProps> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <AppContext.Provider value={[state, dispatch]}>
      {children}
    </AppContext.Provider>
  );
};
