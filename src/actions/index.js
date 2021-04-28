import * as LoginActions from './loginActions'
import * as DomainActions from './domainActions'
import * as ProductActions from './productActions'
import * as InvocableActions from './invocableActions'
import * as FlowActions from './flowActions'

export const ActionCreators = Object.assign({},
  LoginActions,
  DomainActions,
  ProductActions,
  InvocableActions,
  FlowActions
)
