import { 
  compose,
  createStore, 
  applyMiddleware, 
} from "redux"
import { createLogger } from "redux-logger"
import thunkMidddleware from 'redux-thunk'

import reducer from "../reducers"
import 'bootstrap/dist/css/bootstrap.css'

const loggerMiddleware = createLogger({
  predicate: (getState, action) => process.env.NODE_ENV
})

function configureStore(initialState) {
  const enhancer = process.env.NODE_ENV === 'development' 
                  ? compose(applyMiddleware(thunkMidddleware, loggerMiddleware), )
                  : compose(applyMiddleware(thunkMidddleware), )
  return createStore(reducer, initialState, enhancer)
}

export const store = configureStore({})
