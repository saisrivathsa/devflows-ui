import * as utils from '../lib/utils'
import * as types from '../actions/types'
import createReducer from './createReducer'

let INITIAL_STATE = {
  products: {
    //'<product_id>': {}
  },
  fetched: false,
  fetching: false,
}

export const productsInfo = createReducer(utils.copyDict(INITIAL_STATE), {
  [types.SET_PRODUCTS_INFO]: (state, action) => {
    state = { ...state }

    for (let product of action.products) {
      state.products[product.id] = product
    }
    state.fetched = true
    state.fetching = false

    return state
  },
  [types.SET_SINGLE_PRODUCT_INFO]: (state, action) => {
    state = { ...state }

    state.products[action.product.id] = action.product
    state.fetching = false
    return state
  },
  [types.SET_SINGLE_PRODUCT_SETTINGS_INFO]: (state, action) => {
    state = { ...state }

    state.products[action.settings.id].settings = action.settings
    state.fetching = false
    return state
  },
  [types.SET_PRODUCTS_FETCHING]: (state, action) => {
    state = { ...state }

    state.fetching = action.fetching

    return state
  },
  [types.SET_PRODUCT_SETTINGS_SAVING]: (state, action) => {
    state = { ...state }

    state.products[action.productId].settings.saving = action.saving

    return state
  },
  [types.RESET]: (state, action) => {
    return utils.copyDict(INITIAL_STATE)
  },
})
