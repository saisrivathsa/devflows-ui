import { ToastsStore } from 'react-toasts'

import Api from '../lib/api'
import * as types from './types'
import constants from '../constants'
import { signout } from './loginActions'


export function fetchSingleProduct(productId, callbackOnSuccess = (() => {}), callbackOnError=((err) => { 
  console.log(err)
})) {
  return async (dispatch, getState) => {

    dispatch(setProductsFetching(true))

    let state = getState()
    let token = state.loginInfo.token
    console.log("token", token)
    Api.get(`${constants.BACKEND_URL}/products/${productId}`, {
      Authorization: token
    }).then(res => {
      dispatch(setSingleProductInfo(res))
    }).catch(({err, status}) => {
      dispatch(setProductsFetching(false))
      ToastsStore.error(`Error while fetching Product id: ${productId} - ${status} ${err.error || err.message || ''}`)
      console.log("err", err)

      if (err.error === "Not Authenticated") {
        dispatch(signout())
      }

      callbackOnError()
    })
  }
}


export function fetchSingleProductSettings(productId, callbackOnSuccess = (() => {}), callbackOnError=((err) => { 
  console.log(err)
})) {
  return async (dispatch, getState) => {

    dispatch(setProductsFetching(true))
    console.log("Getting settings")
    let state = getState()
    let token = state.loginInfo.token
    console.log("token", token)
    Api.get(`${constants.BACKEND_URL}/products/${productId}/settings/`, {
      Authorization: token
    }).then(res => {
      dispatch(setSingleProductSettingsInfo(res))
    }).catch(({err, status}) => {
      dispatch(setProductsFetching(false))
      ToastsStore.error(`Error while fetching product settings: ${productId} - ${status} ${err.error || err.message || ''}`)
      console.log("err", err)

      if (err.error === "Not Authenticated") {
        dispatch(signout())
      }

      callbackOnError()
    })
  }
}


export function fetchProducts(callbackOnSuccess = (() => {}), callbackOnError=((err) => { 
  console.log(err)
})) {
  return async (dispatch, getState) => {

    dispatch(setProductsFetching(true))

    let state = getState()
    let token = state.loginInfo.token
    console.log("token", token)
    Api.get(`${constants.BACKEND_URL}/products/`, {
      Authorization: token
    }).then(res => {
      dispatch(setProductsInfo(res.products))
    }).catch(({err, status}) => {
      dispatch(setProductsFetching(false))
      ToastsStore.error(`Error while fetching products - ${status} ${err.error || err.message || ''}`)
      console.log("err", err)

      if (err.error === "Not Authenticated") {
        dispatch(signout())
      }

      callbackOnError()
    })
  }
}

export function createProduct(product, callbackOnSuccess = (() => {}), callbackOnError=((err) => { 
  console.log(err)
})) {
  return async (dispatch, getState) => {

    console.log("new product", product)

    let state = getState()
    let token = state.loginInfo.token
    console.log("token", token)
    Api.post(`${constants.BACKEND_URL}/products/`, product, {
      Authorization: token
    }).then(res => {
      console.log("res", res)
      product.id = res.id

      ToastsStore.success('New Product created')
      callbackOnSuccess(product)
    }).catch(({err, status}) => {
      ToastsStore.error(`Error while creating product - ${status} ${err.error || err.message || ''}`)
      console.log("err", err)

      if (err.error === "Not Authenticated") {
        dispatch(signout())
      }

      callbackOnError()
    })
  }
}

export function saveProductSettings(productId, settings, callbackOnSuccess = (() => {}), callbackOnError=((err) => { 
  console.log(err)
})) {
  return async (dispatch, getState) => {

    dispatch(setProductSettingsSaving(productId, true))

    let state = getState()
    let token = state.loginInfo.token

    Api.put(`${constants.BACKEND_URL}/products/${productId}/settings/`, settings, {
      Authorization: token
    }).then(res => {
      console.log("res", res)
      dispatch(setProductSettingsSaving(productId, false))
      ToastsStore.success("Settings saved")
    }).catch(({err, status}) => {
      dispatch(setProductSettingsSaving(productId, false))
      ToastsStore.error(`Error while saving settings - ${status} - ${err.error || err.message || ''}`, 7000)
      console.log("err", err)

      if (err.error === "Not Authenticated") {
        dispatch(signout())
      }

      callbackOnError()
    })

  }
}

export function setProductsInfo(products) {
  return {
    type: types.SET_PRODUCTS_INFO,
    products
  }
}

export function setSingleProductInfo(product) {
  return {
    type: types.SET_SINGLE_PRODUCT_INFO,
    product
  }
}

export function setSingleProductSettingsInfo(settings) {
  return {
    type: types.SET_SINGLE_PRODUCT_SETTINGS_INFO,
    settings
  }
}

export function setProductsFetching(fetching) {
  return {
    type: types.SET_PRODUCTS_FETCHING,
    fetching
  }
}

export function setProductSettingsSaving(productId, saving) {
  return {
    type: types.SET_PRODUCT_SETTINGS_SAVING,
    productId,
    saving
  }
}
