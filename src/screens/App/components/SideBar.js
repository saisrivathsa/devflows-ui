/** @jsx jsx */
import { 
  Component 
} from 'react'
import { jsx } from '@emotion/core'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { MdBook, MdAssignment } from "react-icons/md";
import { FaSearch } from "react-icons/fa";
import {
  Link
} from "react-router-dom";

import images from '../../../images'
import { ActionCreators } from '../../../actions'


class SideBar extends Component {

  constructor(props) {
    super(props)

    this.state = {
      selected: 1,
    }
  }

  componentDidMount() {
    const { pathname } = this.props.location;

    if (pathname === '/' && this.state.selected !== 0) {
      this.setState({ selected: 0 })
    } else if (pathname.startsWith('/domains') && this.state.selected !== 0) {
      this.setState({ selected: 0 })
    } else if (pathname.startsWith('/products') && this.state.selected !== 1) {
      this.setState({ selected: 1 })
    } else if (pathname.startsWith('/explore') && this.state.selected !== 2) {
      this.setState({ selected: 2 })
    }
  }

  getOnClickListener(index) {
    return () => {
      this.setState({
        selected: index
      })
    }
  }

  render() {
    return (
      <div style={styles.root} >

        <div style={styles.header}>
         <img alt='logo' style={styles.img} src={images.LOGO} />
        </div>

        <Link to="/products" style={styles.header2}>
          <div style={{
            ...styles.header2,
            ...(this.state.selected === 1 ? styles.selected: {})
          }} onClick={this.getOnClickListener(1)}>
            <MdAssignment style={styles.icon}/>
            <span style={styles.label}> Products </span>
          </div>
        </Link>

        <Link to="/domains" style={styles.header2}>
          <div style={{
            ...styles.header2,
            ...(this.state.selected === 0 ? styles.selected: {})
          }} onClick={this.getOnClickListener(0)}>
            <MdBook style={styles.icon}/>
            <span style={styles.label}> Domains </span>
          </div>
        </Link>

        <Link to="/explore" style={styles.header2}>
          <div style={{
            ...styles.header2,
            ...(this.state.selected === 2 ? styles.selected: {})
          }} onClick={this.getOnClickListener(2)}>
            <FaSearch style={styles.icon}/>
            <span style={styles.label}> Explore </span>
          </div>
        </Link>

        {/* <Link to="/" style={styles.header2}>
          <div style={{
            ...styles.header2,
            ...(this.state.selected === 3 ? {} : {})
          }} onClick={this.getOnClickListener(3)}>
          </div>
        </Link> */}

        
      </div>
    )
  }
}

const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: 80,
    // height: '100%',
    backgroundColor: 'rgb(54, 62, 71)',
  },
  header: {
    height: 70,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    cursor: 'pointer',
  },
  header2: {
    height: 75,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    cursor: 'pointer',
    textDecoration: 'none',
  },
  selected: {
    backgroundColor: 'rgb(71, 81, 91)',
  },
  img: {
    width: 70,
  },
  icon: {
    width: 20,
    height: 20,
    color: 'rgb(172, 175, 177)',
  },
  label: {
    fontSize: 10,
    marginTop: 7,
    // fontWeight: '300',
    color: 'rgb(172, 175, 177)',
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

export default connect(mapStateToProps, mapDispatchToProps)(SideBar)
