/** @jsx jsx */
import { 
  Component 
} from 'react'
import _ from 'lodash'
import * as React from 'react'
import { mapValues } from 'lodash'
import { jsx } from '@emotion/core'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { ToastsStore } from 'react-toasts'
import { bindActionCreators } from 'redux'
import { FlowChart } from "@mrblenny/react-flow-chart"
import * as actions from '@mrblenny/react-flow-chart/src/container/actions'

import { MdCode } from "react-icons/md"
import { AiOutlineFork, AiOutlineWarning, AiOutlineQuestionCircle } from "react-icons/ai"
import { TiFlowChildren } from "react-icons/ti"
import { IoMdEye, IoMdEyeOff } from "react-icons/io"
import { Table, Modal, Checkbox } from 'semantic-ui-react'

import * as utils from '../../../../lib/utils'
import { ActionCreators } from '../../../../actions'
import { SidebarItem } from './components/SidebarItem'
import InvocableNodeOptionsView from './components/InvocableNodeOptionsView'
import SubflowNodeOptionsView from './components/SubflowNodeOptionsView'
import SimpleBackdrop from '../DomainsView/components/Backdrop'
import constants from '../../../../constants'
import Api from '../../../../lib/api'

const CanvasOuterCustom = styled.div`
  position: relative;
  background-size: 10px 10px;
  // background-color: #4f6791;
  background-color: rgb(240, 242, 246);
  // background-color: white;
  // background-image:
  //   linear-gradient(90deg, rgb(240, 242, 244) 1px,transparent 0),
  //   linear-gradient(180deg, rgb(240, 242, 244) 1px,transparent 0);
  width: 100%;
  height: 100%;
  overflow: hidden;
  cursor: not-allowed;
`

const PortCustom = (props: IPortDefaultProps) => {
  // console.log("props", props)
  return (
    <div style={{
      ...styles.customPort,
      ...(
        props.port.type === 'left' ? styles.customPortLeft : styles.customPortRight
      )}}>
    </div>
  )
}


class Flow extends Component {

  constructor(props) {
    super(props)

    this.state = {
      fetchingStatus: false,
      statusModalOpen: false,
      statusJson: {},
    }
  }

  componentDidMount() {
    const { flowsInfo, flowId, productId, productsInfo } = this.props

    const product = productsInfo.products[productId]
    if (!product || !product.api_key_value) {
      this.props.fetchSingleProduct(productId)
    }
    
    this.props.fetchSingleProductSettings(productId)
    
    if ((!flowsInfo.flowEnvsById[flowId]) || (
      flowsInfo.flowEnvsById[flowId].fetched === false && flowsInfo.flowEnvsById[flowId].fetching === false
    )) {
      this.props.fetchFlowEnvs(productId, flowId, envs => {
        if (envs.length > 0) {
          this.props.setFlowSelectedEnv(productId, flowId, '0')
        }
      })
    }
  }

  fetchStatus() {
    const { productId, flowId } = this.props
    const env = this.getSelectedFlowEnv()

    this.setState({ fetchingStatus: true, statusJson: {} })

    let flowStatusUrl = `${constants.BACKEND_URL}/products/${productId}/flows/${flowId}/envs/${env}/status`
    console.log("flowStatusUrl", flowStatusUrl)
    Api.get(flowStatusUrl).then(res => {
      this.setState({ statusModalOpen: true, statusJson: res, fetchingStatus: false })
    }).catch(({err, status}) => {
      this.setState({ statusModalOpen: false, statusJson: {}, fetchingStatus: false })
      ToastsStore.error(`Error while getting status - ${status} ${err.error || err.message || ''}`)
    })
  }

  getChart() {
    const { flowsInfo, flowId } = this.props
    let selectedFlowEnv = this.getSelectedFlowEnv()

    return _.get(flowsInfo, `flowEnvsById.${flowId}.flowJsonByEnvName.${selectedFlowEnv}.flowJson`, 
      utils.copyDict(constants.INITIAL_FLOW))
  }

  stateActions = mapValues(actions, (func: any) =>
    (...args: any) => {
      const { flowId } = this.props
      let selectedFlowEnv = this.getSelectedFlowEnv()
      let chart = this.getChart()

      chart = {
        ...chart, 
        ...func(...args)(chart)
      }
      this.props.setFlowJsonInfo(flowId, selectedFlowEnv, chart, {})
    })

