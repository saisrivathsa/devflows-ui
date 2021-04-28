import _ from 'lodash'
import { ToastsStore } from 'react-toasts'

import Api from '../lib/api'
import * as types from './types'
import constants from '../constants'
import * as utils from '../lib/utils'
import { signout } from './loginActions'


export function fetchInvocables(domainId, callbackOnSuccess = (() => {}), callbackOnError=((err) => { 
  console.log(err)
})) {
  return async (dispatch, getState) => {

    dispatch(setInvocablesFetching(domainId, true))

    let state = getState()
    let token = state.loginInfo.token
    console.log("token", token)
    Api.get(`${constants.BACKEND_URL}/domains/${domainId}/invocables/`, {
      Authorization: token
    }).then(res => {
      console.log("res", res)

      dispatch(setInvocablesInfo(domainId, res.invocables))
    }).catch(({err, status}) => {
      dispatch(setInvocablesFetching(domainId, false))
      ToastsStore.error(`Error while fetching invocables - ${status} ${err.error || err.message || ''}`)
      console.log("err", err)

      if (err.error === "Not Authenticated") {
        dispatch(signout())
      }

      callbackOnError()
    })
  }
}


export function saveInvocable(domainId, invocableId, invocable, callbackOnSuccess = (() => {}), callbackOnError=((err) => { 
  console.log(err)
})) {
  return async (dispatch, getState) => {

    dispatch(setSingleInvocableSaving(invocableId, true, 'Saving Invocable'))

    let state = getState()
    let token = state.loginInfo.token
    console.log("token", token)

    if(invocable.description === ""){
      dispatch(setSingleInvocableSaving(invocableId, false, ''))
      ToastsStore.error(`Description cannot be empty`)
      return
    }

    if (!utils.isInputValidated(invocable)){
        dispatch(setSingleInvocableSaving(invocableId, false, ''))
        return
    }

    if (!utils.isOutputValidated(invocable)){
      dispatch(setSingleInvocableSaving(invocableId, false, ''))
      return
    }

    let fields = constants.INVOCABLE_CONFIG['JSON_INPUT_FIELDS']
    for (var i = 0; i < fields.length; i++){
      if(!utils.isJson(invocable[fields[i]])) {
        dispatch(setSingleInvocableSaving(invocableId, false, ''))
        ToastsStore.error(fields[i] + ` is not a valid json`)
        return
      }
    }

    Api.put(`${constants.BACKEND_URL}/domains/${domainId}/invocables/${invocableId}/`, {
      invocable_definition_json: JSON.parse(invocable.invocable_definition_json),
      input_schema: JSON.parse(invocable.input_schema),
      output_schema: JSON.parse(invocable.output_schema),
      sample_input: JSON.parse(invocable.sample_input),
      sample_output: JSON.parse(invocable.sample_output),
      description: invocable.description,
      input_params: invocable.input_params,
      input_constraints: invocable.input_constraints,
      output_params: invocable.output_params,
      list_secret: invocable.list_secret,
      get_secret: invocable.get_secret,
      features: invocable.features,
      working: invocable.working,
      additional_comments: invocable.additional_comments
    }, {
      Authorization: token
    }).then(res => {
      console.log("res", res)
      dispatch(setSingleInvocableSaving(invocableId, false, ''))
      ToastsStore.success("Invocable Saved")
      callbackOnSuccess()
    }).catch(({err, status}) => {
      dispatch(setSingleInvocableSaving(invocableId, false, ''))
      ToastsStore.error(`Error while saving invocables - ${status} ${err.error || err.message || ''}`)
      console.log("err", err)

      if (err.error === "Not Authenticated") {
        dispatch(signout())
      }

      callbackOnError()
    })
    
  }
}

