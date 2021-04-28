import { ToastsStore } from 'react-toasts'

import Api from '../lib/api'
import * as types from './types'
import constants from '../constants'
import history from '../lib/history'

export function login(github_code, callbackOnSuccess = (() => {}), callbackOnError=((err) => { 
  console.log(err)
})) {
  return async (dispatch, getState) => {

    Api.get(`${constants.BACKEND_URL}/login/?code=${github_code}`).then(res =>{
      console.log("res", res)

      dispatch(setLoginInfo({
        token: res.token,
        name: res.name,
        username: res.username
      }))

      callbackOnSuccess()
    }).catch(({err, status}) => {
      console.log(err)
      ToastsStore.error(`Error while Signing in`)
      callbackOnError()
    })
    
  }
}

export function setLoginInfo({token, username, name}) {
  return {
    type: types.SET_LOGIN_INFO,
    token,
    username,
    name
  }
}

export function signout() {
  return async (dispatch, getState) => {
    localStorage.clear()
    history.push('/login')
    dispatch({ type: types.RESET })
  }
}
