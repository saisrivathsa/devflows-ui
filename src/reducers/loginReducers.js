
import * as utils from '../lib/utils'
import * as types from '../actions/types'
import createReducer from './createReducer'

let DEFAULT_STATE = {
  token: '',
  username: '',
  name: '',
  loggedIn: false,
}

function getInitialState() {
  let initial_state

  let localState = localStorage.getItem('loginInfo')
  if (localState && utils.isJson(localState)) {
    localState = JSON.parse(localState)
    
    if (localState.token && localState.username && localState.name && localState.loggedIn === true) {
      initial_state = localState
    } else {
      initial_state = DEFAULT_STATE
    }
    
  } else {
    initial_state = DEFAULT_STATE
  }
  
  return initial_state
}

export const loginInfo = createReducer(utils.copyDict(getInitialState()), {
  [types.SET_LOGIN_INFO]: (state, action) => {
    state = { ...state }

    state.token = action.token
    state.username = action.username
    state.name = action.name
    state.loggedIn = true

    localStorage.setItem('loginInfo', JSON.stringify(state))

    return state
  },
  [types.RESET]: (state, action) => {
    return utils.copyDict(getInitialState())
  },
})
