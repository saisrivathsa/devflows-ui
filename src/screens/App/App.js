/** @jsx jsx */
import { 
  Component 
} from 'react'
import { jsx } from '@emotion/core'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {
  Route,
  Switch,
  withRouter,
} from "react-router-dom";

import { ActionCreators } from '../../actions'

import Page404 from '../Page404'
import Flow from './components/Flow'
import Header from './components/Header'
import SideBar from './components/SideBar'
import InvocablesView from './components/InvocablesView'
import FlowsView from './components/FlowsView'
import DomainsView from './components/DomainsView'
import ExploreView from './components/ExploreView'
import ProductsView from './components/ProductsView'
import InvocableView from './components/InvocableView'

import './App.css'


const ALLOWED_ROUTES = ["/domains", "/domains/:domain_id/invocables", "/products", 
"/products/:product_id/flows", "/products/:product_id/flows/:flow_id",
"/domains/:domain_id/invocables/:invocable_id", "/explore"]

class App extends Component {

  constructor(props) {
    super(props)

    this.state = {
    }
  }

  componentDidMount() {
    console.log("this.props.location.pathname", this.props.location.pathname)
    console.log("this.props", this.props)
    if (!this.props.loginInfo.loggedIn) {
      console.log("pushing login")
      this.props.history.push('/login')
    } else if (this.props.location.pathname === '/') {
      this.props.history.push('/products')
    }
  }

  render() {
    const SideBarWithRouter = withRouter(props => <SideBar {...props}/>);
    const HeaderWithRouter = withRouter(props => <Header {...props}/>);
    const DomainsViewWithRouter = withRouter(props => <DomainsView {...props}/>);
    const ExploreViewWithRouter = withRouter(props => <ExploreView {...props}/>);
    const ProductsViewWithRouter = withRouter(props => <ProductsView {...props}/>);
    const InvocablesViewWithRouter = withRouter(props => <InvocablesView {...props}/>);
    const InvocableViewWithRouter = withRouter(props => <InvocableView {...props}/>);
    const FlowsViewWithRouter = withRouter(props => <FlowsView {...props}/>);
    const Page404WithRouter = withRouter(props => <Page404 {...props}/>);

    return (
      <div className="App" style={styles.root}>
        
        <div style={styles.content}>
          {/* <SideBarWithRouter /> */}
          {
            ALLOWED_ROUTES.map(path => (
              <Route key={path} exact={true} path={path} render={({match}) => (
                <SideBarWithRouter />
              )}/>
            ))
          }

          <div style={styles.rightColumn}>

            {
              ALLOWED_ROUTES.map(path => (
                <Route key={path} exact={true} path={path} render={({match}) => (
                  <HeaderWithRouter pathMatchProp={match} />
                )}/>
              ))
            }

            <Switch>
              <Route exact={true} path="/products/:product_id/flows/:flow_id" render={({match}) => (
                <Flow  
                  productId={match.params.product_id}
                  flowId={match.params.flow_id}
                  pathMatchProp={match}
                  />
              )}/>

              <Route exact={true} path="/explore" render={({match}) => (
                <ExploreViewWithRouter />
              )}/>

              <Route exact={true} path="/domains" render={({match}) => (
                <DomainsViewWithRouter />
              )}/>

              <Route exact={true} path="/domains/:domain_id/invocables" render={({match}) => {
                return (
                  <InvocablesViewWithRouter domainId={match.params.domain_id}/>
                )
              }}/>

              <Route exact={true} path="/domains/:domain_id/invocables/:invocable_id" render={({match}) => {
                return (
                  <InvocableViewWithRouter 
                    domainId={match.params.domain_id} 
                    invocableId={match.params.invocable_id}/>
                )
              }}/>

              <Route exact={true} path="/products" render={({match}) => (
                <ProductsViewWithRouter />
              )}/>

              <Route exact={true} path="/products/:product_id/flows" render={({match}) => {
                return (
                  <FlowsViewWithRouter productId={match.params.product_id}/>
                )
              }}/>

              <Route render={({match}) => (
                <Page404WithRouter />
              )}/>
            </Switch>

            
          </div>
        </div>
      </div>
    )
  }
}

const styles = {
  root: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '100%',
    position: 'relative',
  },
  content: {
    display: 'flex',
    height: '100%',
  },
  rightColumn: {
    flex: 1,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',    
  }
}

function mapDispatchToProps(dispatch) {
  return { ...bindActionCreators(ActionCreators, dispatch), dispatch }
}

function mapStateToProps(state) {
  return {
    loginInfo: state.loginInfo
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
