/** @jsx jsx */
import { 
  Component 
} from 'react'
import { jsx } from '@emotion/core'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import SimpleTable from './components/Table'
import * as utils from '../../../../lib/utils'
import SimpleBackdrop from './components/Backdrop'

import { ActionCreators } from '../../../../actions'


class DomainsView extends Component {

  constructor(props) {
    super(props)

    this.state = {}
  }

  componentDidMount() {
    const domainsInfo = this.props.domainsInfo

    if (!domainsInfo.fetching && !domainsInfo.fetched) {
      this.props.fetchDomains()
    }
  }

  render() {
    const domainsInfo = this.props.domainsInfo
    const domains = utils.values(domainsInfo.domains)

    return (
      <div style={styles.root}>

        <SimpleBackdrop open={domainsInfo.fetching} label={'Fetching domains'}/>
        
        <div style={styles.content}>
          <SimpleTable hover style={styles.table} rows={domains} onSelect={index => {
            // console.log("table selected", index)
            this.props.history.push(`/domains/${domains[index].id}/invocables`)
          }}/>  
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
    width: '100%',
    height: 'calc(100% - 70px)',
    // height: '100%',
    // position: 'relative',
    // backgroundColor: 'rgb(245, 245, 245)',
    padding: 0,
    // paddingLeft: 15,
    // paddingRight: 15,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    flex: 1,
    padding: 20,
    paddingTop: 25,
    // paddingLeft: 20,
    // paddingRight: 20,
  },
  titleParent: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
    marginBottom: 15,
  },
  title: {
    paddingLeft: 10,
    fontSize: 25,
    fontWeight: '300',
    display: 'flex',
  },
  icon: {
    marginLeft: 10,
    width: 20,
    height: 20,
    color: 'rgb(75, 75, 75)',
  },
  table: {
    
  },
}

function mapDispatchToProps(dispatch) {
  return { ...bindActionCreators(ActionCreators, dispatch), dispatch }
}

function mapStateToProps(state) {
  return {
    domainsInfo: state.domainsInfo
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DomainsView)
