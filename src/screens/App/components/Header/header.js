/** @jsx jsx */
import { 
  Component 
} from 'react'
import _ from 'lodash'
import * as React from 'react'
import { jsx } from '@emotion/core'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Modal, Button, Dropdown } from 'semantic-ui-react'
import {
  Route,
  withRouter,
} from "react-router-dom"
import { ToastsStore } from 'react-toasts'
import { MdBook, MdAssignment } from "react-icons/md"

import Form from "react-jsonschema-form"

import { FaSearch } from "react-icons/fa"


import images from '../../../../images'
import constants from '../../../../constants'
import * as utils from '../../../../lib/utils'
import { ActionCreators } from '../../../../actions'
import SimpleBreadCrumbs from './components/BreadCrumb'
import NewProductModal from './components/NewProductModal'
import NewFlowModal from './components/NewFlowModal'
import ApiKeyModal from './components/ApiKeyModal'
import Auth0Modal from './components/Auth0KeyModal'
import NewDomainModal from './components/NewDomainModal'
import NewInvocableModal from './components/NewInvocableModal'


class Header extends Component {

  constructor(props) {
    super(props)

    this.state = {
      openNewProductModal: false,
      openNewFlowModal: false,
      openApiKeyModal: false,
      openAuth0Modal: false,
      openNewDomainModal: false,
      openNewInvocableModal: false,
      openFlowConfigModal: false,
    }

    this.flowConfigSchema = {
      "$schema": "http://json-schema.org/draft-07/schema",
      "$id": "http://example.com/example.json",
      "type": "object",
      "title": "",
      "description": "",
      "required": [
        "config"
      ],
      "properties": {
        "config": {
          "$id": "#/properties/config",
          "type": "object",
          "title": "",
          "description": "",
          "default": "",
          "examples": [
          ""
          ],
          "required": [],
          "properties": {},
          "additionalProperties": {
            "type": "string"
          }
        }
      }
    }

    this.flowConfigUISchema = {
      classNames: "flow-config-class"
    }
  }

  saveOptions = [
    { key: 'Save and Deploy Flow', text: 'Save and Deploy Flow', value: 'Save and Deploy Flow' },
    { key: 'Publish Flow', text: 'Publish Flow', value: 'Publish Flow' },
  ]  
  invocableOptions = [
    { key: 'Publish Invocable', text: 'Publish Invocable', value: 'Publish Invocable' },
  ]

  getBreadCrumbLabels() {
    const { pathname } = this.props.location

    return pathname.split('/').filter(path => path.length > 0)
  }

  getFlowEnvList() {
    let flowsInfo = this.props.flowsInfo

    let flowEnvs = []
    let productId = _.get(this, 'props.pathMatchProp.params.product_id')
    let flowId = _.get(this, 'props.pathMatchProp.params.flow_id')

    if (productId && flowId) {
      if (flowsInfo.flowEnvsById[flowId] && flowsInfo.flowEnvsById[flowId].envs) {
        flowEnvs = flowsInfo.flowEnvsById[flowId].envs
      }
    }

    return flowEnvs
  }

  onFlowEnvSelected(data) {
    let productId = _.get(this, 'props.pathMatchProp.params.product_id')
    let flowId = _.get(this, 'props.pathMatchProp.params.flow_id')

    if (productId && flowId) {
      let index = 1
      for (let i in data.options) {
        let option = data.options[i]
        if (option.value === data.value) {
          index = i
          break
        }
      }

      this.props.setFlowSelectedEnv(productId, flowId, '' + (index - 1))
    }
  }

  getSelectedFlowEnv() {
    let flowsInfo = this.props.flowsInfo

    let productId = _.get(this, 'props.pathMatchProp.params.product_id')
    let flowId = _.get(this, 'props.pathMatchProp.params.flow_id')

    if (productId && flowId) {
      if (flowsInfo.flowEnvsById[flowId] && 
        flowsInfo.flowEnvsById[flowId].envs &&
        flowsInfo.flowEnvsById[flowId].selectedEnv) {
        return flowsInfo.flowEnvsById[flowId].envs[
          flowsInfo.flowEnvsById[flowId].selectedEnv
        ]
      }
    }

    return ''
  }

  getFlowConfig() {
    let flowsInfo = this.props.flowsInfo

    let flowId = _.get(this, 'props.pathMatchProp.params.flow_id')
    let selectedFlowEnv = this.getSelectedFlowEnv()

    return {"config": _.get(flowsInfo, `flowEnvsById.${flowId}.flowJsonByEnvName.${selectedFlowEnv}.flowJson.flow_config`)}
  }