  NodeInnerCustom = ({ node, config }) => {
    const chart = this.getChart()
    return (
      <div style={{
        ...styles.nodeInnerParent,
        ...((chart.selected.type === 'node' && chart.selected.id === node.id)
        ? styles.selectedNodeInnerParent
        : {})
      }}>
        <div style={styles.nodeInnerContent}>
          <div style={styles.nodeInnerIconParent}>
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
          </div>
          <span style={styles.nodeInnerSpan}> &nbsp;&nbsp;&nbsp;&nbsp;{node.properties && node.properties.name ? (
            `${node.type} - ${node.properties.name}`
          ) : node.type}&nbsp;&nbsp;&nbsp;&nbsp; </span>
        </div>
      </div>
    )
  }

  NodeCustom = React.forwardRef(({ node, children, ...otherProps }: INodeDefaultProps, ref: React.Ref<HTMLDivElement>) => {
    const chart = this.getChart()
    delete otherProps['isSelected']
    
    // console.log("children", children)
    return (
      <div ref={ref} {...otherProps} style={{
        ...styles.node,
        ...(
          otherProps.style ? otherProps.style : {}
        ),
        ...((chart.selected.type === 'node' && chart.selected.id === node.id)
        ? styles.nodeSelected
        : {})
      }}>
        {children}
      </div>
    )
  })

  getSelectedFlowEnv() {
    const { flowsInfo, flowId } = this.props

    if (flowsInfo.flowEnvsById[flowId] && 
      flowsInfo.flowEnvsById[flowId].envs &&
      flowsInfo.flowEnvsById[flowId].selectedEnv) {
      return flowsInfo.flowEnvsById[flowId].envs[
        flowsInfo.flowEnvsById[flowId].selectedEnv
      ]
    }

    return null
  }

