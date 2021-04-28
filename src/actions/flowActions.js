import _ from 'lodash'
import { ToastsStore } from 'react-toasts'

import Api from '../lib/api'
import * as types from './types'
import * as utils from '../lib/utils'
import constants from '../constants'
import { signout } from './loginActions'


export function createFlow(productId, flow, callbackOnSuccess = (() => {}), callbackOnError=((err) => { 
  console.log(err)
})) {
  return async (dispatch, getState) => {
    console.log("new flow", flow)

    let state = getState()
    let token = state.loginInfo.token
    console.log("token", token)

    Api.post(`${constants.BACKEND_URL}/products/${productId}/flows/`, flow, {
      Authorization: token
    }).then(res => {
      console.log("res", res)
      ToastsStore.success('New Flow created')

      flow.id = res.id
      callbackOnSuccess(flow)
    }).catch(({err, status}) => {
      ToastsStore.error(`Error while creating flow - ${status} ${err.error || err.message || ''}`)
      console.log("err", err)

      if (err.error === "Not Authenticated") {
        dispatch(signout())
      }

      callbackOnError()
    })
  }
}


export function fetchFlows(productId, callbackOnSuccess = (() => {}), callbackOnError=((err) => { 
  console.log(err)
})) {
  return async (dispatch, getState) => {

    dispatch(setFlowsFetching(productId, true))

    let state = getState()
    let token = state.loginInfo.token
    console.log("token", token)
    Api.get(`${constants.BACKEND_URL}/products/${productId}/flows/`, {
      Authorization: token
    }).then(res => {
      dispatch(setFlowsInfo(productId, res.flows))
    }).catch(({err, status}) => {
      dispatch(setFlowsFetching(productId, false))
      ToastsStore.error(`Error while fetching flows - ${status} ${err.error || err.message || ''}`)
      console.log("err", err)

      if (err.error === "Not Authenticated") {
        dispatch(signout())
      }

      callbackOnError()
    })
    
  }
}


export function fetchFlowEnvs(productId, flowId, callbackOnSuccess = ((envs) => {}), callbackOnError=((err) => { 
  console.log(err)
})) {
  return async (dispatch, getState) => {

    dispatch(setFlowEnvFetching(flowId, true))

    let state = getState()
    let token = state.loginInfo.token
    console.log("token", token)
    Api.get(`${constants.BACKEND_URL}/products/${productId}/flows/${flowId}/envs`, {
      Authorization: token
    }).then(res => {
      console.log("res", res)

      if (res.envs.length === 0) {
        ToastsStore.error("No environments exist for this flow")
      }

      dispatch(setFlowEnvInfo(flowId, {
        id: flowId,
        name: res.flow_name
      }, res.envs))
      callbackOnSuccess(res.envs)
    }).catch(({err, status}) => {
      dispatch(setFlowEnvFetching(flowId, false))
      ToastsStore.error(`Error while fetching flow environments - ${status} ${err.error || err.message || ''}`)
      console.log("err", err)

      if (err.error === "Not Authenticated") {
        dispatch(signout())
      }

      callbackOnError()
    })

  }
}


