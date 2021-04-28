/** @jsx jsx */
import { 
  Component 
} from 'react'
import _ from 'lodash'
import { jsx } from '@emotion/core'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { FiPlus } from "react-icons/fi"
import { TiFlowChildren } from "react-icons/ti"
import Form from "react-jsonschema-form"
import { MdRefresh } from "react-icons/md"
import { Input, Dropdown } from 'semantic-ui-react'

import * as utils from '../../../../../lib/utils'
import { ActionCreators } from '../../../../../actions'
import SimpleBackdrop from '../../DomainsView/components/Backdrop'

class SubflowNodeOptionsView extends Component {

  constructor(props) {
    super(props)

    this.state = {
      invocableSearchModalOpen: false
    }
  }

  componentWillMount() {
    this.componentDidUpdate()
  }

  componentDidUpdate() {
    const productsInfo = this.props.productsInfo
    if (!productsInfo.fetched && !productsInfo.fetching) {
        this.props.fetchProducts()
    }
    
    const node = this.props.node
    let selectedProductId = _.get(node, 'properties.product')

    const flowsInfo = this.props.flowsInfo      
    if (selectedProductId) {
        if (!flowsInfo.flowIdsByProduct[selectedProductId] || (!flowsInfo.flowIdsByProduct[selectedProductId].fetching && 
        !flowsInfo.flowIdsByProduct[selectedProductId].fetched)) {
        this.props.fetchFlows(selectedProductId)
        }
    }

    let selectedEnv = 'master'
    let selectedFlowId = _.get(node, 'properties.flow')
    let selectedPublishedFlow = _.get(flowsInfo, `publishedFlowEnvsById.${selectedFlowId}.publishedFlowJsonByEnvName.${selectedEnv}`)
    let selectedPublishedFlowFetching = _.get(flowsInfo, `publishedFlowEnvsById.${selectedFlowId}.publishedFlowJsonByEnvName.${selectedEnv}.fetching`, false)

    if (selectedFlowId && !selectedPublishedFlow) {
      if (!selectedPublishedFlowFetching) {
        console.log("fetching published flow")
        this.props.fetchFlowJsonAndConfig(selectedProductId, selectedFlowId, selectedEnv, true)
      }
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

  getFormConfig(){
    let flowsInfo = this.props.flowsInfo

    let flowId = _.get(this, 'props.pathMatchProp.params.flow_id')
    let selectedFlowEnv = this.getSelectedFlowEnv()
    
    return _.get(flowsInfo, `flowEnvsById.${flowId}.flowJsonByEnvName.${selectedFlowEnv}.flowJson.flow_config`)
  }

  getInvocableConfigType(data){
    return data && data.toString().includes(":") ? data.toString().split(/:(.*)/)[0].toLowerCase() : "value"
  }

  getInvocableConfigValue(data){
    return data && data.toString().includes(":") ? (data.toString().split(/:(.*)/)[1] ? data.toString().split(/:(.*)/)[1] : "") : (data ? data.toString() : "")
  }
  
  convertConfigToDict(formData)
  {
    var configDict = {...formData}
    Object.keys(formData).forEach((k) => {
      configDict[k] = {
        "type":  this.getInvocableConfigType(formData[k]),
        "value": this.getInvocableConfigValue(formData[k])
      }
    })
    console.log("configDict", configDict)
    return configDict
  }

  convertConfigToValue(configDict)
  {
    var configValue = {...configDict}
    Object.keys(configDict).forEach((k) => {
      var type = configDict[k]["type"].toLowerCase() === "" ? "value" : configDict[k]["type"].toLowerCase()
      var value = configDict[k]["value"] ? configDict[k]["value"] : ""
      configValue[k] = type + ":" + value
    })
    console.log("configValue", configValue)
    return configValue
  }
  
  getSubflowConfigJsonSchema(subflowConfig, node){
    let schema = {
      "$schema": "http://json-schema.org/draft-07/schema",
      "$id": "http://example.com/example.json",
      "type": "object",
      "title": "Subflow Config",
      "description": "",
      "required": [],
      "properties": {}
    }
    
    if(!node.properties.configData)
      node.properties.configData = {}

    Object.keys(subflowConfig).forEach(key => {
      schema.properties[key] = {
        "$id": `#/properties/${key}` ,
        "type": "string",
        "title": key,
        "description": ""
      }
      schema.required.push(key)
      if(!node.properties.configData[key])
        node.properties.configData[key] = {
          "type": "value",
          "value": ""
        }
    })
  
    return schema;
  }

  getView(node) {
    const productsInfo = this.props.productsInfo
    let productsFetching = productsInfo.fetching
    const products = utils.values(productsInfo.products)
    let selectedProductId = _.get(node, 'properties.product')
    
    let selectedEnv = 'master'

    const flowsInfo = this.props.flowsInfo
    let selectedFlowId = _.get(node, 'properties.flow')
    let selectedPublishedFlow = _.get(flowsInfo, `publishedFlowEnvsById.${selectedFlowId}.publishedFlowJsonByEnvName.${selectedEnv}`)
    let selectedPublishedFlowFetching = _.get(flowsInfo, `publishedFlowEnvsById.${selectedFlowId}.publishedFlowJsonByEnvName.${selectedEnv}.fetching`, false)
    let flowsFetching = true
    let flows = []
    
    if (selectedProductId) {
      flowsFetching = _.get(flowsInfo, `flowIdsByProduct.${selectedProductId}.fetching`) !== false  
      flows = _.get(flowsInfo, `flowIdsByProduct.${selectedProductId}.flowIds`, [])
    }

    let loading = productsFetching || (selectedProductId && flowsFetching) || (selectedFlowId && selectedPublishedFlowFetching)
    let loadingMessage = productsFetching ? "Fetching Products" : (
      selectedProductId && flowsFetching ? "Fetching Flows" : 
      selectedFlowId && selectedPublishedFlowFetching ? "Fetching Flow" : ""
    )

    console.log("PP", this.props)
    return (
      <div style={styles.width100}>
        <div style={styles.header}>
          <TiFlowChildren size="20" color="rgb(100, 100, 100)" />
          <span style={styles.val}> {"Subflow"} </span>
        </div>

        <div style={styles.header2}>
          <span style={styles.heading}>SUBFLOW INFO</span>

          <div style={styles.selectorContainer}>
            <div style={styles.labelParent}>
              <span style={styles.label}>Node Name</span>
            </div>
            <Input 
                size="small" 
                style={styles.textField} 
                placeholder="Enter Node Name"
                // label="Node Name" 
                variant="filled" 
                value={node.properties ? node.properties.name : ''}
                onChange={evt => {
                  if (!node.properties) {
                    node.properties = {}
                  }
                  node.properties.name = evt.target.value
                  if (this.props.onNodeChange) {
                    this.props.onNodeChange(node)
                  }
                }}
              />
              {
                node.properties && node.properties.name && (! /^(?!http)[a-z0-9-]*$/.test(node.properties.name) || node.properties.name.startsWith("-")) &&
                <span style={styles.errorMessage}> 
                  - Names should only contain lowercase alphanumeric and hyphens 
                  <br/> 
                  - Name should start and end with lowercase alphanumeric 
                  <br/> 
                  - Node name should not start with http 
                </span>
              } 
          </div>

          <SimpleBackdrop open={loading} inverted={true} label={loadingMessage} />
          
          {
            !productsFetching ? (
              <div style={styles.selectorContainer}>
                <div style={styles.labelParent}>
                  <span style={styles.label}>Product</span>
                  <FiPlus style={styles.labelIcon} size={18} onClick={() => {
                    window.open("/products", "_blank")
                  }} />
                  <MdRefresh style={styles.labelIcon} size={18} onClick={() => {
                    this.props.fetchProducts()
                  }} />
                </div>
                <div style={styles.selectorParent} className="selectorParent">
                  
                  <Dropdown
                    style={styles.dropdown}
                    // pointing='top right'
                    scrolling
                    placeholder='Select Product'
                    options={[
                      { key: 'caption', text: 'Select Product', disabled: true },
                      ...products.filter(product => product.has_published_flows).map(product => ({
                        key: product.id, text: product.name, value: product.id
                      })),
                    ]}
                    multiple={false}
                    value={_.get(node, 'properties.product', '')}
                    onChange={(event, data) => {
                      if (!node.properties) {
                        node.properties = {}
                      }
                      node.properties.product = data.value
                      delete node.properties.flow
                      if (this.props.onNodeChange) {
                        this.props.onNodeChange(node)
                      }
                    }}
                  />
                </div>
              </div>
            ) : null
          }
          
          {
            selectedProductId && !flowsFetching ? (
              <div style={styles.selectorContainer}>
                <div style={styles.labelParent}>
                  <span style={styles.label}>Published Flow</span>
                  <MdRefresh style={styles.labelIcon} size={18} onClick={() => {
                    this.props.fetchFlows(selectedProductId)
                  }} />
                </div>
                <div style={styles.selectorParent} className="selectorParent">
                  <Dropdown
                    style={styles.dropdown}
                    // pointing='top right'
                    scrolling
                    placeholder='Select Published Flow'
                    options={[
                      { key: 'caption', text: 'Select Published Flow', disabled: true },
                      ...flows.filter(flow => flow.is_published).map(flow => ({
                        key: flow.id, text: flow.name, value: flow.id
                      })),
                    ]}
                    multiple={false}
                    value={_.get(node, 'properties.flow', '')}
                    onChange={(event, data) => {
                      console.log("data.value", data.value)
                      if (!node.properties) {
                        node.properties = {}
                      }
                      node.properties.flow = data.value
                      if (this.props.onNodeChange) {
                        this.props.onNodeChange(node)
                      }
                    }}
                  />
                </div>
              </div>
            ) : null
          }

          {
            selectedFlowId && selectedPublishedFlow && !selectedPublishedFlowFetching && _.get(selectedPublishedFlow, 'publishedFlowJson.flow_config')
            ? (
              <div style={{...styles.header2, ...{marginTop: "25px"}}}>
                <div style={styles.headingParent}>
                  <span style={styles.heading2}>SUBFLOW CONFIG</span>
                </div>
                
                {Object.keys(_.get(selectedPublishedFlow, 'publishedFlowJson.flow_config', {})).length !== 0 ?
                <div style={styles.formParent}>
                  <Form
                    schema={this.getSubflowConfigJsonSchema(selectedPublishedFlow.publishedFlowJson.flow_config, node)}
                    formData={this.convertConfigToValue(_.get(node, 'properties.configData', {}))} 
                    widgets={{
                      TextWidget: props => (
                        <div style={styles.nodeEnvConfig}>
                          <div style={styles.configTypeSelectorParent}>
                            <Dropdown 
                              style={styles.nodeEnvTypeDropdown}
                              options={[{'key':'value', 'text':'value', 'value':'value'}, {'key':'ref', 'text':'ref', 'value':'ref'}]} 
                              value={this.getInvocableConfigType(props.value)}
                              onChange={(evt, data) => {
                                props.onChange(data.value + ":")
                              }} 
                            />
                          </div>
                          {this.getInvocableConfigType(props.value) === "value" ?
                            <Input 
                              size="small" 
                              style={styles.nodeEnvTextField} 
                              variant="filled" 
                              value={this.getInvocableConfigValue(props.value)}
                              onChange={(evt, data) => {
                                props.onChange(this.getInvocableConfigType(props.value) + ":" + data.value)
                              }}
                            />
                            :
                            <div style={styles.flowConfigSelectorParent}>
                              <Dropdown 
                                style={styles.nodeEnvRefDropdown}
                                className="node-env-ref-dropdown"
                                options={Object.keys(this.getFormConfig()).map(val => ({
                                  key: val, text: val, value: val,
                                }))}
                                value={props.value.split(/:(.*)/)[1]}
                                placeholder="Select Flow Config"
                                onClick={(evt, data) => {
                                  // Dummy change-case to rerender component so that new flow config gets reflected immediately
                                  var type = props.value.split(/:(.*)/)[0];
                                  if(type === type.toUpperCase())
                                    props.onChange(type.toLowerCase() + ":" + data.value)
                                  else
                                    props.onChange(type.toUpperCase() + ":" + data.value)
                                }}
                                onChange={(evt, data) => {
                                  props.onChange(this.getInvocableConfigType(props.value) + ":" + data.value)
                                }} 
                              />
                            </div>
                          }
                        </div>
                      )
                    }}
                    onChange={evt => {
                      if (!node.properties) {
                        node.properties = {}
                      }
                      node.properties.configData = this.convertConfigToDict(evt.formData)
                    }}
                  > <br /> </Form>
                </div> :
                <div style={styles.formParent}>
                  No Subflow config to fill
                </div>
                }
              </div>
            ) : null
          }
        </div>
      
      </div>
    )
  }

  render() {
    const node = this.props.node

    console.log("node", node)
    return (
      <div style={{
        ...styles.root,
        ...(
          node ? {} : {
            right: -300,
          }
        )
      }}>
        {
          node
          ? (
            this.getView(node)
          ) : (
            <div style={styles.noNodeSelected}>
              No Node Selected
            </div>
          )
        }
        
      </div>
    )
  }
}

const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    // padding: 15,
    width: 300,
    height: 'calc(100% - 70px)',
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'white',
    borderLeft: '1px solid rgb(227, 229, 231)',
    transition: 'all 0.2s ease-in-out',
    overflowY: 'auto',
  },
  width100: {
    width: '100%',
  },
  header: {
    width: '100%',
    display: 'flex',
    // flexDirection: 'column',
    alignItems: 'center',
    padding: 15,
    paddingTop: 20,
    paddingBottom: 20,
  },
  header2: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  headingParent: {
    display: 'flex',
    width: '100%',
    justifyContent: 'center',
  },
  heading: {
    color: 'rgb(80, 80, 80)',
    // marginTop: 15,
    marginBottom: 5,
    fontSize: 13,
    fontWeight: '600',
    width: '100%',
    padding: 12,
    paddingLeft: 15,
    paddingRight: 15,
    // borderRadius: 4,
    // borderTop: '1px solid rgba(0, 0, 0, 0.07)',
    backgroundColor: 'rgb(245, 247, 248)',
    // textAlign: 'left',
  },
  heading2: {
    color: 'rgb(80, 80, 80)',
    // marginTop: 30,
    marginBottom: 15,
    fontSize: 13,
    fontWeight: '600',
    width: '100%',
    padding: 12,
    paddingLeft: 15,
    paddingRight: 15,
    // borderRadius: 4,
    // borderTop: '1px solid rgba(0, 0, 0, 0.07)',
    backgroundColor: 'rgb(245, 247, 248)',
    // textAlign: 'left',
  },
  val: {
    fontSize: 16,
    width: '100%',
    fontWeight: '300',
    textAlign: 'left',
    marginLeft: 10,
    // marginTop: 5,
    // marginBottom: 15,
  },
  textField: {
    marginTop: 10,
    width: '100%',
    height: 45,
    fontFamily: 'inherit',
    fontSize: 14,
  },
  noNodeSelected: {
    display: 'flex',
    // justifyContent: 'center',
    width: '100%',
    marginTop: 5,
    fontSize: 16,
    color: 'grey',
    fontWeight: '200',
    // border: '1px solid black',
  },
  selectorContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    paddingLeft: 15,
    paddingRight: 15,
  },
  selectorContainer2: {
    marginBottom: 35,
  },
  labelParent: {
    display: 'flex',
    marginTop: 10,
    alignItems: 'center',
  },  
  label: {
    flex: 1,
    textAlign: 'left',
    fontWeight: '300',
  },
  versionContainer: {
    display: 'flex',
    flexDirection: 'column',
    padding: 10,
    paddingTop: 5,
    paddingBottom: 5,
    border: '1px solid rgba(0, 0, 0, 0.1)',
    borderRadius: '.28571429rem',
    maxWidth: '100%',
    marginTop: 15,
    marginLeft: 15,
    marginRight: 15,
  },
  label2: {
    flex: 1,
    textAlign: 'left',
    // fontSize: 12,
    diaply: 'inline-block',
    fontWeight: '300',
    marginTop: 5,
    marginBottom: 5,
    color: 'rgb(50, 50, 50)',
    wordBreak: 'break-word',
  },
  labelIcon: {
    margin: 4,
    color: 'rgb(80, 80, 80)',
    cursor: 'pointer',
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
    // width: 200,
    height: 45,
    marginTop: 7,
  },
  dropdown: {
    height: '100%',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
  },
  progressParent: {
    display: 'flex',
    paddingTop: 10,
    paddingBottom: 10,
    height: 45,
    // border: '1px solid black',
    marginTop: 10,
  },
  progressLabel: {
    marginLeft: 10,
  },
  cellKey: {
    color: 'grey',
    fontWeight: '300',
  },
  cellValue: {
    wordBreak: 'break-all',
    fontWeight: '300',
  },
  formParent: {
    width: '100%',
    padding: '0px 15px',
  },
  splitIcon: {
    transform: 'rotate(90deg)',
  },
  joinIcon: {
    transform: 'rotate(-90deg)',
  },
  errorMessage: {
    flex: 1,
    textAlign: 'left',
    display: 'flex',
    fontWeight: '400',
    marginLeft: 5,
    marginBottom: 5,
    color: 'rgb(250, 0, 0)',
    fontSize: '85%',
  },
  selectInvocableButton:{
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "5px 10px",
    backgroundColor: "rgb(33, 133, 209)",
    borderRadius: "4px",
    height: "45px",
    marginTop: "15px",
    cursor: "pointer",
    color: "white"
  },
  invocableSearchModal:{
    padding: "0px 17px"
  },
  nodeEnvConfig:{
    display: "flex",
    alignItems: "center"
  },
  nodeEnvTypeDropdown:{
    minWidth: "55px"
  },
  nodeEnvRefDropdown: {
    width: "100%",
    minWidth: "unset",
    wordBreak: "break-all",
    display: "flex",
    alignItems: "center"
  },
  nodeEnvTextField: {
    fontFamily: 'inherit',
    fontSize: 14,
    width: "100%"
  },
  flowConfigSelectorParent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 5,
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: 'rgb(230, 232, 236)',
    borderRadius: 4,
    minHeight: 45,
    width: "100%"
  },
  configTypeSelectorParent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 5,
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: 'rgb(230, 232, 236)',
    borderRadius: 4,
    height: 45,
    marginRight: "5px"
  },
}

function mapDispatchToProps(dispatch) {
  return { ...bindActionCreators(ActionCreators, dispatch), dispatch }
}

function mapStateToProps(state) {
  return {
    loginInfo: state.loginInfo,
    productsInfo: state.productsInfo,
    flowsInfo: state.flowsInfo,
    domainsInfo: state.domainsInfo,
    invocablesInfo: state.invocablesInfo,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SubflowNodeOptionsView)
