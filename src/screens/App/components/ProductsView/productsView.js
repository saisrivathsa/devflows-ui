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


class ProductsView extends Component {

  constructor(props) {
    super(props)

    this.state = {}
  }

  componentDidMount() {
    const productsInfo = this.props.productsInfo

    if (!productsInfo.fetching && !productsInfo.fetched) {
      this.props.fetchProducts()
    }
  }

  removeUnwantedKeys(data){
    var unwantedKeys = ["api_key_id", "api_key_value", "message", "settings", "auth0_admin_id", "auth0_client_id"]
    Object.keys(data).forEach(function(key) {
      for (var i = 0; i < unwantedKeys.length; i++) {
        delete data[key][unwantedKeys[i]]
      }
    });
    return data;
  }

  render() {
    const productsInfo = this.props.productsInfo
    const products = utils.values(this.removeUnwantedKeys(productsInfo.products))

    return (
      <div style={styles.root}>

        <SimpleBackdrop open={productsInfo.fetching} label={'Fetching products'}/>
        
        <div style={styles.content}>
          <SimpleTable 
            hover 
            style={styles.table} 
            rows={products.map(product => {
              let product2 = utils.copyDict(product)
              product2.has_published_flows = `${product2.has_published_flows}`
              product2.auth0_integration_enabled = `${product2.auth0_integration_enabled}`
              return product2
            })} 
            onSelect={index => {
              // console.log("table selected", index)
              this.props.history.push(`/products/${products[index].id}/flows`)
            }}
          />  
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
    domainsInfo: state.domainsInfo,
    productsInfo: state.productsInfo
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProductsView)
