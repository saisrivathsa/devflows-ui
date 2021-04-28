import * as utils from '../lib/utils'
import * as types from '../actions/types'
import createReducer from './createReducer'

let INITIAL_STATE = {
  invocablesById: {
    // '<invocable_id>': {
    //   invocable: {/* Invocable object */},
    //   fetched: false,
    //   fetching: false,
    //   saving: false,
    //   savingMessage: '',
    // }
  },
  invocableIdsByDomain: {
    // '<domain_id>': {
    //   invocableIds: [],
    //   fetched: false,
    //   fetching: false
    // }
  }
}

export const invocablesInfo = createReducer(utils.copyDict(INITIAL_STATE), {
  [types.SET_INVOCABLES_INFO]: (state, action) => {
    state = { ...state }

    state.invocableIdsByDomain[action.domainId] = {
      // invocableIds: action.invocables.map(invocable => invocable.id),
      invocableIds: action.invocables,//.map(invocable => invocable.id),
      fetched: true,
      fetching: false,
    }
    // for (let invocable of action.invocables) {
    //   state.invocablesById[invocable.id] = {
    //     invocable: invocable,
    //     fetched: true,
    //     fetching: false,
    //   }
    // }

    return state
  },
  [types.SET_SINGLE_INVOCABLE_INFO]: (state, action) => {
    state = { ...state }

    if (!(action.domainId in state.invocableIdsByDomain)) {
      state.invocableIdsByDomain[action.domainId] = {
        invocableIds: [],
        fetched: false,
        fetching: false,
      }  
    }
    // if (!(action.invocable.id in state.invocableIdsByDomain[action.domainId].invocableIds)) {
    //   state.invocableIdsByDomain[action.domainId].invocableIds.push(action.invocable)
    // }
    state.invocablesById[action.invocable.id] = {
      invocable: action.invocable,
      fetched: true,
      fetching: false
    }

    return state
  },
  [types.SET_SINGLE_INVOCABLE_FETCHING]: (state, action) => {
    state = { ...state }

    if (!(action.invocableId in state.invocablesById)) {
      state.invocablesById[action.invocableId] = {
        fetched: false,
        fetching: action.fetching
      }
    }
    state.invocablesById[action.invocableId].fetching = action.fetching

    return state
  },
  [types.SET_INVOCABLES_FETCHING]: (state, action) => {
    state = { ...state }

    if (state.invocableIdsByDomain[action.domainId]) {
      state.invocableIdsByDomain[action.domainId]['fetching'] = action.fetching
    } else {
      state.invocableIdsByDomain[action.domainId] = {
        invocableIds: [],
        fetched: false,
        fetching: action.fetching
      }
    }

    return state
  },
  [types.SET_SINGLE_INVOCABLE_SAVING]: (state, action) => {
    state = { ...state }

    if (!(action.invocableId in state.invocablesById)) {
      state.invocablesById[action.invocableId] = {
        saving: action.saving,
        savingMessage: action.savingMessage
      }
    }
    state.invocablesById[action.invocableId].saving = action.saving
    state.invocablesById[action.invocableId].savingMessage = action.savingMessage

    return state
  },
  [types.RESET]: (state, action) => {
    return utils.copyDict(INITIAL_STATE)
  },
})
