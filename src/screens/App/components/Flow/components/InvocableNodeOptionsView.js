/** @jsx jsx */
import { 
  Component 
} from 'react'
import _ from 'lodash'
import { jsx } from '@emotion/core'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { FiPlus } from "react-icons/fi"
import Form from "react-jsonschema-form"
import { AiOutlineFork, AiOutlineWarning } from "react-icons/ai"
import { TiFlowChildren } from "react-icons/ti"
import { MdCode, MdRefresh } from "react-icons/md"
import { AiOutlineQuestionCircle } from "react-icons/ai"
import { Input, Table, Dropdown, Modal } from 'semantic-ui-react'

import constants from '../../../../../constants'
import * as utils from '../../../../../lib/utils'
import { ActionCreators } from '../../../../../actions'
import SimpleBackdrop from '../../DomainsView/components/Backdrop'
import ExploreView from '../../ExploreView'

import Api from '../../../../../../src/lib/api'


class InvocableNodeOptionsView extends Component {

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
    const domainsInfo = this.props.domainsInfo
    const node = this.props.node
    let domainsFetching = domainsInfo.fetching

    if (!domainsInfo.fetched && !domainsFetching) {
      console.log("fetchDomains")
      this.props.fetchDomains()
    }

    const invocablesInfo = this.props.invocablesInfo
    let selectedDomainId = _.get(node, 'properties.domain')
    if (selectedDomainId) {
      if (!invocablesInfo.invocableIdsByDomain[selectedDomainId] || (!invocablesInfo.invocableIdsByDomain[selectedDomainId].fetching && 
        !invocablesInfo.invocableIdsByDomain[selectedDomainId].fetched)) {

        console.log("fetchInvocables selectedDomainId", selectedDomainId)
        this.props.fetchInvocables(selectedDomainId)
      }
    }

    let selectedInvocableId = _.get(node, 'properties.invocable')
    let selectedInvocable = _.get(invocablesInfo, `invocablesById.${selectedInvocableId}.invocable`)
    let selectedInvocableFetching = (this.props.invocablesInfo.invocablesById[selectedInvocableId]
      && this.props.invocablesInfo.invocablesById[selectedInvocableId].fetching === true)