export function fetchFlowJsonAndConfig(productId, flowId, envName, published=false, callbackOnSuccess = (() => {}), callbackOnError=((err) => { 
  console.log(err)
})) {
  return async (dispatch, getState) => {
    if(published)
      dispatch(setPublishedFlowJsonFetching(flowId, envName, true))
    else
      dispatch(setFlowJsonFetching(flowId, envName, true))

    let state = getState()
    let token = state.loginInfo.token
    console.log("token", token)
    Api.get(`${constants.BACKEND_URL}/products/${productId}/flows/${flowId}/envs/${envName}?published=${published}`, {
      Authorization: token
    }).then(res => {
      console.log("res", res)

      let flow = res.flow
      if (!res.flow || !utils.isJson(res.flow) || res.flow === '{}') {
        flow = utils.copyDict(constants.INITIAL_FLOW)
      } else {
        flow = JSON.parse(res.flow)

        if (!flow.offset) {
          flow.offset = utils.copyDict(constants.INITIAL_FLOW.offset)
        }
        if (!flow.offset.x) {
          flow.offset.x = 0
        } 
        if (!flow.offset.y) {
          flow.offset.y = 0
        } 
        if (!flow.flow_config) {
          flow.flow_config = {}
        }
        if (!flow.nodes) {
          flow.nodes = {}
        } 
        if (!flow.links) {
          flow.links = {}
        } 
        if (!flow.selected) {
          flow.selected = {}
        } 
        if (!flow.hovered) {
          flow.hovered = {}
        }
      }
      console.log("flow", flow)
      
      if(published)
        dispatch(setPublishedFlowJsonInfo(flowId, envName, flow, {}))
      else
        dispatch(setFlowJsonInfo(flowId, envName, flow, {}))
    }).catch(({err, status}) => {
      if(published){
        dispatch(setPublishedFlowJsonFetching(flowId, envName, false))        
        ToastsStore.error(`Error while fetching published flow json - ${status} ${err.error || err.message || ''}. 
                          Make sure the flow is published.`, 5000)
      } else {
        dispatch(setFlowJsonFetching(flowId, envName, false))
        ToastsStore.error(`Error while fetching flow json - ${status} ${err.error || err.message || ''}`, 5000)
      }

      console.log("err", err)

      if (err.error === "Not Authenticated") {
        dispatch(signout())
      }

      callbackOnError()
    })

  }
}


export function saveFlowJsonAndConfig(productId, flowId, envName, flowJson, callbackOnSuccess = (() => {}), callbackOnError=((err) => { 
  console.log(err)
})) {
  return async (dispatch, getState) => {

    dispatch(setFlowJsonSaving(flowId, envName, true, 'Saving Flow Json'))

    let state = getState()
    let token = state.loginInfo.token
    console.log("token", token)
    Api.put(`${constants.BACKEND_URL}/products/${productId}/flows/${flowId}/envs/${envName}`, {
      flow_json: flowJson
    }, {
      Authorization: token
    }).then(res => {
      console.log("res", res)
      dispatch(setFlowJsonSaving(flowId, envName, false, ''))
      ToastsStore.success("Flow saved")
    }).catch(({err, status}) => {
      dispatch(setFlowJsonSaving(flowId, envName, false, ''))
      ToastsStore.error(`Error while saving flow json - ${status} ${err.error || err.message || ''}`)
      console.log("err", err)

      if (err.error === "Not Authenticated") {
        dispatch(signout())
      }

      callbackOnError()
    })

  }
}


export function deployFlowJsonAndConfig(productId, flowId, envName, flowJson, callbackOnSuccess = (() => {}), callbackOnError=((err) => { 
  console.log(err)
})) {
  return async (dispatch, getState) => {

    dispatch(setFlowJsonSaving(flowId, envName, true, 'Deploying Flow'))

    let state = getState()
    let token = state.loginInfo.token
    console.log("token", token)
    Api.post(`${constants.BACKEND_URL}/products/${productId}/flows/${flowId}/envs/${envName}/devflows-deploy/`, {
      flow_json: flowJson
    }, {
      Authorization: token
    }).then(res => {
      console.log("res", res)
      dispatch(setFlowJsonSaving(flowId, envName, false, ''))
      ToastsStore.success("Flow deployed")
    }).catch(({err, status}) => {
      dispatch(setFlowJsonSaving(flowId, envName, false, ''))
      ToastsStore.error(`Error while deploying flow - ${status} ${err.error || err.message || ''}`)
      console.log("err", err)

      if (err.error === "Not Authenticated") {
        dispatch(signout())
      }

      callbackOnError()
    })
  }
}