export function publishInvocable(domainId, invocableId, callbackOnSuccess = (() => {}), callbackOnError=((err) => { 
  console.log(err)
})) {
  return async (dispatch, getState) => {

    dispatch(setSingleInvocableSaving(invocableId, true, 'Publishing Invocable'))

    let state = getState()
    let token = state.loginInfo.token
    console.log("token", token)
    Api.put(`${constants.BACKEND_URL}/domains/${domainId}/invocables/${invocableId}/publish/`, {
      "is_published": true
    }, {
      Authorization: token
    }).then(res => {
      console.log("res", res)
      dispatch(setSingleInvocableSaving(invocableId, false, ''))
      ToastsStore.success("Invocable Published")
      callbackOnSuccess()
    }).catch(({err, status}) => {
      dispatch(setSingleInvocableSaving(invocableId, false, ''))
      ToastsStore.error(`Error while publishing invocables - ${status} ${err.error || err.message || ''}`)
      console.log("err", err)

      if (err.error === "Not Authenticated") {
        dispatch(signout())
      }

      callbackOnError()
    })
    
  }
}

export function fetchSingleInvocable(domainId, invocableId, callbackOnSuccess = (() => {}), callbackOnError=((err) => { 
  console.log(err)
})) {
  return async (dispatch, getState) => {
    dispatch(setSingleInvocableFetching(invocableId, true))

    let state = getState()
    let token = state.loginInfo.token
    console.log("token", token)
    Api.get(`${constants.BACKEND_URL}/domains/${domainId}/invocables/${invocableId}/`, {
      Authorization: token
    }).then(res => {
      console.log("res", res)

      let fields = constants.INVOCABLE_CONFIG['JSON_INPUT_FIELDS']
      for (var i = 0; i < fields.length; i++){
        res[fields[i]] = utils.toString(JSON.stringify(_.get(res, fields[i], '{}'), null, 2))
      }
      
      dispatch(setSingleInvocableInfo(domainId, res))
    }).catch(({err, status}) => {
      dispatch(setSingleInvocableFetching(invocableId, false))
      ToastsStore.error(`Error while fetching invocable id: ${invocableId} - ${status} ${err.error || err.message || ''}`)
      console.log("err", err)

      if (err.error === "Not Authenticated") {
        dispatch(signout())
      }

      callbackOnError()
    })
  }
}

export function createInvocable(domainId, invocable, callbackOnSuccess = (() => {}), callbackOnError=((err) => { 
  console.log(err)
})) {
  return async (dispatch, getState) => {

    invocable.type = '-'
    console.log("new invocable", invocable)

    let state = getState()
    let token = state.loginInfo.token
    console.log("token", token)

    Api.post(`${constants.BACKEND_URL}/domains/${domainId}/invocables/`, invocable, {
      Authorization: token
    }).then(res => {
      console.log("res", res)
      invocable.id = res.id

      ToastsStore.success('New Invocable created')
      callbackOnSuccess(invocable)
    }).catch(({err, status}) => {
      ToastsStore.error(`Error while creating invocable - ${status} ${err.error || err.message || ''}`)
      console.log("err", err)

      if (err.error === "Not Authenticated") {
        dispatch(signout())
      }

      callbackOnError()
    })
  }
}


export function doesRepoExists(repoName, framework, domainId, callbackOnSuccess = (() => {}), callbackOnError=((err) => {
  console.log(err)
})) {
  return async (dispatch, getState) => {

    let state = getState()
    let token = state.loginInfo.token
    console.log("token", token)
    Api.get(`${constants.BACKEND_URL}/repos/${repoName}?framework=${framework}&domain_id=${domainId}`, {
      Authorization: token
    }).then(res => {
      callbackOnSuccess(res.is_available)
    }).catch(({err, status}) => {
      callbackOnError()
      
      if (err.error === "Not Authenticated") {
        dispatch(signout())
      }
    })
  }
}

export function setInvocablesInfo(domainId, invocables) {
  return {
    type: types.SET_INVOCABLES_INFO,
    domainId,
    invocables,
  }
}

export function setInvocablesFetching(domainId, fetching) {
  return {
    type: types.SET_INVOCABLES_FETCHING,
    domainId,
    fetching
  }
}

export function setSingleInvocableInfo(domainId, invocable) {
  return {
    type: types.SET_SINGLE_INVOCABLE_INFO,
    domainId,
    invocable,
  }
}

export function setSingleInvocableFetching(invocableId, fetching) {
  return {
    type: types.SET_SINGLE_INVOCABLE_FETCHING,
    invocableId,
    fetching,
  }
}

export function setSingleInvocableSaving(invocableId, saving, savingMessage) {
  return {
    type: types.SET_SINGLE_INVOCABLE_SAVING,
    invocableId,
    saving, 
    savingMessage,
  }
}