  render() {
    const { flowsInfo, flowId, productId, productsInfo } = this.props
    const product = productsInfo.products[productId]
    const flow = flowsInfo.flowsById[flowId] && flowsInfo.flowsById[flowId].flow
    
    let productFetching = !product ? true : false
    let fetchingEnvs = false
    let fetchingFlowJson = true
    if ((!flowsInfo.flowEnvsById[flowId]) || (
      flowsInfo.flowEnvsById[flowId].fetched === false && flowsInfo.flowEnvsById[flowId].fetching
    )) {
      fetchingEnvs = true
    }
    let selectedFlowEnv = this.getSelectedFlowEnv()
    let chart = utils.copyDict(constants.INITIAL_FLOW)
    if (selectedFlowEnv) {
      if (_.get(flowsInfo, `flowEnvsById.${flowId}.flowJsonByEnvName.${selectedFlowEnv}.fetching`) === false) {
        fetchingFlowJson = false

        chart = this.getChart()
      }
    }
    let saving = false
    let savingMessage = ''
    if (_.get(flowsInfo, `flowEnvsById.${flowId}.flowJsonByEnvName.${selectedFlowEnv}.saving`) === true) {
      saving = true
      savingMessage = _.get(flowsInfo, `flowEnvsById.${flowId}.flowJsonByEnvName.${selectedFlowEnv}.savingMessage`)
    }
    
    console.log("this.state.statusJson", this.state.statusJson)
    return (
      <div style={styles.root}>

        <Modal size='large' open={this.state.statusModalOpen} onClose={() => {
          this.setState({ statusModalOpen: false })
        }}>
          <Modal.Header>Flow Status</Modal.Header>
          <Modal.Content>
            <div style={styles.content}>
              <div>
                <table style={styles.statusTable1}>
                  <tbody>
                    <tr>
                      <td>Flow Trigger URL(s)</td>
                      <td>:</td>
                      <td>
                        {_.get(this.state.statusJson, 'flow_details.flow_trigger_urls', []).map(url => {
                          return <div>{url}</div>
                        })}
                      </td>
                    </tr>
                    {_.get(this.state.statusJson, 'flow_details.login_url', '') &&
                      <tr>
                        <td>Login URL</td>
                        <td>:</td>
                        <td>
                          <div>{_.get(this.state.statusJson, 'flow_details.login_url', '')}</div>
                        </td>
                      </tr>
                    }
                    <tr>
                      <td>API Key</td>
                      <td>:</td>
                      <td>
                        {!this.state.apiKeyOpen ? (
                        <div>
                          •••••••••••••••••••••••••••••••••••••
                          <IoMdEye style={styles.eyeIcon} size="23" color={constants.ACCENT_COLOR} onClick={() => {
                            this.setState({apiKeyOpen: true})
                          }} />
                        </div>
                      ) : (
                        <div>
                          {product && product.api_key_value ? product.api_key_value : ""}
                          <IoMdEyeOff style={styles.eyeIcon} size="23" color={constants.ACCENT_COLOR} onClick={() => {
                            this.setState({apiKeyOpen: false})
                          }} />
                        </div>
                      )}
                      </td>
                    </tr>
                    {/* <tr>
                      <td>Namespace</td>
                      <td>:</td>
                      <td>{_.get(this.state.statusJson, 'flow_details.namespace')}</td>
                    </tr> */}
                    <tr>
                      <td>Flow Traces</td>
                      <td>:</td>
                      <td>
                        <a href={_.get(this.state.statusJson, 'flow_details.traces_link')}
                        rel="noopener noreferrer" target='_blank'>Check traces here</a>
                      </td>
                    </tr>
                    <tr>
                      <td>Flow Logs</td>
                      <td>:</td>
                      <td>
                        <a href={_.get(this.state.statusJson, 'flow_details.logs_link')} 
                        rel="noopener noreferrer" target='_blank'>Check logs here</a>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <table style={styles.statusTable2}>
                  <thead>
                    <tr style={styles.statusTable2Header}>
                      <th style={styles.statusTable2Td}>Node</th>
                      <th style={styles.statusTable2Td}>Private URL</th>
                      <th style={styles.statusTable2Td}>Public URL</th>
                      <th style={styles.statusTable2Td}>Last Update Time</th>
                      <th style={styles.statusTable2Td}>Image</th>
                      <th style={styles.statusTable2Td}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      _.get(this.state.statusJson, 'services', []).map(serviceStatus => (
                        <tr key={JSON.stringify(serviceStatus)}>
                          <td style={styles.statusTable2Td}>{serviceStatus.node_name}</td>
                          <td style={styles.statusTable2Td}>{serviceStatus.private_url}</td>
                          <td style={styles.statusTable2Td}>{serviceStatus.public_url ? serviceStatus.public_url : ""}</td>
                          <td style={styles.statusTable2Td}>{utils.convertTimestampToString(serviceStatus.lastUpdateTime)}</td>
                          <td style={styles.statusTable2Td}>{serviceStatus.image}</td>
                          <td style={{
                            ...styles.statusTable2StatusTd,
                            ...(serviceStatus.status === 'True' || serviceStatus.status === true
                            ? styles.statusTable2StatusTdTrue : styles.statusTable2StatusTdFalse)
                          }}>{
                            serviceStatus.status === 'True' || serviceStatus.status === true
                            ? 'Up' : 'Down'
                          }</td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </Modal.Content>
        </Modal>
        <SimpleBackdrop open={fetchingEnvs || fetchingFlowJson || productFetching || saving || this.state.fetchingStatus} label={
          fetchingEnvs ? 'Fetching Flow Environments' : (
            fetchingFlowJson ? 'Fetching Flow Json and Config' : (
              productFetching ? 'Fetching Product' : (
                saving ? savingMessage : (
                  this.state.fetchingStatus ? 'Fetching Flow Status' : ''
                )
              )
            )
          )
        }/>

        {
          !selectedFlowEnv
          ? <div style={styles.selectEnvMessage}> Select Flow Environment </div>
          : (
            fetchingFlowJson ? (
              <div style={styles.selectEnvMessage}></div>
            ) : (
              <div style={styles.pageParent}>
                <div style={styles.page}>
                  <div style={styles.sideBar}>
                    
                    <div style={styles.sideBarSection}>
                      <div style={styles.message}>
                        <span style={styles.palettleTitle}>Flow Info</span>

                        <div style={styles.infoContainer}>
                          <Table basic='very'>
                            <Table.Body>
                              <Table.Row>
                                <Table.Cell style={styles.cellKey}>Name</Table.Cell>
                                <Table.Cell style={styles.cellValue}> { flow && flow.name } </Table.Cell>
                              </Table.Row>
                              <Table.Row>
                                <Table.Cell style={styles.cellKey}> Git Repo </Table.Cell>
                                <Table.Cell style={styles.cellValue}>
                                  <a 
                                    target='_blank' 
                                    rel="noopener noreferrer"
                                    href={ product && product.repo } > {
                                    product && product.repo
                                  } </a>
                                </Table.Cell>
                              </Table.Row>
                              <Table.Row>
                                <Table.Cell style={styles.cellKey}>Status</Table.Cell>
                                <Table.Cell style={styles.cellValue}>
                                  <div css={styles.viewStatusButton} onClick={() => {
                                    this.fetchStatus()
                                  }}>
                                    View
                                  </div>
                                </Table.Cell>
                              </Table.Row>
                              <Table.Row>
                                <Table.Cell style={styles.cellKey}>Auth Enabled</Table.Cell>
                                <Table.Cell style={styles.cellValue}>
                                  
                                    {!product || !product.settings || !product.settings.auth0_integration_enabled ?
                                      <div style={styles.auth0EnableContainer}>
                                        <Checkbox toggle disabled/>
                                        Auth integration not done for this product
                                      </div>
                                    :
                                      <div style={styles.auth0EnableContainer}>
                                        <Checkbox 
                                          toggle
                                          checked={chart && chart.auth_enabled}
                                          onClick={() => {
                                            if(!chart.auth_enabled)
                                              chart.auth_enabled = true  
                                            else
                                              chart.auth_enabled = !chart.auth_enabled
                                            this.setState({auth0EnableClicked: !this.state.auth0EnableClicked})
                                          }}
                                        />
                                      Secures all nodes with public endpoint
                                    </div>
                                  }
                                </Table.Cell>
                              </Table.Row>
                            </Table.Body>
                          </Table>
                        </div>

                      </div>
                      
                    </div>

                    <div style={styles.sideBarSection}>
                      <div style={styles.message}>
                        <div style={styles.palettleTitleContainer}>
                          <span style={styles.palettleTitle}> Palette </span>
                          <a style={styles.paletteInfoLink} href={constants.NODES_WIKI_LINK} target="_blank" rel="noopener noreferrer">
                            <AiOutlineQuestionCircle style={styles.paletteInfoIcon}></AiOutlineQuestionCircle>
                          </a>
                        </div>
                        <span style={styles.italic}>Drag and drop these items onto the canvas.</span>
                      </div>
                      
                      <SidebarItem
                        type="Task"
                        ports={ { port1: { id: 'port1', type: 'left', }, port2: { id: 'port2', type: 'right', }, }}
                      />

                      <SidebarItem
                        type="Split"
                        ports={ { port1: { id: 'port1', type: 'left', }, port2: { id: 'port2', type: 'right', }, }}
                      />

                      <SidebarItem
                        type="Join"
                        ports={ { port1: { id: 'port1', type: 'left', }, port2: { id: 'port2', type: 'right', }, }}
                      />

                      <SidebarItem
                        type="Subflow"
                        ports={ { port1: { id: 'port1', type: 'left', }, port2: { id: 'port2', type: 'right', }, }}
                      />
                      
                      <SidebarItem
                        type="CatchAll"
                        ports={ { port2: { id: 'port2', type: 'right', }, }}
                      />

                    </div>
                    
                  </div>
                  <div style={styles.flowChartParent}>
                    <FlowChart
                      chart={chart}
                      style={styles.flowChart}
                      callbacks={this.stateActions} 
                      Components={{
                        NodeInner: this.NodeInnerCustom,
                        Node: this.NodeCustom,
                        CanvasOuter: CanvasOuterCustom,
                        Port: PortCustom,
                        Link: (props) => {
                          const { startPos, endPos, link, isSelected, isHovered } = props                          
                          
                          // let paths = []
                          let points = []
                          let c1 = utils.copyDict(startPos)
                          let c2 = utils.copyDict(endPos) 
                          let sign = c2.y > c1.y ? 1 : -1

                          if (startPos.x > endPos.x) {
                            let xDiff = 10 + Math.min(10, 0.1 * Math.abs(c1.x - c2.x))
                            let yDiff = 15
                            let yCorrection = sign * (c2.y - c1.y) < 200 ? 7 : 0
                            let a1 = utils.copyDict(c1)
                            let a2 = { x: a1.x + xDiff, y: a1.y }
                            let a3 = { x: a2.x + xDiff, y: a2.y + sign * yCorrection }
                            let a4 = { x: a3.x, y: a2.y + sign * yDiff }
                            let a5 = { x: a4.x, y: a4.y + sign * yDiff }
                            let a6 = { x: (c1.x + c2.x) / 2, y: (c1.y + c2.y) / 2, }
                            let b1 = utils.copyDict(c2)
                            let b2 = { x: b1.x - xDiff, y: b1.y }
                            let b3 = { x: b2.x - xDiff, y: b2.y - sign * yDiff, }
                            let b4 = { x: b3.x, y: b3.y - sign * yDiff + sign * yCorrection, }
                            
                            points = [a1, a2, a3, a4, a5, a6, b4, b3, b2, b1]
                          } else {
                            let xOffset = Math.min(75, .6 * Math.abs(c1.x - c2.x) + .4 * Math.abs(c1.y - c2.y))

                            let a1 = utils.copyDict(c1)
                            let a2 = { x: a1.x + xOffset, y: a1.y}

                            let b1 = utils.copyDict(c2)
                            let b2 = { x: b1.x - xOffset, y: b1.y}


                            points = [a1, a2, b2, b1]
                          }
                          
                          return (
                            <svg 
                              style={{
                                overflow: 'visible', 
                                position: 'absolute',
                                cursor: 'pointer', 
                                left: '0px', 
                                right: '0px'
                              }} 
                              onClick={(e) => {
                                this.stateActions.onLinkClick({ linkId: link.id })
                                e.stopPropagation()
                              }}
                              onMouseEnter={(e) => {
                                this.stateActions.onLinkMouseEnter({ linkId: link.id })
                                e.stopPropagation()
                              }}
                              onMouseLeave={(e) => {
                                this.stateActions.onLinkMouseLeave({ linkId: link.id })
                                e.stopPropagation()
                              }}
                            >
                              {
                                points.length === 10 
                                ? (
                                  <path d={`M ${points[0].x} ${points[0].y} C ${points[1].x} ${points[1].y} ${points[2].x} ${points[2].y} ${points[3].x} ${points[3].y}
                                    S ${points[4].x} ${points[4].y} ${points[5].x} ${points[5].y}
                                    S ${points[6].x} ${points[6].y} ${points[7].x} ${points[7].y}
                                    S ${points[8].x} ${points[8].y} ${points[9].x} ${points[9].y}
                                  `} stroke="cornflowerblue" strokeWidth="3" fill="none" /> 
                                )
                                : (
                                  points.length === 4
                                  ? (
                                    <path d={`M ${points[0].x} ${points[0].y} C ${points[1].x} ${points[1].y} ${points[2].x} ${points[2].y} ${points[3].x} ${points[3].y}
                                    `} stroke="cornflowerblue" strokeWidth="3" fill="none" /> 
                                  ) : null
                                )
                              }
                              {/* {
                                points.map(({x, y}) => (
                                  <circle cx={`${x}`} cy={`${y}`} r="5" stroke="black" fill="black" />
                                ))
                              } */}
                              {
                                isSelected || isHovered
                                ? (
                                  (points.length === 10 && <path d={`M ${points[0].x} ${points[0].y} C ${points[1].x} ${points[1].y} ${points[2].x} ${points[2].y} ${points[3].x} ${points[3].y}
                                    S ${points[4].x} ${points[4].y} ${points[5].x} ${points[5].y}
                                    S ${points[6].x} ${points[6].y} ${points[7].x} ${points[7].y}
                                    S ${points[8].x} ${points[8].y} ${points[9].x} ${points[9].y}
                                  `} stroke="cornflowerblue" opacity="0.15" strokeWidth="18" fill="none" />)
                                  || (points.length === 4 && <path d={`M ${points[0].x} ${points[0].y} C ${points[1].x} ${points[1].y} ${points[2].x} ${points[2].y} ${points[3].x} ${points[3].y}
                                  `} stroke="cornflowerblue" opacity="0.15" strokeWidth="18" fill="none" />) || null
                                )
                                : (
                                  (points.length === 10 && <path d={`M ${points[0].x} ${points[0].y} C ${points[1].x} ${points[1].y} ${points[2].x} ${points[2].y} ${points[3].x} ${points[3].y}
                                    S ${points[4].x} ${points[4].y} ${points[5].x} ${points[5].y}
                                    S ${points[6].x} ${points[6].y} ${points[7].x} ${points[7].y}
                                    S ${points[8].x} ${points[8].y} ${points[9].x} ${points[9].y}
                                  `} stroke="cornflowerblue" opacity="0.001" strokeWidth="18" fill="none" />)
                                  || (points.length === 4 && <path d={`M ${points[0].x} ${points[0].y} C ${points[1].x} ${points[1].y} ${points[2].x} ${points[2].y} ${points[3].x} ${points[3].y}
                                  `} stroke="cornflowerblue" opacity="0.001" strokeWidth="18" fill="none" />) || null
                                )
                              }
                            </svg>
                          )
                        },
                      }}
                    />
                  </div>
                </div>

                {
                  (Object.keys(chart.selected).length > 0 && chart.selected.type === 'node') && chart.nodes[chart.selected.id].type === "Subflow" ?
                    <SubflowNodeOptionsView 
                      node={
                        (Object.keys(chart.selected).length > 0 && chart.selected.type === 'node')
                        ? chart.nodes[chart.selected.id]
                        : null
                      }
                      pathMatchProp={this.props.pathMatchProp}
                      onNodeChange={node => {
                        this.props.setFlowJsonInfo(flowId, selectedFlowEnv, chart, {})
                      }}
                    />
                    :
                    <InvocableNodeOptionsView 
                      node={
                        (Object.keys(chart.selected).length > 0 && chart.selected.type === 'node')
                        ? chart.nodes[chart.selected.id]
                        : null
                      }
                      pathMatchProp={this.props.pathMatchProp}
                      onNodeChange={node => {
                        this.props.setFlowJsonInfo(flowId, selectedFlowEnv, chart, {})
                      }}
                    />
                }
              </div>
            )
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
    maxHeight: '100%',
    // position: 'relative',
  },
  selectEnvMessage: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'rgb(200, 200, 200)',
  },
  pageParent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '100%',
    position: 'relative',
  },
  page: {
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
    maxWidth: 'calc(100vw - 90px)',
    maxHeight: '100vh',
  },
  node: {
    position: 'absolute',
    background: 'white',
    transition: 'border 0.3s ease 0s, margin-top 0.3s ease 0s, box-shadow 0.3s ease 0s, margin-top 0.3s ease 0s',
    // borderRadius: '0 5px 0 5px',
    borderRadius: 5,
    boxShadow: '0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 1px 3px 0px rgba(0,0,0,.12)',
  },
  nodeSelected: {
    // boxShadow: '0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22)',
    // boxShadow: '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)',
    borderRadius: 5,
    // borderRadius: '0 5px 0 5px',
    boxShadow: 'none',
  },
  nodeInnerParent: {
    border: '3px solid rgba(0, 0, 0, 0)',
    // borderRadius: '0 5px 0 5px',
    borderRadius: 5,
    transition: 'border 0.3s ease 0s, margin-top 0.3s ease 0s, box-shadow 0.3s ease 0s, margin-top 0.3s ease 0s',
  },
  selectedNodeInnerParent: {
    border: '3px solid rgb(103, 151, 234)',
    // borderRadius: '0 5px 0 5px',
    borderRadius: 5,
    transition: 'border 0.3s ease 0s, margin-top 0.3s ease 0s, box-shadow 0.3s ease 0s, margin-top 0.3s ease 0s',
  },
  nodeInnerContent: {
    padding: 5,
    background: 'white',
    borderRadius: 5,
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
  },
  nodeInnerIconParent: {
    borderRight: '1px solid rgb(230, 230, 230)',
    padding: 5,
    paddingRight: 10,
    paddingLeft: 7,
  },
  nodeInnerSpan: {
  },
  port: {
    height: 30,
    width: 30,
    background: 'white',
    borderRadius: 15,
    border: '3px solid rgb(103, 151, 234)',
  },
  customPort: {
    width: 18,
    height: 18,
    borderRadius: 9,
    // borderRadius: 10,
    // border: '1px solid cornflowerblue',
    border: '3px solid cornflowerblue',
    background: 'white',
    // border: '1px solid rgb(220, 220, 220)',
    // background: 'rgb(200, 200, 200)',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  customPortLeft: {
    // transform: 'translate(3px, 3px)',
    transform: 'translate(3px)',
  },
  customPortRight: {
    // transform: 'translate(-3px, -3px)',
    transform: 'translate(-3px)',
  },
  message: {
    // marginBottom: 5,
    textAlign: 'left',
    // marginBottom: 20,
    display: 'flex',
    flexDirection: 'column',
  },
  palettleTitle: {
    fontSize: 18,
    fontWeight: '300',
  },
  italic: {
    fontSize: 13,
    color: 'grey',
    fontWeight: '300',
  },
  flowChartParent: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'hidden',
  },
  sideBar: {
    width: 250,
    height: 'calc(100% - 70px)',
    background: 'white',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    paddingTop: 10,
    borderRight: '1px solid rgb(227, 229, 231)',
    // borderRight: '3px solid rgb(104, 152, 233)',
    overflowY: 'auto',
  },
  sideBarSection: {
    display: 'flex',
    flexDirection: 'column',
    padding: 15,
  },
  splitIcon: {
    transform: 'rotate(90deg)',
  },
  joinIcon: {
    transform: 'rotate(-90deg)',
  },
  infoContainer: {
    marginTop: 15,
    display: 'flex',
  },
  infoKeyContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  infoValueContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  infoKey: {
    fontWeight: '300',
    color: 'grey',
    // width: 50,
    textAlign: 'right',
    marginRight: 10,
    height: 21,
  },
  infoValue: {
    display: 'flex',
    alignItems: 'center',
    height: 21,
  },
  infoGrow: {
    flex: 1,
    height: 21,
  },
  infoValue2: {
    display: 'flex',
    alignItems: 'center',
    height: 21,
  },
  deploymentStatus: {
    marginRight: 10,
  },
  cellKey: {
    color: 'grey',
    fontWeight: '300',
    verticalAlign: 'middle'
  },
  cellValue: {
    wordBreak: 'break-all',
    fontWeight: '300',
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    padding: 20,
  },
  viewStatusButton: {
    color: '#007bff',
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'underline',
    }
  },
  statusTable1: {
    borderCollapse: 'separate',
    borderSpacing: 10,
    // padding: 5,
  },
  statusTable2: {
    borderCollapse: 'separate',
    borderSpacing: 5,
    padding: '5px 12px',
    background: 'rgb(245, 247, 250)',
    marginTop: 10,
    borderRadius: 5,
  },
  statusTable2Header: {
    textAlign: 'center',
  },
  statusTable2Td: {
    padding: 5,
  },
  statusTable2StatusTd: {
    textAlign: 'center',
    color: 'white',
    borderRadius: 5,
    padding: 5,
  },
  statusTable2StatusTdTrue: {
    background: 'green',
  },
  statusTable2StatusTdFalse: {
    background: 'firebrick',
    // background: 'crimson',
  },
  paletteInfoIcon: {
    marginLeft: '5px',
    height: 'unset',
    width: '17px',
    display: 'flex',
    color: 'black'
  },
  paletteInfoLink: {
    display: 'flex',
    color: 'black'
  },
  palettleTitleContainer: {
    display: 'flex',
    alignItems: 'stretch'
  },
  eyeIcon: {
    marginLeft: 10,
    cursor: 'pointer',
  },
  auth0EnableContainer: {
    display: "flex",
    flexDirection: "column",
    fontSize: "0.8em",
    wordBreak: "break-word"
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

export default connect(mapStateToProps, mapDispatchToProps)(Flow)
