/** @jsx jsx */
import { 
  Component 
} from 'react'
import { jsx } from '@emotion/core'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { Button, Modal, Input } from 'semantic-ui-react'

import { ActionCreators } from '../../../../../actions'


class NewProductModal extends Component {

  constructor(props) {
    super(props)

    this.state = {
      productName: '',
      loading: false,
    }
  }

  render() {
    let props = this.props
    return (
      <Modal open={props.open} onClose={() => {
        this.props.onClose && this.props.onClose()
      }}>
        <Modal.Header>New Product</Modal.Header>
        <Modal.Content>
          <div style={styles.content}>
            <div style={styles.inputParent}>
              <div style={styles.labelParent}>
                <span style={styles.label}>Product Name</span>
              </div>
              <Input 
                  size="small" 
                  style={styles.textField} 
                  placeholder="Enter Product Name"
                  value={this.state.productName}
                  onChange={evt => {
                    this.setState({ productName: evt.target.value })
                  }}
                />
            </div>
            <div style={styles.grow}/>
            <div style={styles.buttonParent}>
              <Button onClick={() => {
                this.props.onClose && this.props.onClose()
              }} >Cancel</Button>
              <Button primary loading={this.state.loading} onClick={() => {
                if (!this.state.loading) {
                  this.setState({ loading: true })
                  this.props.createProduct({
                    name: this.state.productName,
                    create_repo: true
                  }, (newProduct) => {
                    this.props.onClose && this.props.onClose()
                    // this.props.fetchProducts()
                    this.props.history.push(`/products/${newProduct.id}/flows`)
                    this.setState({ productName: '', loading: false })
                  })
                }
              }}>Create</Button>
            </div>
          </div>
        </Modal.Content>
      </Modal>
    );
  }
}

const styles = {
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    padding: 20,
    // height: 'calc(100% - 61px)',
  },
  inputParent: {
    display: 'flex',
    // flex: 1,
    // border: '1px solid red',
    // flexDirection: 'column',
    // width: 200,
  },
  labelParent: {
    display: 'flex',
    alignItems: 'center',
  },  
  label: {
    flex: 1,
    textAlign: 'left',
    marginRight: 10,
    // fontWeight: '300',
  },
  textField: {
    // width: '100%',
    height: 45,
    fontFamily: 'inherit',
    fontSize: 14,
  },
  grow: {
    width: '100%',
    flex: 1,
    // border: '1px solid grey',
  },
  buttonParent: {
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-end',
  }
}


function mapDispatchToProps(dispatch) {
  return { ...bindActionCreators(ActionCreators, dispatch), dispatch }
}

function mapStateToProps(state) {
  return {
    loginInfo: state.loginInfo,
    productsInfo: state.productsInfo,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NewProductModal)
