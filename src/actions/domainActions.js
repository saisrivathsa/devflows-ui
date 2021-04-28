import { ToastsStore } from 'react-toasts'

import Api from '../lib/api'
import * as types from './types'
import constants from '../constants'
import { signout } from './loginActions'


export function fetchSingleDomain(domainId, callbackOnSuccess = (() => {}), callbackOnError=((err) => { 
  console.log(err)
})) {
  return async (dispatch, getState) => {

    dispatch(setDomainsFetching(true))

    let state = getState()
    let token = state.loginInfo.token
    console.log("token", token)
    Api.get(`${constants.BACKEND_URL}/domains/${domainId}/`, {
      Authorization: token
    }).then(res => {
      dispatch(setSingleDomainInfo(res))
    }).catch(({err, status}) => {
      dispatch(setDomainsFetching(false))
      ToastsStore.error(`Error while fetching Domain id: ${domainId} - ${status} ${err.error || err.message || ''}`)
      console.log("err", err)

      if (err.error === "Not Authenticated") {
        dispatch(signout())
      }

      callbackOnError()
    })
  }
}

export function fetchDomains(callbackOnSuccess = (() => {}), callbackOnError=((err) => { 
  console.log(err)
})) {
  return async (dispatch, getState) => {

    console.log("fetchDomains")
    dispatch(setDomainsFetching(true))

    let state = getState()
    let token = state.loginInfo.token
    console.log("token", token)
    Api.get(`${constants.BACKEND_URL}/domains/`, {
      Authorization: token
    }).then(res => {
      dispatch(setDomainsInfo(res.domains))
    }).catch(({err, status}) => {
      dispatch(setDomainsFetching(false))
      ToastsStore.error(`Error while fetching Domains - ${status} ${err.error || err.message || ''}`)
      console.log("err", err)

      if (err.error === "Not Authenticated") {
        dispatch(signout())
      }

      callbackOnError()
    })
  }
}

export function createDomain(domain, callbackOnSuccess = (() => {}), callbackOnError=((err) => { 
  console.log(err)
})) {
  return async (dispatch, getState) => {

    console.log("new domain", domain)

    let state = getState()
    let token = state.loginInfo.token
    console.log("token", token)
    Api.post(`${constants.BACKEND_URL}/domains/`, domain, {
      Authorization: token
    }).then(res => {
      domain.id = res.id
      console.log("new domain after", domain)
      callbackOnSuccess(domain)

      ToastsStore.success(`New Domain created`)
    }).catch(({err, status}) => {
      ToastsStore.error(`Error while creating domain - ${status} ${err.error || err.message || ''}`)
      console.log("err", err)

      if (err.error === "Not Authenticated") {
        dispatch(signout())
      }
      
      callbackOnError()
    })
  }
}

export function setDomainsInfo(domains) {
  return {
    type: types.SET_DOMAINS_INFO,
    domains
  }
}

export function setSingleDomainInfo(domain) {
  return {
    type: types.SET_SINGLE_DOMAIN_INFO,
    domain
  }
}

export function setDomainsFetching(fetching) {
  return {
    type: types.SET_DOMAINS_FETCHING,
    fetching
  }
}
