import React from 'react'
import ReactDOM from 'react-dom'
import { Component } from 'react'
import { connect } from 'react-redux'
import { Provider } from 'react-redux'
import { bindActionCreators } from 'redux'
import { ToastsContainer, ToastsStore } from 'react-toasts'
import { Router, Route, withRouter } from "react-router-dom"

import { store } from './store'
import App from './screens/App'
import Login from './screens/Login'
import LoginRedirect from './screens/LoginRedirect'
import { ActionCreators } from './actions'
import * as serviceWorker from './serviceWorker'
import history from './lib/history'

import './index.css'
window.LOG_LEVEL='DEBUG'

class Root extends Component {

  render() {

    const LoginWithRouter = withRouter(props => <Login {...props}/>);
    const LoginRedirectWithRouter = withRouter(props => <LoginRedirect {...props}/>);
    const AppWithRouter = withRouter(props => <App {...props}/>);

    return (
      <Router history={history}>
        <ToastsContainer store={ToastsStore} />
        <Route exact={true} path="/login" render={({match}) => (
          <div style={styles.root}>
            <LoginWithRouter />
          </div>
        )}/>

        <Route exact={true} path="/oauth_redirect" render={({match}) => (
          <div style={styles.root}>
            <LoginRedirectWithRouter />
          </div>
        )}/>
        
        <Route
          render={({ location }) =>
            !(location.pathname in {"/login": true, "/login/": true, "/oauth_redirect": true, "/oauth_redirect/": true}) ? (
              <div style={styles.root}>
                <AppWithRouter />
              </div>
            ) : null
          }
        />

      </Router>
    )
  }
} 

function mapDispatchToProps(dispatch) {
  return { ...bindActionCreators(ActionCreators, dispatch), dispatch }
}

function mapStateToProps(state) {
  return {
  }
}

const RootComponent = connect(mapStateToProps, mapDispatchToProps)(Root)
const app = (
  <Provider store={store}>
    <RootComponent />
  </Provider>
)

const styles = {
  root: {
    display: 'flex',
    maxHeight: '100%',
    minHeight: '100%',
  },
}

ReactDOM.render(app, document.getElementById('root'))

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
