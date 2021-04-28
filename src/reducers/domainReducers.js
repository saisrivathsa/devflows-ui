import * as utils from '../lib/utils'
import * as types from '../actions/types'
import createReducer from './createReducer'

let INITIAL_STATE = {
  domains: {
    //'<domain_id>': {}
  },
  fetched: false,
  fetching: false,
}

export const domainsInfo = createReducer(utils.copyDict(INITIAL_STATE), {
  [types.SET_DOMAINS_INFO]: (state, action) => {
    state = { ...state }

    for (let domain of action.domains) {
      state.domains[domain.id] = domain
    }
    state.fetched = true
    state.fetching = false

    return state
  },
  [types.SET_SINGLE_DOMAIN_INFO]: (state, action) => {
    state = { ...state }

    state.domains[action.domain.id] = action.domain
    state.fetching = false
    return state
  },
  [types.SET_DOMAINS_FETCHING]: (state, action) => {
    state = { ...state }

    state.fetching = action.fetching

    return state
  },
  [types.RESET]: (state, action) => {
    return utils.copyDict(INITIAL_STATE)
  },
})
