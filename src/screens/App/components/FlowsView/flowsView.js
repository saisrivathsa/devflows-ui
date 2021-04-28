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


class FlowsView extends Component {

  constructor(props) {
    super(props)

    this.state = {}
  }

  componentDidMount() {
    const productId = this.props.productId
    const productsInfo = this.props.productsInfo
    const flowsInfo = this.props.flowsInfo

    const product = productsInfo.products[productId]
    if (!product || !product.api_key_value) {
      this.props.fetchSingleProduct(productId)
    }

    this.props.fetchSingleProductSettings(productId)
    
    if (!flowsInfo.flowIdsByProduct[productId] || (!flowsInfo.flowIdsByProduct[productId].fetching && 
      !flowsInfo.flowIdsByProduct[productId].fetched)) {
      this.props.fetchFlows(productId)
    }
  }

  render() {
    const productId = this.props.productId
    const product = this.props.productsInfo.products[productId]
    const flowsInfo = this.props.flowsInfo

    let flows = []
    let productFetching = (product ? false : true) && this.props.productsInfo.fetching
    let fetching = false
    if (flowsInfo.flowIdsByProduct[productId]) {
      fetching = flowsInfo.flowIdsByProduct[productId].fetching
      flows = flowsInfo.flowIdsByProduct[productId].flowIds
    } else {
      fetching = true
    }
    
    return (
      <div style={styles.root}>
        <SimpleBackdrop open={fetching || productFetching} label={
          fetching ? 'Fetching flows' : (
            productFetching ? 'Fetching Product Info' : ''
          )
        }/>

        {
          flows.length === 0
          ? (
            <div style={styles.message}>
              <span>Nothing to show</span>
              <span style={styles.messageDetail}>Create new flows</span>
            </div>
          )
          : (
            <div style={styles.content}>
              <SimpleTable style={styles.table} hover rows={flows.map(flow => {
                let flow2 = utils.copyDict(flow)
                flow2.is_published = `${flow2.is_published}`

                return flow2
              })} onSelect={index => {
                // console.log("table selected", index)
                this.props.history.push(`/products/${productId}/flows/${flows[index].id}`)
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
  title: {
    margin: 20,
    marginBottom: 0,
    fontSize: 25,
    fontWeight: '300',
    display: 'flex',
    textAlign: 'left',
  },
  propertiesContainer: {
    display: 'flex',
    margin: 20,
    marginBottom: 0,
  },
  container: {
    display: 'flex',
    margin: 3,
    fontSize: 16,
  },
  key: {
    textAlign: 'left',
    color: 'grey',
    marginRight: 10,
    fontWeight: '300',
  },
  value: {
    textAlign: 'left',
    fontWeight: '300',
  },
  keyValue: {
    marginRight: 10,
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
    productsInfo: state.productsInfo,
    flowsInfo: state.flowsInfo,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(FlowsView)
