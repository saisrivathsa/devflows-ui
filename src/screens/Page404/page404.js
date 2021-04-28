/** @jsx jsx */
import { 
  Component 
} from 'react'
import { jsx } from '@emotion/core'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import images from '../../images'
import { ActionCreators } from '../../actions'


class Page404 extends Component {

  render() {
    return (
      <div style={styles.root}>
        <div style={styles.contentLogin}>
          <img alt='logo' style={styles.img} src={images.LOGO} onClick={() => {
            window.location = '/'
          }} />
          <span css={styles.label1}> 404 </span>
          <span css={styles.label2}> Page Not Found :( </span>
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
  label1: {
    color: 'rgb(200, 200, 200) !important',
    textAlign: 'center',
    alignItems: 'center',
    fontSize: 120,
    fontWeight: '100',
  },
  label2: {
    color: 'rgb(200, 200, 200) !important',
    textAlign: 'center',
    alignItems: 'center',
    fontSize: 40,
    fontWeight: '100',
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

export default connect(mapStateToProps, mapDispatchToProps)(Page404)