  setFlowConfig(flowConfig){
    let flowsInfo = this.props.flowsInfo

    let flowId = _.get(this, 'props.pathMatchProp.params.flow_id')
    let selectedFlowEnv = this.getSelectedFlowEnv()

    _.set(flowsInfo, `flowEnvsById.${flowId}.flowJsonByEnvName.${selectedFlowEnv}.flowJson.flow_config`, flowConfig.config)
  }

  getChart() {
    const { flowsInfo } = this.props
    let flowId = _.get(this, 'props.pathMatchProp.params.flow_id')

    let selectedFlowEnv = this.getSelectedFlowEnv()

    let flowJson = _.get(flowsInfo, `flowEnvsById.${flowId}.flowJsonByEnvName.${selectedFlowEnv}.flowJson`, 
      utils.copyDict(constants.INITIAL_FLOW))
    
    let error = false

    let flowConfigKeys = Object.keys(flowJson.flow_config)
    Object.keys(flowJson.nodes).forEach(function(nodeKey) {
      let configData = flowJson.nodes[nodeKey].properties.configData
      if (configData === undefined)
        configData = {}
      Object.keys(configData).forEach(function(configDataKey) {
        if(configData[configDataKey]["type"] === "ref" && !flowConfigKeys.includes(configData[configDataKey]["value"])){
            ToastsStore.error(`Reference config does not exist for
                              node: "${flowJson.nodes[nodeKey].properties.name}"
                              ref-config: "${configData[configDataKey]["value"]}".
                              Make sure the corresponding flow config exists.`, 10000)
            error = true
            return
        }
      });
      if(error)
        return
    });

    if(error)
      return null

    return flowJson
  }

  onSaveToGithub() {
    let productId = _.get(this, 'props.pathMatchProp.params.product_id')
    let flowId = _.get(this, 'props.pathMatchProp.params.flow_id')
    let envName = this.getSelectedFlowEnv()
    let flowJson = this.getChart()

    if(flowJson)
      this.props.saveFlowJsonAndConfig(productId, flowId, envName, flowJson)
  }

