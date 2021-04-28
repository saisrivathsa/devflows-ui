/** @jsx jsx */
import { 
  Component 
} from 'react'
import { jsx } from '@emotion/core'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as utils from '../../../../lib/utils'
import SimpleTable from '../DomainsView/components/Table'
import SimpleBackdrop from '../DomainsView/components/Backdrop'

import { ActionCreators } from '../../../../actions'


class InvocablesView extends Component {

  constructor(props) {
    super(props)

    this.state = {}
  }

  componentDidMount() {
    const domainId = this.props.domainId
    const invocablesInfo = this.props.invocablesInfo
    
    const domain = this.props.domainsInfo.domains[domainId]
    if (!domain) {
      this.props.fetchSingleDomain(domainId)
    }
    if (!invocablesInfo.invocableIdsByDomain[domainId] || (!invocablesInfo.invocableIdsByDomain[domainId].fetching && 
      !invocablesInfo.invocableIdsByDomain[domainId].fetched)) {
      this.props.fetchInvocables(domainId)
    }
  }

  render() {
    const domainId = this.props.domainId
    const domain = this.props.domainsInfo.domains[domainId]
    const invocablesInfo = this.props.invocablesInfo

    let invocables = []
    let domainFetching = (domain ? false : true) && this.props.domainsInfo.fetching
    let fetching = false
    if (invocablesInfo.invocableIdsByDomain[domainId]) {
      fetching = invocablesInfo.invocableIdsByDomain[domainId].fetching
      invocables = invocablesInfo.invocableIdsByDomain[domainId].invocableIds
      // .map(invocableId => {
      //   if (invocablesInfo.invocablesById[invocableId]) {
      //     return invocablesInfo.invocablesById[invocableId].invocable
      //   }
      //   return {}
      // })
    } else {
      fetching = true
    }
    // console.log("invocables", domainId, invocables)

    return (
      <div style={styles.root}>

        <SimpleBackdrop open={fetching || domainFetching} label={
          fetching ? 'Fetching invocables' : (
            domainFetching ? 'Fetching Domain Info' : ''
          )
        }/>

        {
          invocables.length === 0
          ? (
            <div style={styles.message}>
              <span>Nothing to show</span>
              <span style={styles.messageDetail}>Create new invocables</span>
            </div>
          ) : (
            <div style={styles.content}>
              <SimpleTable style={styles.table} rows={invocables.map(invocable => {
                let invocable2 = utils.copyDict(invocable)
                invocable2.is_published = `${invocable2.is_published}`
                delete invocable2.invocable_definition_json
                delete invocable2.input_schema
                delete invocable2.output_schema
                delete invocable2.sample_input
                delete invocable2.sample_output
                delete invocable2.versions

                return invocable2
              })} onSelect={index => {
                // console.log("table selected", index)
                this.props.history.push(`/domains/${domainId}/invocables/${invocables[index].id}`)
              }}/>  
            </div>
          )
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
    width: '100%',
    height: 'calc(100% - 70px)',
    // height: '100%',
    // position: 'relative',
    // backgroundColor: 'rgb(245, 247, 250)',
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
  message: {
    fontSize: 30,
    fontWeight: '200',
    display: 'flex',
    flexDirection: 'column',
    color: 'rgb(180, 180, 180)',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageDetail: {
    fontSize: 25
  }
}

function mapDispatchToProps(dispatch) {
  return { ...bindActionCreators(ActionCreators, dispatch), dispatch }
}

function mapStateToProps(state) {
  return {
    domainsInfo: state.domainsInfo,
    invocablesInfo: state.invocablesInfo
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(InvocablesView)
