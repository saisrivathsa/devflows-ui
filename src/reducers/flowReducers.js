import * as utils from '../lib/utils'
import * as types from '../actions/types'
import createReducer from './createReducer'

let INITIAL_STATE = {
  flowsById: {
    // '<flow_id>': {
    //   flow: {/* Flow object */},
    //   fetched: false,
    //   fetching: false
    // }
  },
  flowEnvsById: {
    // '<flow_id>': {
    //   envs: [{/* Env object */}] , // list of env
    //   flowJsonByEnvName: {
    //     <env_name>: {
    //       flowJson: {},
    //       configJson: {},
    //       fetched: false,
    //       fetching: false,
    //       saving: false,
    //       savingMessage: '',
    //     }
    //   }
    //   selectedEnv: index
    //   fetched: false,
    //   fetching: false,
    // }
  },
  publishedFlowEnvsById: {},
  flowIdsByProduct: {
    // '<product_id>': {
    //   flowIds: [],
    //   fetched: false,
    //   fetching: false
    // }
  }
}

export const flowsInfo = createReducer(utils.copyDict(INITIAL_STATE), {
  [types.SET_FLOWS_INFO]: (state, action) => {
    state = { ...state }

    state.flowIdsByProduct[action.productId] = {
      flowIds: action.flows,//.map(flow => flow.id),
      fetched: true,
      fetching: false,
    }
    for (let flow of action.flows) {
      state.flowsById[flow.id] = {
        flow: flow,
        fetched: true,
        fetching: false,
      }
    }

    return state
  },
  [types.SET_FLOWS_FETCHING]: (state, action) => {
    state = { ...state }

    if (state.flowIdsByProduct[action.productId]) {
      state.flowIdsByProduct[action.productId]['fetching'] = action.fetching
    } else {
      state.flowIdsByProduct[action.productId] = {
        flowIds: [],
        fetched: false,
        fetching: action.fetching
      }
    }

    return state
  },
  [types.SET_FLOW_ENV_INFO]: (state, action) => {
    state = { ...state }

    state.flowEnvsById[action.flowId] = {
      envs: action.envs,
      fetched: true,
      fetching: false,
    }
    // state.flowsById[action.flowId] = {
    //   flow: action.flow,
    //   fetched: true,
    //   fetching: false,
    // }
    
    return state
  },
  [types.SET_FLOW_SELECTED_ENV]: (state, action) => {
    state = { ...state }

    if (state.flowEnvsById[action.flowId]) {
      state.flowEnvsById[action.flowId].selectedEnv = action.selectedEnv
    }

    return state
  },
  [types.SET_FLOW_ENV_FETCHING]: (state, action) => {
    state = { ...state }

    if (!state.flowEnvsById[action.flowId]) {
      state.flowEnvsById[action.flowId] = {
        fetched: false,
        fetching: action.fetching
      }
    }
    state.flowEnvsById[action.flowId].fetching = action.fetching

    return state
  },
  [types.SET_FLOW_JSON_INFO]: (state, action) => {
    state = { ...state }

    if (!state.flowEnvsById[action.flowId]) {
      state.flowEnvsById[action.flowId] = {
        flowJsonByEnvName: {
          [action.envName]: { 
            flowJson: action.flowJson,
            configJson: action.configJson,
            fetched: true, fetching: false, 
          }
        }
      }
    }
    if (!state.flowEnvsById[action.flowId].flowJsonByEnvName) {
      state.flowEnvsById[action.flowId].flowJsonByEnvName = {
        [action.envName]: { 
          flowJson: action.flowJson,
          configJson: action.configJson,
          fetched: true, fetching: false, 
        }
      }
    }
    if (!state.flowEnvsById[action.flowId].flowJsonByEnvName[action.envName]) {
      state.flowEnvsById[action.flowId].flowJsonByEnvName[action.envName] = {
        flowJson: action.flowJson,
        configJson: action.configJson,
        fetched: true, fetching: false
      }
    }
    state.flowEnvsById[action.flowId].flowJsonByEnvName[action.envName].flowJson = utils.copyDict(action.flowJson)
    state.flowEnvsById[action.flowId].flowJsonByEnvName[action.envName].configJson = utils.copyDict(action.configJson)
    state.flowEnvsById[action.flowId].flowJsonByEnvName[action.envName].fetched = true
    state.flowEnvsById[action.flowId].flowJsonByEnvName[action.envName].fetching = false

    return state
  },
  [types.SET_PUBLISHED_FLOW_JSON_INFO]: (state, action) => {
    state = { ...state }

    if (!state.publishedFlowEnvsById[action.flowId]) {
      state.publishedFlowEnvsById[action.flowId] = {
        publishedFlowJsonByEnvName: {
          [action.envName]: { 
            publishedFlowJson: action.flowJson,
            publishedConfigJson: action.configJson,
            fetched: true, fetching: false, 
          }
        }
      }
    }
    if (!state.publishedFlowEnvsById[action.flowId].publishedFlowJsonByEnvName) {
      state.publishedFlowEnvsById[action.flowId].publishedFlowJsonByEnvName = {
        [action.envName]: { 
          publishedFlowJson: action.flowJson,
          publishedConfigJson: action.configJson,
          fetched: true, fetching: false, 
        }
      }
    }
    if (!state.publishedFlowEnvsById[action.flowId].publishedFlowJsonByEnvName[action.envName]) {
      state.publishedFlowEnvsById[action.flowId].publishedFlowJsonByEnvName[action.envName] = {
        publishedFlowJson: action.flowJson,
        publishedConfigJson: action.configJson,
        fetched: true, fetching: false
      }
    }
    state.publishedFlowEnvsById[action.flowId].publishedFlowJsonByEnvName[action.envName].publishedFlowJson = utils.copyDict(action.flowJson)
    state.publishedFlowEnvsById[action.flowId].publishedFlowJsonByEnvName[action.envName].publishedConfigJson = utils.copyDict(action.configJson)
    state.publishedFlowEnvsById[action.flowId].publishedFlowJsonByEnvName[action.envName].fetched = true
    state.publishedFlowEnvsById[action.flowId].publishedFlowJsonByEnvName[action.envName].fetching = false

    return state
  },
  [types.SET_FLOW_JSON_FETCHING]: (state, action) => {
    state = { ...state }

    if (!state.flowEnvsById[action.flowId]) {
      state.flowEnvsById[action.flowId] = {
        flowJsonByEnvName: {
          [action.envName]: { fetched: false, fetching: action.fetching, }
        }
      }
    }
    if (!state.flowEnvsById[action.flowId].flowJsonByEnvName) {
      state.flowEnvsById[action.flowId].flowJsonByEnvName = {
        [action.envName]: { fetched: false, fetching: action.fetching, }
      }
    }
    
    if (!state.flowEnvsById[action.flowId].flowJsonByEnvName[action.envName]) {
      state.flowEnvsById[action.flowId].flowJsonByEnvName[action.envName] = {
        fetched: false, fetching: action.fetching
      }
    }
    state.flowEnvsById[action.flowId].flowJsonByEnvName[action.envName].fetching = action.fetching

    return state
  },
  [types.SET_PUBLISHED_FLOW_JSON_FETCHING]: (state, action) => {
    state = { ...state }

    if (!state.publishedFlowEnvsById[action.flowId]) {
      state.publishedFlowEnvsById[action.flowId] = {
        publishedFlowJsonByEnvName: {
          [action.envName]: { fetched: false, fetching: action.fetching, }
        }
      }
    }
    if (!state.publishedFlowEnvsById[action.flowId].publishedFlowJsonByEnvName) {
      state.publishedFlowEnvsById[action.flowId].publishedFlowJsonByEnvName = {
        [action.envName]: { fetched: false, fetching: action.fetching, }
      }
    }
    
    if (!state.publishedFlowEnvsById[action.flowId].publishedFlowJsonByEnvName[action.envName]) {
      state.publishedFlowEnvsById[action.flowId].publishedFlowJsonByEnvName[action.envName] = {
        fetched: false, fetching: action.fetching
      }
    }
    state.publishedFlowEnvsById[action.flowId].publishedFlowJsonByEnvName[action.envName].fetching = action.fetching

    return state
  },
  [types.SET_FLOW_JSON_SAVING]: (state, action) => {
    state = { ...state }

    if (!state.flowEnvsById[action.flowId]) {
      state.flowEnvsById[action.flowId] = {
        flowJsonByEnvName: {
          [action.envName]: { saving: action.saving, savingMessage: action.savingMessage }
        }
      }
    }
    if (!state.flowEnvsById[action.flowId].flowJsonByEnvName) {
      state.flowEnvsById[action.flowId].flowJsonByEnvName = {
        [action.envName]: { saving: action.saving, savingMessage: action.savingMessage }
      }
    }
    
    if (!state.flowEnvsById[action.flowId].flowJsonByEnvName[action.envName]) {
      state.flowEnvsById[action.flowId].flowJsonByEnvName[action.envName] = {
        saving: action.saving, savingMessage: action.savingMessage
      }
    }
    state.flowEnvsById[action.flowId].flowJsonByEnvName[action.envName].saving = action.saving
    state.flowEnvsById[action.flowId].flowJsonByEnvName[action.envName].savingMessage = action.savingMessage

    return state
  },
  [types.RESET]: (state, action) => {
    return utils.copyDict(INITIAL_STATE)
  },
})