  render() {
    let loginInfo = this.props.loginInfo
    let domainsInfo = this.props.domainsInfo
    let productsInfo = this.props.productsInfo
    let history = this.props.history

    const NewProductModalWithRouter = withRouter(props => <NewProductModal {...props}/>);
    const NewFlowModalWithRouter = withRouter(props => <NewFlowModal {...props}/>);
    const ApiKeyModalWithRouter = withRouter(props => <ApiKeyModal {...props}/>);
    const Auth0ModalWithRouter = withRouter(props => <Auth0Modal {...props}/>);
    const NewInvocableModalWithRouter = withRouter(props => <NewInvocableModal {...props}/>);
    const NewDomainModalWithRouter = withRouter(props => <NewDomainModal {...props}/>);
    
    const trigger = (
      <span>
        <img alt="user" src={images.USER} style={styles.userIcon}/> Hi, {loginInfo.name.split(' ')[0]}
      </span>
    )
    
    const profileOptions = [
      {
        key: 'user',
        text: (
          <span>
            Signed in as <strong>{loginInfo.username}</strong>
          </span>
        ),
        disabled: true,
      },
      { key: 'Sign Out', text: 'Sign Out', value: 'Sign Out' },
    ]

    const crumbs = this.getBreadCrumbLabels()
    return (
      <div style={styles.root} className={"header-column"}>
        <div style={styles.col1}>

          {
            _.get(this, 'props.pathMatchProp.path', '').startsWith('/products')
            ? <MdAssignment style={styles.icon} />
            : _.get(this, 'props.pathMatchProp.path', '').startsWith('/domains')
            ? <MdBook style={styles.icon}/>
            : <FaSearch style={styles.icon}/>
          }
          
          <SimpleBreadCrumbs 
            crumbs={crumbs} 
            domainsInfo={domainsInfo} 
            productsInfo={productsInfo}
            onSelect={index => {
              history.push('/' + crumbs.slice(0, index + 1).join('/'))
            }}/>
         
        </div>
        <div style={styles.col2}>
          
          <NewProductModalWithRouter open={this.state.openNewProductModal} onClose={() => {
            this.setState({ openNewProductModal: false })
          }} />
          <Route exact={true} path="/products" render={({match}) => (
            <Button.Group color='blue'>
              <Button onClick={() => {
                this.setState({ openNewProductModal: true })
              }}>Create New Product</Button>
            </Button.Group>
          )}/>

          <NewFlowModalWithRouter
            open={this.state.openNewFlowModal} 
            productId={_.get(this, 'props.pathMatchProp.params.product_id')}
            onClose={() => {
              this.setState({ openNewFlowModal: false })
            }}/>
          <ApiKeyModalWithRouter
            open={this.state.openApiKeyModal} 
            productId={_.get(this, 'props.pathMatchProp.params.product_id')}
            onClose={() => {
              this.setState({ openApiKeyModal: false })
            }}/>
          <Auth0ModalWithRouter
            open={this.state.openAuth0Modal} 
            productId={_.get(this, 'props.pathMatchProp.params.product_id')}
            onClose={() => {
              this.setState({ openAuth0Modal: false })
            }}/>
          <Route exact={true} path="/products/:product_id/flows" render={({match}) => (
            <div>
              <Dropdown
                icon='settings'
                floating
                button
                className='icon'
                style={styles.settingsButton}
              >
                <Dropdown.Menu>
                  <Dropdown.Item 
                    icon='key'
                    text='API Key'
                    onClick={() => { this.setState({ openApiKeyModal: true }) }}
                  />
                  <Dropdown.Item
                    icon='lock'
                    text='Auth0'
                    onClick={() => { this.setState({ openAuth0Modal: true }) }}
                  />
                </Dropdown.Menu>
              </Dropdown>
              <Button.Group color='blue'>
                <Button onClick={() => { 
                  this.setState({ openNewFlowModal: true })
                }}>Create New Flow</Button>
              </Button.Group>
            </div>
          )}/>

          <Route exact={true} path="/products/:product_id/flows/:flow_id" render={({match}) => (
            <div style={styles.flowControlsParent}>
              <Button style={styles.flowConfigButton} onClick={() => {this.setState({ openFlowConfigModal: true })}} > 
                Flow Config 
              </Button>
              <Modal open={this.state.openFlowConfigModal} onClose={() => {
                this.setState({ openFlowConfigModal: false })
              }}>
                <Modal.Header style={styles.modalHeader}>Flow Config</Modal.Header>
                <Modal.Description style={styles.modalDescription}>
                  Flow Config is a good way to define your flow-level config once and then use it across multiple invocables in the flow.
                </Modal.Description>
                <Modal.Content>
                  <div style={{
                    ...styles.modalContent,
                    ...{ maxHeight: window.innerHeight - 160 }
                  }}>
                    <div style={styles.flowConfigForm}>
                      <Form 
                        formData={this.getFlowConfig()} 
                        schema={this.flowConfigSchema} 
                        uiSchema={this.flowConfigUISchema}
                        children={true}
                        onChange={evt => {this.setFlowConfig(evt.formData)}}
                      />
                    </div>
                  </div>
                </Modal.Content>
              </Modal>
              
              <div style={styles.envSelectorParent}>
                <span style={styles.environmentText}>Environment: &nbsp;</span>
                <Dropdown
                  pointing='top right'
                  scrolling
                  placeholder='Select environment'
                  options={[
                    { key: 'caption', text: 'Select Environment', disabled: true },
                    ...this.getFlowEnvList().map(env => ({ key: env, text: env, value: env }))
                  ]}
                  multiple={false}
                  value={this.getSelectedFlowEnv()}
                  onChange={(event, data) => {
                    this.onFlowEnvSelected(data)
                    console.log("onChange", data)
                  }}
                />
              </div>
              <Button.Group color='blue'>
                <Button onClick={() => {
                  this.onSaveToGithub()
                }}>Save to Github</Button>
                <Dropdown
                  className='button icon'
                  pointing='top right'
                  selectOnBlur={false}
                  floating
                  options={this.saveOptions}
                  multiple={false}
                  value={""}
                  onChange={(event, data) => {
                    let productId = _.get(this, 'props.pathMatchProp.params.product_id')
                    let flowId = _.get(this, 'props.pathMatchProp.params.flow_id')
                    let envName = this.getSelectedFlowEnv()
                    let flowJson = this.getChart()

                    if (flowJson && data.value === 'Save and Deploy Flow') {
                      this.props.deployFlowJsonAndConfig(productId, flowId, envName, flowJson)
                    } else if (flowJson && data.value === 'Publish Flow') {
                      this.props.publishFlowJsonAndConfig(productId, flowId, envName, flowJson)
                    }
                    console.log("onChange", data.value)
                  }}
                  trigger={<React.Fragment />}
                />
              </Button.Group>

            </div>
          )}/>

          <NewDomainModalWithRouter open={this.state.openNewDomainModal} onClose={() => {
            this.setState({ openNewDomainModal: false })
          }} />
          <Route exact={true} path="/domains" render={({match}) => (
            <Button.Group color='blue'>
              <Button onClick={() => {
                this.setState({ openNewDomainModal: true })
              }}>Create New Domain</Button>
            </Button.Group>
          )}/>

          <NewInvocableModalWithRouter 
            open={this.state.openNewInvocableModal} 
            domainId={_.get(this, 'props.pathMatchProp.params.domain_id')}
            onClose={() => {
              this.setState({ openNewInvocableModal: false })
            }} />
          <Route exact={true} path="/domains/:domain_id/invocables" render={({match}) => (
            <Button.Group color='blue'>
              <Button onClick={() => { 
                this.setState({ openNewInvocableModal: true })
              }}>Create New Invocable</Button>
            </Button.Group>
          )}/>
          <Route exact={true} path="/domains/:domain_id/invocables/:invocable_id" render={({match}) => (
            <Button.Group color='blue'>
              <Button onClick={() => {
                let domainId = _.get(this, 'props.pathMatchProp.params.domain_id')
                let invocableId = _.get(this, 'props.pathMatchProp.params.invocable_id')
                let invocable = this.props.invocablesInfo.invocablesById[invocableId] && 
                                  this.props.invocablesInfo.invocablesById[invocableId].invocable

                console.log("invocable", invocable)
                this.props.saveInvocable(domainId, invocableId, invocable)
              }}>Save Invocable</Button>
              <Dropdown
                className='button icon'
                pointing='top right'
                selectOnBlur={false}
                floating
                options={this.invocableOptions}
                multiple={false}
                value={""}
                onChange={(event, data) => {
                  let domainId = _.get(this, 'props.pathMatchProp.params.domain_id')
                  let invocableId = _.get(this, 'props.pathMatchProp.params.invocable_id')

                  console.log("this.props", domainId, invocableId)
                  this.props.publishInvocable(domainId, invocableId)
                  console.log("onChange", data.value)
                }}
                trigger={<React.Fragment />}
              />
            </Button.Group>
          )}/>
          
        </div>
        <div style={styles.col3}>
          <Dropdown 
            pointing='top right'
            selectOnBlur={false}
            trigger={trigger} 
            options={profileOptions}
            value={""}
            onChange={(event, data) => {
              if (data.value === 'Sign Out') {
                this.props.signout()
              }
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
    flexDirection: 'row',
    minHeight: 70,
    maxHeight: 70,
    backgroundColor: 'rgb(245, 247, 250)',
    borderBottom: '1px solid rgb(237, 239, 241)',
  },
  col1: {
    width: 301,
    paddingLeft: 15,
    fontSize: 25,
    flex: 1,
    fontWeight: '300',
    display: 'flex',
    alignItems: 'center',
  },
  col2: {
    paddingRight: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  col3: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 20,
  },
  userIcon: {
    width: 30,
    height: 30,
  },
  titleParent: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
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
  breadCrumbParent: {
    marginLeft: 10,
  },
  breadCrumb: {
    cursor: 'pointer',
    fontSize: 20,
    fontWeight: '300',
    color: 'black',
  },
  flowControlsParent: {
    display: 'flex',
    flexDirection: 'row'
  },
  envSelectorParent: {
    display: 'flex',
    alignItems: 'center',
    marginRight: 10,
    padding: 5,
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: 'rgb(230, 232, 236)',
    borderRadius: 4,
  },
  settingsButton:{
    marginRight: 10,
    backgroundColor: 'rgb(230, 232, 236)'
  },
  flowConfigButton:{
    display: 'flex',
    alignItems: 'center',
    marginRight: 10,
    padding: 5,
    paddingLeft: 17,
    paddingRight: 17,
    backgroundColor: 'rgb(230, 232, 236)',
    borderRadius: 4,
    border: '0px',
    fontWeight: 400,
    color: "#000000cc"
  },
  flowConfigPopup: {
    minHeight: '300px',
    maxHeight: '500px',
    minWidth: '400px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '20px'
  },
  flowConfigForm: {
    overflowY: 'auto',
    padding: '25px',
    margin: '15px'
  },
  modalHeader: {
    fontWeight: '300',
    fontSize: 18,
    borderBottom: '1px solid rgb(240, 244, 248)'
  },
  modalDescription: {
    fontWeight: '300',
    fontSize: 13,
    borderBottom: '1px solid rgb(240, 244, 248)',
    padding: '20px'
  },
  modalContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    padding: 10,
    fontWeight: '300',
  },
  buttonParent: {
    padding: 15,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    fontWeight: '300',
    margin: 0,
    fontFamily: 'inherit',
  },
  modalButton: {
    backgroundColor: constants.ACCENT_COLOR,
    color: 'white',
    fontWeight: '300',
    margin: 0,
    marginLeft: 5,
    fontFamily: 'inherit',
  },
  environmentText: {
    color: 'grey'
  }
}

function mapDispatchToProps(dispatch) {
  return { ...bindActionCreators(ActionCreators, dispatch), dispatch }
}

function mapStateToProps(state) {
  return {
    loginInfo: state.loginInfo,
    domainsInfo: state.domainsInfo,
    productsInfo: state.productsInfo,
    flowsInfo: state.flowsInfo,
    invocablesInfo: state.invocablesInfo
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Header)