export function publishFlowJsonAndConfig(productId, flowId, envName, flowJson, callbackOnSuccess = (() => {}), callbackOnError=((err) => { 
  console.log(err)
})) {
  return async (dispatch, getState) => {

    dispatch(setFlowJsonSaving(flowId, envName, true, 'Publishing Flow'))

    let state = getState()
    let token = state.loginInfo.token
    console.log("token", token)
    Api.post(`${constants.BACKEND_URL}/products/${productId}/flows/${flowId}/envs/${envName}/publish/`, {
      flow_json: flowJson
    }, {
      Authorization: token
    }).then(res => {
      console.log("res", res)
      dispatch(setFlowJsonSaving(flowId, envName, false, ''))
      ToastsStore.success("Flow published")
    }).catch(({err, status}) => {
      dispatch(setFlowJsonSaving(flowId, envName, false, ''))
      ToastsStore.error(`Error while publishing flow - ${status} ${err.error || err.message || ''}`)
      console.log("err", err)

      if (err.error === "Not Authenticated") {
        dispatch(signout())
      }

      callbackOnError()
    })
  }
}


export function setFlowSelectedEnv(productId, flowId, selectedEnv, callbackOnSuccess = (() => {}), callbackOnError=((err) => { 
  console.log(err)
})) {
  return async (dispatch, getState) => {
    dispatch({
      type: types.SET_FLOW_SELECTED_ENV,
      flowId,
      selectedEnv
    })

    let flowsInfo = getState().flowsInfo
    let selectedEnvName;
    if (flowsInfo.flowEnvsById[flowId] && 
      flowsInfo.flowEnvsById[flowId].envs &&
      flowsInfo.flowEnvsById[flowId].selectedEnv) {
      selectedEnvName = flowsInfo.flowEnvsById[flowId].envs[
        flowsInfo.flowEnvsById[flowId].selectedEnv
      ]
    }

    if (selectedEnvName) {
      if (_.get(flowsInfo, `flowEnvsById.${flowId}.flowJsonByEnvName.${selectedEnvName}.fetching`) !== true &&
            _.get(flowsInfo, `flowEnvsById.${flowId}.flowJsonByEnvName.${selectedEnvName}.fetched`) !== true) {
        dispatch(fetchFlowJsonAndConfig(productId, flowId, selectedEnvName))
      }
    }
  }
}

export function setFlowsInfo(productId, flows) {
  return {
    type: types.SET_FLOWS_INFO,
    productId,
    flows,
  }
}

export function setFlowsFetching(productId, fetching) {
  return {
    type: types.SET_FLOWS_FETCHING,
    productId,
    fetching
  }
}

export function setFlowEnvInfo(flowId, flow, envs) {
  return {
    type: types.SET_FLOW_ENV_INFO,
    flowId,
    flow,
    envs
  }
}

export function setFlowEnvFetching(flowId, fetching) {
  return {
    type: types.SET_FLOW_ENV_FETCHING,
    flowId,
    fetching
  }
}

export function setFlowJsonInfo(flowId, envName, flowJson, configJson) {
  return {
    type: types.SET_FLOW_JSON_INFO,
    flowId,
    envName,
    flowJson, 
    configJson
  }
}

export function setPublishedFlowJsonInfo(flowId, envName, flowJson, configJson) {
  return {
    type: types.SET_PUBLISHED_FLOW_JSON_INFO,
    flowId,
    envName,
    flowJson, 
    configJson
  }
}

export function setFlowJsonFetching(flowId, envName, fetching) {
  return {
    type: types.SET_FLOW_JSON_FETCHING,
    flowId,
    envName,
    fetching
  }
}

export function setPublishedFlowJsonFetching(flowId, envName, fetching) {
  return {
    type: types.SET_PUBLISHED_FLOW_JSON_FETCHING,
    flowId,
    envName,
    fetching
  }
}

export function setFlowJsonSaving(flowId, envName, saving, savingMessage) {
  return {
    type: types.SET_FLOW_JSON_SAVING,
    flowId,
    envName,
    saving, 
    savingMessage
  }
}
