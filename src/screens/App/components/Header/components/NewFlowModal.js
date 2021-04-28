/** @jsx jsx */
import { 
  Component 
} from 'react'
import { jsx } from '@emotion/core'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import {
  Input, 
  Modal, 
  Button,
} from 'semantic-ui-react'

import { ActionCreators } from '../../../../../actions'


class NewFlowModal extends Component {

  constructor(props) {
    super(props)

    this.state = {
      name: '',
      repoName: '',
      loading: false,
    }
  }

  render() {
    let props = this.props
    let productsInfo = this.props.productsInfo
    let productId = props.productId
    let product = productsInfo.products[productId]

    return (
      <Modal open={props.open} onClose={() => {
        this.props.onClose && this.props.onClose()
      }}>
        <Modal.Header>New Flow</Modal.Header>
        <Modal.Content>
          <div style={styles.content}>
            
            <div style={styles.inputParent}>
              <div style={styles.labelParent}>
                <span style={styles.label}> {
                  product ? "Product" : "Product Id"
                } </span>
              </div>

              <div style={styles.labelParent}>
                <span style={styles.value}> {
                  product ? product.name : productId
                } </span>
              </div>
              
            </div>

            <div style={styles.inputParent}>
              <div style={styles.labelParent}>
                <span style={styles.label}>Flow Name</span>
              </div>
              <Input 
                  size="small" 
                  style={styles.textField} 
                  placeholder="Enter Flow Name"
                  value={this.state.name}
                  onChange={evt => {
                    this.setState({ name: evt.target.value })
                  }}
                />
            </div>

          </div>

          <div style={styles.buttonParent}>
            <Button onClick={() => {
              this.props.onClose && this.props.onClose()
            }} >Cancel</Button>
            <Button primary loading={this.state.loading} onClick={() => {
              if (!this.state.loading) {
                this.setState({ loading: true })
                this.props.createFlow(productId, {
                  name: this.state.name,
                }, (newFlow) => {
                  this.props.onClose && this.props.onClose()
                  this.props.fetchFlows(productId)
                  this.props.history.push(`/products/${productId}/flows/${newFlow.id}`)
                  this.setState({ 
                    name: '',
                    repoName: '',
                    loading: false, 
                  })
                }, () => {
                  this.setState({ loading: false, })
                })
              }
            }}>Create</Button>
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
    maxHeight: 400,
  },
  inputParent: {
    display: 'flex',
    marginBottom: 10,
  },
  labelParent: {
    display: 'flex',
    alignItems: 'center',
  },  
  label: {
    flex: 1,
    marginRight: 10,
    width: 100,
    textAlign: 'right',
    // fontWeight: '300',
  },
  value: {
    flex: 1,
    textAlign: 'left',
  },
  textField: {
    width: 200,
    height: 45,
    fontFamily: 'inherit',
    fontSize: 14,
  },
  textArea: {
    minHeight: 45,
    width: 300,
  },
  selectorParent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    // marginRight: 10,
    padding: 5,
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: 'rgb(230, 232, 236)',
    borderRadius: 4,
    width: 200,
    height: 45,
    // marginTop: 7,
  },
  dropdown: {
    height: '100%',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
  },
  grow: {
    width: '100%',
    flex: 1,
    // border: '1px solid grey',
  },
  buttonParent: {
    padding: 10,
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
    flowsInfo: state.flowsInfo,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NewFlowModal)