    if (selectedInvocableId && !selectedInvocable) {
      if (!selectedInvocableFetching) {
        console.log("fetchSingleInvocable selectedDomainId, selectedInvocableId", selectedDomainId, selectedInvocableId)
        this.props.fetchSingleInvocable(selectedDomainId, selectedInvocableId)
      }
    }
  }

  handleInvocableSelection = (node) => (id) => {
    var domainId = parseInt(id.split('-')[0])
    var invocableId = parseInt(id.split('-')[1])
    
    this.setState({invocableSearchModalOpen: false})

    if (!node.properties) {
      node.properties = {}
    }
    
    node.properties.domain = domainId
    node.properties.invocable = invocableId

    delete node.properties.invocableVersion
    delete node.properties.configData

    if (this.props.onNodeChange) {
      this.props.onNodeChange(node)
    }
  }

  getName(list, id) {
    var item = list.find(function (item) {
      return item.id === id
    })
    if(item && item.name)
      return item.name
    else
      return ""
  }

  getView(node) {
    const domainsInfo = this.props.domainsInfo
    const invocablesInfo = this.props.invocablesInfo
    const domains = utils.values(domainsInfo.domains)
    let domainsFetching = domainsInfo.fetching

    let invocablesFetching = true
    let invocables = []
    let selectedDomainId = _.get(node, 'properties.domain')
    let selectedInvocableId = _.get(node, 'properties.invocable')
    let selectedInvocableFetching = (this.props.invocablesInfo.invocablesById[selectedInvocableId]
      && this.props.invocablesInfo.invocablesById[selectedInvocableId].fetching === true)
    let selectedInvocable = _.get(invocablesInfo, `invocablesById.${selectedInvocableId}.invocable`)
   
    if (selectedDomainId) {
      invocablesFetching = _.get(invocablesInfo, `invocableIdsByDomain.${selectedDomainId}.fetching`) !== false
      
      invocables = _.get(invocablesInfo, `invocableIdsByDomain.${selectedDomainId}.invocableIds`, [])
    }

    if (selectedInvocable) {
      if (node) {
        if (!node.properties || !node.properties.invocableVersion) {
          node.properties = node.properties || {}
          node.properties.invocableVersion = _.get(selectedInvocable, 'versions.latest-tag')
        }
      }
    }
    let loading = domainsFetching || (selectedDomainId && invocablesFetching) || selectedInvocableFetching
    let loadingMessage = domainsFetching ? "Fetching Domains" : (
      (selectedDomainId && invocablesFetching) ? "Fetching Invocables" : (
        selectedInvocableFetching ? "Fetching Invocable" : ""
      )
    )
      
    if (selectedInvocable && selectedInvocable.invocable_definition_json) {
      let data = _.get(node, 'properties.configData', {})
      let schema = JSON.parse(selectedInvocable.invocable_definition_json)
      
      data = utils.removeAdditionalPropertiesFromJson(this.convertConfigToValue(data), schema)
      data = this.convertConfigToDict(data)
      if (!node.properties) {
        node.properties = {}
      }
      console.log("Node properties config data ", data)
      node.properties.configData = data
    }
    return (
      <div style={styles.width100}>
        <Modal size='large' open={this.state.invocableSearchModalOpen} onClose={() => {
          this.setState({ invocableSearchModalOpen: false })
        }}>
          <Modal.Header>Select Invocable</Modal.Header>
          <Modal.Content style={styles.invocableSearchModal}>
            <ExploreView onCardClick={this.handleInvocableSelection(node)} selectInvocable={true}/>
          </Modal.Content>
        </Modal>
      
        <div style={styles.header}>
          {
            node.type === 'Task' && <MdCode size="20" color="rgb(100, 100, 100)" />
          }
          {
            node.type === 'Split' && <AiOutlineFork style={styles.splitIcon} size="20" color="rgb(100, 100, 100)" />
          }
          {
            node.type === 'Join' && <AiOutlineFork style={styles.joinIcon} size="20" color="rgb(100, 100, 100)" />
          }
          {
            node.type === 'Subflow' && <TiFlowChildren size="20" color="rgb(100, 100, 100)" />
          }
          {
            node.type === 'CatchAll' && <AiOutlineWarning size="20" color="rgb(100, 100, 100)" />
          }
          <span style={styles.val}> {node.type && node.type.toUpperCase()} </span>
        </div>

        <div style={styles.header2}>
          <div style={styles.headingParent}>
            <span style={styles.heading}>INVOCABLE INFO</span>
          </div>

          <div style={styles.selectorContainer}>
            <div style={styles.labelParent}>
              <span style={styles.label}>Node Name</span>
            </div>
            <Input 
                size="small" 
                style={styles.textField} 
                placeholder="Enter Node Name"
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
          
          <div style={styles.selectorContainer}>
            <div style={styles.selectInvocableButton} onClick={() => {
                this.setState({invocableSearchModalOpen: true})
            }}>
              Select Invocable
            </div>
          </div>
          
          {
            !domainsFetching && selectedInvocable ? (
              <div style={styles.selectorContainer}>
                <div style={styles.labelParent}>
                  <span style={styles.label}>Domain</span>
                  {/* <FiPlus style={styles.labelIcon} size={18} onClick={() => {
                    window.open("/domains", "_blank")
                  }} />
                  <MdRefresh style={styles.labelIcon} size={18} onClick={() => {
                    this.props.fetchDomains()
                  }} /> */}
                </div>
                <div style={styles.selectorParent} className="selectorParent">
                  <div style={styles.dropdown}> 
                    {
                    this.getName(domains, _.get(node, 'properties.domain', null)) ? 
                      <a href={constants.UI_URL + '/domains/' + _.get(node, 'properties.domain', '') + "/invocables"} target="_blank" rel="noopener noreferrer">
                        {this.getName(domains, _.get(node, 'properties.domain', ''))}
                      </a>
                    :
                      ""
                    }
                  </div>
                  {/* <Dropdown
                    style={styles.dropdown}
                    scrolling
                    placeholder='Select Domain'
                    options={[
                      { key: 'caption', text: 'Select Domain', disabled: true },
                      ...domains.map(domain => ({
                        key: domain.id, text: domain.name, value: domain.id
                      })),
                    ]}
                    multiple={false}
                    value={_.get(node, 'properties.domain', '')}
                    onChange={(event, data) => {
                      if (!node.properties) {
                        node.properties = {}
                      }
                      node.properties.domain = data.value
                      delete node.properties.invocable
                      delete node.properties.invocableVersion
                      delete node.properties.configData
                      if (this.props.onNodeChange) {
                        this.props.onNodeChange(node)
                      }
                    }}
                  /> */}
                </div>
              </div>
            ) : null
          }
          
          {
            selectedDomainId && !invocablesFetching && selectedInvocable ? (
              <div style={styles.selectorContainer}>
                <div style={styles.labelParent}>
                  <span style={styles.label}>Invocable</span>
                  {/* <FiPlus style={styles.labelIcon} size={18} onClick={() => {
                    window.open(`/domains/${selectedDomainId}/invocables`, "_blank")
                  }} />
                  <MdRefresh style={styles.labelIcon} size={18} onClick={() => {
                    this.props.fetchInvocables(selectedDomainId)
                  }} /> */}
                </div>
                <div style={styles.selectorParent} className="selectorParent">
                <div style={styles.dropdown}> 
                  {
                    this.getName(invocables, _.get(node, 'properties.invocable', null)) ? 
                      <a href={constants.UI_URL + '/domains/' + _.get(node, 'properties.domain', '') + '/invocables/' + _.get(node, 'properties.invocable', '')} target="_blank" rel="noopener noreferrer">
                        {this.getName(invocables, _.get(node, 'properties.invocable', ''))}
                      </a>
                    :
                      ""
                  }
                </div>
                  {/* <Dropdown
                    style={styles.dropdown}
                    scrolling
                    placeholder='Select Invocable'
                    options={[
                      { key: 'caption', text: 'Select Invocable', disabled: true },
                      ...invocables.map(invocable => ({
                        key: invocable.id, text: invocable.name, value: invocable.id
                      })),
                    ]}
                    multiple={false}
                    value={_.get(node, 'properties.invocable', '')}
                    onChange={(event, data) => {
                      // console.log("data.value", data.value)
                      if (!node.properties) {
                        node.properties = {}
                      }
                      
                      node.properties.invocable = data.value
                      delete node.properties.invocableVersion
                      delete node.properties.configData
                      if (this.props.onNodeChange) {
                        this.props.onNodeChange(node)
                      }
                    }}
                  /> */}
                </div>
              </div>
            ) : null
          }

          {
            selectedInvocable
            ? (
              <div style={styles.versionContainer}>
                <Table basic='very'>
                  <Table.Body>
                    <Table.Row>
                      <Table.Cell style={styles.cellKey}>Description</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell style={styles.cellValue}> {
                        _.get(selectedInvocable, 'description') || 'NA'
                      } </Table.Cell>
                    </Table.Row>
                    
                    <Table.Row>
                      <Table.Cell style={styles.cellKey}>API Docs URL</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell style={styles.cellValue}> {
                        selectedInvocable.doc_server_url ? 
                          <a href={_.get(selectedInvocable, 'doc_server_url')} target="_blank" rel="noopener noreferrer">
                            Link
                          </a> 
                        : 
                          'NA'
                      } </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell style={styles.cellKey}>Invocable Image</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell style={styles.cellValue}> {
                        _.get(selectedInvocable, 'versions.image') || 'NA'
                      } </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell style={styles.cellKey}> Commit History </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell style={styles.cellValue}>
                        
                        <button onClick={() => {
                          console.log("fetch commit history")
                          let token = this.props.loginInfo.token
                          
                          Api.get(`${constants.BACKEND_URL}/domains/${selectedDomainId}/invocables/${selectedInvocableId}/published_tags/`, {Authorization: token}).
                          then((res) => {
                              var commit_history = "<table style='border: 1px solid black; border-collapse: collapse;'> \
                              <tr style='border: 1px solid black;'> <th style='padding: 15px;'> Tag </th> <th style='padding: 15px;'> Pushed At (UTC) </th> </tr>"
                              res.image_details.map(r => {
                              commit_history += "<tr style='border: 1px solid black;'>"
                              var tag = r.tag;
                              var push_date = r.image_pushed_at.toString();
                              push_date = push_date.substring(0, 10) + " " + push_date.substring(11, push_date.length-1);
                              commit_history += "<td style='padding: 15px;'>" + tag + "</td> <td style='padding: 15px;'>" + push_date + "</td>";
                              commit_history += "</tr>";
                            })
                            commit_history += "</table>"
                            var w = window.open();
                            w.document.body.innerHTML = commit_history;
                          })
                        }}>Commit History </button>

                      </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell style={styles.cellKey}>Latest Version</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell style={styles.cellValue}> 
                        { _.get(selectedInvocable, 'versions.latest-tag') || 'NA'} 
                        <MdRefresh style={styles.labelIcon} size={18} onClick={() => {
                          this.props.fetchSingleInvocable(selectedDomainId, selectedInvocableId)
                        }} />
                      </Table.Cell>
                      
                    </Table.Row>
                  </Table.Body>
                </Table>
              </div>
            ) : null
          }

          {
            selectedInvocable ? (
              <div style={{...styles.selectorContainer, ...styles.selectorContainer2}}>
                <div style={styles.labelParent}>
                  <span style={styles.label}>Invocable Version</span>
                </div>
                
                <Input 
                  size="small" 
                  style={styles.textField} 
                  placeholder="Enter Invocable Version"
                  variant="filled" 
                  value={ (node.properties && node.properties.invocableVersion) || (selectedInvocable.versions && selectedInvocable.versions['latest-tag']) }
                  onChange={evt => {
                    if (!node.properties) {
                      node.properties = {}
                    }
                    node.properties.invocableVersion = evt.target.value
                    if (this.props.onNodeChange) {
                      this.props.onNodeChange(node)
                    }
                  }}
                />
              </div>
            ) : null
          }
        </div>
      
        {
          selectedInvocable
          ? (
            <div>
              <div style={styles.header2}>
                <div style={styles.headingParent}>
                  <span style={styles.heading2}>RUNTIME CONFIG</span>
                </div>

                <div style={styles.formParent}>
                  <Form
                    schema={constants.RUNTIME_CONFIG_SCHEMA}
                    uiSchema={constants.RUNTIME_CONFIG_UI_SCHEMA}
                    formData={_.get(node, 'properties.runtimeConfigData', {a: 'aa'})}
                    onChange={evt => {
                      if (!node.properties) {
                        node.properties = {}
                      }
                      node.properties.runtimeConfigData = evt.formData
                      console.log("evt.formData", evt.formData)
                    }}
                  > <br /> </Form>
                </div>
              </div>

              <div style={styles.header2}>
                <div style={styles.headingParent}>
                  <span style={styles.heading2}>
                    AUTH CONFIG
                    <a href={constants.AUTH_WIKI_LINK} target="_blank" rel="noopener noreferrer">
                      <AiOutlineQuestionCircle style={styles.authInfoIcon}></AiOutlineQuestionCircle>
                    </a>
                  </span>
                </div>
                <div style={{...styles.formParent}}>
                  {node && !(node.type === 'CatchAll') ?
                    <div>
                      <Form
                        schema={constants.URL_CONFIG_SCHEMA}
                        uiSchema={constants.URL_CONFIG_UI_SCHEMA}
                        formData={{needs_public_endpoint: _.get(node, 'properties.is_public', false), permissions: _.get(node, 'properties.permissions', [])}}
                        onChange={evt => {
                          if (!node.properties) {
                            node.properties = {}
                          }
                          node.properties.is_public = evt.formData.needs_public_endpoint
                          node.properties.permissions = evt.formData.permissions
                          console.log("evt.formData", evt.formData)
                        }}
                      > 
                        <br/> 
                      </Form>
                    </div>
                  :
                    <div style={{marginBottom: "15px"}}>
                      URL config not applicable for CatchAll
                    </div>
                  }
                </div>
              </div>
            </div>
          ) : null
        }

        {
          selectedInvocable && selectedInvocable.invocable_definition_json
          ? (
            <div style={styles.header2}>
              <div style={styles.headingParent}>
                <span style={styles.heading2}>INVOCATION CONFIG</span>
              </div>

              <div style={styles.formParent}>
                <Form
                  schema={JSON.parse(selectedInvocable.invocable_definition_json)}
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
              </div>
            </div>
          ) : null
        }
      </div>
    )
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
    console.log("getFormConfig called")
    let flowsInfo = this.props.flowsInfo

    let flowId = _.get(this, 'props.pathMatchProp.params.flow_id')
    let selectedFlowEnv = this.getSelectedFlowEnv()
    
    return _.get(flowsInfo, `flowEnvsById.${flowId}.flowJsonByEnvName.${selectedFlowEnv}.flowJson.flow_config`)
  }

  getInvocableConfigType(data){
    return data && data.toString().includes(":") ? data.toString().split(/:(.*)/)[0].toLowerCase() : "value"
  }

  getInvocableConfigValue(data){
    if (typeof data === "boolean")
      return data

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
    console.log("formData", formData)
    return configDict
  }

  convertConfigToValue(configDict)
  {
    var configValue = {...configDict}
    Object.keys(configDict).forEach((k) => {
      var type = configDict[k]["type"].toLowerCase() === "" ? "value" : configDict[k]["type"].toLowerCase()
      var value = configDict[k]["value"] ? configDict[k]["value"] : ""

      if (typeof configDict[k]["value"] === "boolean")
        configValue[k] = configDict[k]["value"]
      else
        configValue[k] = type + ":" + value
    })
    console.log("configValue", configValue)
    return configValue
  }

  getSubflowView(node) {
    const productsInfo = this.props.productsInfo
    const flowsInfo = this.props.flowsInfo
    const products = utils.values(productsInfo.products)
    let productsFetching = productsInfo.fetching

    if (!productsInfo.fetched && !productsFetching) {
      this.props.fetchProducts()
    }
    
    let flowsFetching = true
    let flows = []
    let selectedProductId = _.get(node, 'properties.product')

    if (selectedProductId) {
      if (!flowsInfo.flowIdsByProduct[selectedProductId] || (!flowsInfo.flowIdsByProduct[selectedProductId].fetching && 
        !flowsInfo.flowIdsByProduct[selectedProductId].fetched)) {
        this.props.fetchFlows(selectedProductId)
      }
    }

    if (selectedProductId) {
      flowsFetching = _.get(flowsInfo, `flowIdsByProduct.${selectedProductId}.fetching`) !== false
      
      flows = _.get(flowsInfo, `flowIdsByProduct.${selectedProductId}.flowIds`, [])
    }
    let loading = productsFetching || (selectedProductId && flowsFetching)
    let loadingMessage = productsFetching ? "Fetching Products" : (
      selectedProductId && flowsFetching ? "Fetching Flows" : ""
    )

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
                      ...products.map(product => ({
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
                  <span style={styles.label}>Flow</span>
                  <MdRefresh style={styles.labelIcon} size={18} onClick={() => {
                    this.props.fetchFlows(selectedProductId)
                  }} />
                </div>
                <div style={styles.selectorParent} className="selectorParent">
                  <Dropdown
                    style={styles.dropdown}
                    // pointing='top right'
                    scrolling
                    placeholder='Select Flow'
                    options={[
                      { key: 'caption', text: 'Select Flow', disabled: true },
                      ...flows.map(flow => ({
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
    display: 'flex',
    justifyContent: 'center'
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
    fontWeight: '300'
  },
  cellValue: {
    wordBreak: 'break-all',
    fontWeight: '300',
    border: '0px',
    paddingTop: '0px'
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
  authInfoIcon: {
    marginLeft: '5px',
    height: 'unset',
    width: '17px',
    display: 'flex',
    color: 'black'
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
    domainsInfo: state.domainsInfo,
    invocablesInfo: state.invocablesInfo,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(InvocableNodeOptionsView)
