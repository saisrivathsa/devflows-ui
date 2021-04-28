/** @jsx jsx */
import { 
  Component 
} from 'react'
import { jsx } from '@emotion/core'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { GoMarkGithub } from "react-icons/go";

import images from '../../images'
import { ActionCreators } from '../../actions'
import SimpleBackdrop from '../App/components/DomainsView/components/Backdrop'
import constants from '../../constants'


class Login extends Component {

  constructor(props) {
    super(props)

    this.state = {
      loadingLogin: false,
    }
    this.popup = null
    this.parentURLSender = null
  }

  componentDidMount() {
    // Start message Listener - Will listen messages from oauth popup
    var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
    var eventer = window[eventMethod];
    var messageEvent = eventMethod === "attachEvent" ? "onmessage" : "message";
    eventer(messageEvent, e => {
      console.log('origin: ', e.origin)
      console.log('parent received message!: ', e.data);

      if (e.data.githubCode) {
        this.onGithubCodeReceive(e.data.githubCode)
      }
    }, false);
  }

  onGithubCodeReceive = githubCode => {
    console.log("githubCode", githubCode)

    this.popup && this.popup.close()
    this.parentURLSender && clearInterval(this.parentURLSender)
    this.setState({ loadingLogin: true })

    this.props.login(githubCode, () => {
      this.setState({
        loadingLogin: false
      })
      this.props.history.push('/products')
    }, () => {
      this.setState({
        loadingLogin: false
      })
    })
  }

  render() {
    return (
      <div style={styles.root}>
        {
          this.state.loadingLogin
          ? <SimpleBackdrop open={true} label={'Please Wait..'}/>
          : <div style={styles.contentLogin}>
              <img alt='logo' style={styles.img} src={images.LOGO} />
              <span
                css={styles.botton} 
                onClick={() => {
                  this.popup = window.open(`https://github.com/login/oauth/authorize?client_id=${constants.GITHUB_CLIENT_ID}&scope=user repo`, "_blank");

                  this.parentURLSender = setInterval(() => {
                    this.popup.postMessage({ parentURL: window.location.origin }, constants.UI_URL)
                  }, 100)
                }}> <GoMarkGithub size="25" style={styles.icon} /> Login with Github </span>
            </div>          
        }
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
  contentLogin: {
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  img: {
    width: 100,
    marginBottom: 40,
    position: 'absolute',
    left: 15,
    top: 15,
  },
  botton: {
    // border: '1px solid white',
    backgroundColor: 'rgb(72, 81, 91)',
    color: 'white !important',
    padding: 10,
    paddingLeft: 15,
    paddingRight: 15,
    borderRadius: 5,
    // width: 150,
    textAlign: 'center',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',

    '&:hover': {
      textDecoration: 'none',
      color: 'white',
    }
  },
  icon: {
    marginRight: 10,
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

export default connect(mapStateToProps, mapDispatchToProps)(Login)
