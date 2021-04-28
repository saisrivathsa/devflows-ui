/** @jsx jsx */
import { 
  Component 
} from 'react'
import _ from 'lodash'
import { jsx } from '@emotion/core'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Form from "react-jsonschema-form"
import constants from '../../../../../constants'
import SimpleBackdrop from '../../DomainsView/components/Backdrop'

import {
  Modal, Checkbox, Button
} from 'semantic-ui-react'

import { ActionCreators } from '../../../../../actions'


class Auth0Modal extends Component {

  constructor(props) {
    super(props)

    this.state = {
      name: '',
      repoName: '',
      loading: false,
      copySuccess: '',
      auth0_integration_click: false
    }
  }

  getFormData(settings){
    if(settings === {})
      return {}
    return {
      ...settings.auth0_client_config,
      ...{auth0_admin_email: settings.auth0_admin_email}
    }
  }

  render() {
    let props = this.props;
    let product = this.props.productsInfo.products[this.props.productId]
    console.log("PROPS", this.props)
    console.log(product)
    return (
      product && product.settings ?
        <Modal size='small' style={styles.modal} open={props.open} onClose={() => {
          this.props.onClose && this.props.onClose()
        }}>
          <Modal.Header>Auth0 Integration</Modal.Header>
            <Modal.Content>
              <div style={styles.content}>
                <Checkbox 
                  label='Enable Auth0 integration'
                  toggle
                  checked={product.settings.auth0_integration_enabled}
                  onClick={() => {
                    product.settings.auth0_integration_enabled = !product.settings.auth0_integration_enabled
                    this.setState({auth0_integration_click: !this.state.auth0_integration_click})
                  }}
                />
                {product.settings.auth0_integration_enabled && 
                  <div style={styles.auth0ConfigForm}>
                    <Form
                      schema={constants.AUTH0_CONFIG_SCHEMA}
                      uiSchema={constants.AUTH0_CONFIG_UI_SCHEMA}
                      formData={this.getFormData(_.get(product, "settings", {}))}
                      onChange={evt => {
                        if (!product.settings) {
                          product.settings = {}
                        }
                        product.settings.auth0_client_config = {
                          "allowed_callback_urls": evt.formData.allowed_callback_urls,
                          "allowed_web_origins": evt.formData.allowed_web_origins,
                          "allowed_logout_urls": evt.formData.allowed_logout_urls
                        }
                        product.settings.auth0_admin_email = evt.formData.auth0_admin_email
                        console.log("evt.formData", evt.formData)
                      }}
                    > <br /> 
                    </Form>
                  </div>
                }
                <SimpleBackdrop open={props.open && (product && product.settings && product.settings.saving)} label="Saving settings"/>
                <Button 
                  color="blue"
                  style={styles.saveButton}
                  onClick={() => this.props.saveProductSettings(this.props.productId, product.settings)}
                >
                  Save
                </Button>
              </div>
            </Modal.Content> 
        </Modal>
        :
        <SimpleBackdrop open={props.open && (!product || !product.settings)} label="Fetching Auth0 settings"/>
    );
  }
}

const styles = {
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'left',
    overflow: 'auto',
    padding: 25,
    justifyContent: "space-between"
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
    padding: 7,
    width: '550px',
    height: '36px',
    resize: "none",
    overflow: "auto",
    borderRadius: 3,
    border: "none",
    marginTop: 5,
    marginBottom: 5,
    outline: "none"
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
  },
  copyButton:{
    display: 'flex'
  },
  copyIcon:{
    marginRight: '2px',
    marginBottom: '2px'
  },
  modalDescription: {
    fontWeight: '400',
    fontSize: 15,
    borderBottom: '1px solid rgba(34,36,38,.15)',
    padding: '20px'
  },
  auth0ConfigForm: {
    borderTop: "1px solid rgba(34,36,38,.15)",
    paddingTop: "25px",
    marginTop: "20px",
    paddingRight: "50px"
  },
  modal:{
    maxWidth: "800px",
    borderRadius: 0
  },
  saveButton: {
    maxWidth: "85px",
    marginTop: "15px"
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

export default connect(mapStateToProps, mapDispatchToProps)(Auth0Modal)
