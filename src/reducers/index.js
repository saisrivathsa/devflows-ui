import { combineReducers } from 'redux'

import * as flowReducers from './flowReducers'
import * as loginReducers from './loginReducers'
import * as domainReducers from './domainReducers'
import * as productReducers from './productReducers'
import * as invocableReducers from './invocableReducers'

export default combineReducers(Object.assign({},
  flowReducers,
  loginReducers,
  domainReducers,
  productReducers,
  invocableReducers,
))
