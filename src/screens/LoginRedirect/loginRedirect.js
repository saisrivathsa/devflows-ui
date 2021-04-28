/** @jsx jsx */
import { 
  Component 
} from 'react'
import { jsx } from '@emotion/core'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import queryString from 'query-string'

import { ActionCreators } from '../../actions'
import SimpleBackdrop from '../App/components/DomainsView/components/Backdrop'


class LoginRedirect extends Component {

  componentDidMount() {
    let params = queryString.parse(this.props.location.search)
    let githubCode = params.code

    // Start message Listener - Will listen messages from parent TAB for its url
    var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
    var eventer = window[eventMethod];
    var messageEvent = eventMethod === "attachEvent" ? "onmessage" : "message";
    eventer(messageEvent, e => {
      console.log('origin: ', e.origin)
      console.log('parent received message!: ', e.data);

      if (e.data.parentURL) {
        window.opener.postMessage({ githubCode }, e.data.parentURL);
        window.close()
      }
    }, false);
  }

  render() {
    return (
      <div style={styles.root}>
        <SimpleBackdrop open={true} label={'Please Wait..'}/>
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
    // position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgb(54, 62, 71)',
  },
}

function mapDispatchToProps(dispatch) {
  return { ...bindActionCreators(ActionCreators, dispatch), dispatch }
}

function mapStateToProps(state) {
  return {
    loginInfo: state.loginInfo
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginRedirect)
