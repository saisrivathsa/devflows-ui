/** @jsx jsx */
import { 
  Component 
} from 'react'
import _ from 'lodash'
import { jsx } from '@emotion/core'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { IoIosInformationCircleOutline } from "react-icons/io"

import constants from '../../../../constants'
import * as utils from '../../../../lib/utils'
import SimpleBackdrop from '../DomainsView/components/Backdrop'

import { ActionCreators } from '../../../../actions'

import AceEditor from "react-ace"
import 'ace-builds/webpack-resolver'
import "ace-builds/src-noconflict/mode-javascript"
import "ace-builds/src-noconflict/theme-textmate"


class InvocableView extends Component {

  constructor(props) {
    super(props)

    this.state = {}
  }

  componentDidMount() {
    const domainId = this.props.domainId
    const invocableId = this.props.invocableId

    const domain = this.props.domainsInfo.domains[domainId]
    const invocable = this.props.invocablesInfo.invocablesById[invocableId] && 
                      this.props.invocablesInfo.invocablesById[invocableId].invocable

    if (!domain) {
      this.props.fetchSingleDomain(domainId)
    }
    if (!invocable) {
      this.props.fetchSingleInvocable(domainId, invocableId)
    }
  }

  httpOptions = constants.HTTP_METHOD_OPTIONS.map(http_method => ({
    key: http_method, text: http_method, value: http_method
  }))

  getInvocableSectionDataMap(invocable){
    var invocableSectionDataMap = {}
    for (var key in invocable) {
      var section
      console.log(key, constants.INVOCABLE_CONFIG["FIELDS"][key])
      if(constants.INVOCABLE_CONFIG["FIELDS"][key])
        section = constants.INVOCABLE_CONFIG["FIELDS"][key]["section"]
      else
        section = 'Basic details'
 
      invocableSectionDataMap[section] = invocableSectionDataMap[section] || {}
      invocableSectionDataMap[section][key] = invocable[key]
    }
    return invocableSectionDataMap
  }

  render() {
    const domainId = this.props.domainId
    const invocableId = this.props.invocableId

    const domain = this.props.domainsInfo.domains[domainId]
    const invocable = this.props.invocablesInfo.invocablesById[invocableId] && 
                      this.props.invocablesInfo.invocablesById[invocableId].invocable
    
    console.log("this.props.invocablesInfo.invocablesById[invocableId]", this.props.invocablesInfo.invocablesById[invocableId])
    let domainFetching = domain ? false : true
    let invocableFetching = (this.props.invocablesInfo.invocablesById[invocableId]
                            && this.props.invocablesInfo.invocablesById[invocableId].fetching === true)
    let invocableSaving = (this.props.invocablesInfo.invocablesById[invocableId]
                              && this.props.invocablesInfo.invocablesById[invocableId].saving === true)
    let invocableSavingMessage = (this.props.invocablesInfo.invocablesById[invocableId]
                                && this.props.invocablesInfo.invocablesById[invocableId].savingMessage)
    if (invocable) {
      delete invocable['message']
    }          
    if (invocable) {
      if (invocable['sample_input'] === "\"{}\"") {
        invocable['sample_input'] = "{}"
      }
      if (invocable['sample_output'] === "\"{}\"") {
        invocable['sample_output'] = "{}"
      }
    }

    var invocableSectionDataMap = this.getInvocableSectionDataMap(invocable)

    return (
      <div style={styles.root}>
        <SimpleBackdrop open={domainFetching || invocableFetching || invocableSaving} label={
          invocableFetching ? 'Fetching Invocable' : (
            domainFetching ? 'Fetching Domain' : (
              invocableSaving ? invocableSavingMessage : ''
            )
          )
        }/>
        {
          invocable && constants.INVOCABLE_CONFIG['SECTIONS'].map(section => (
            <div>
              <div style={styles.sectionName}>{section}</div>
              {
                Object.keys(invocableSectionDataMap[section]).map(key => (
                <div style={styles.container} key={key}>
                  <div style={styles.key}>{(key in constants.INVOCABLE_CONFIG['FIELDS'] && constants.INVOCABLE_CONFIG['FIELDS'][key]['displayName'])?
                    constants.INVOCABLE_CONFIG['FIELDS'][key]['required'] ? 
                      <span>{constants.INVOCABLE_CONFIG['FIELDS'][key]['displayName']}<sup>*</sup></span> 
                    : 
                      constants.INVOCABLE_CONFIG['FIELDS'][key]['displayName']
                  :
                    (key)}
                  </div>
                  
                  {
                    (constants.INVOCABLE_CONFIG["JSON_INPUT_FIELDS"].includes(key))
                    ? (
                      <div style={styles.aceParent}>
                        <AceEditor
                          style={styles.ace}
                          maxLines={Infinity}
                          mode="javascript"
                          theme="textmate"
                          onChange={evt => {
                            invocable[key] = evt
                            this.props.setSingleInvocableInfo(domainId, invocable)
                          }}
                          name="UNIQUE_ID_OF_DIV"
                          value={_.get(invocable, key, '{}')}
                        />
                      </div>
                    ) : (key in constants.INVOCABLE_CONFIG['FIELDS'] && constants.INVOCABLE_CONFIG['FIELDS'][key]['displayName'])
                        ? (
                          <textarea style={styles.textArea} 
                            value={_.get(invocable, key, '')}
                            placeholder={constants.INVOCABLE_CONFIG['FIELDS'][key]['placeholder']}
                            onChange={evt => {
                              invocable[key] = evt.target.value
                              this.props.setSingleInvocableInfo(domainId, invocable)
                            }}
                          />

                        ) : (
                          <div style={styles.value}>{
                            key === 'versions'
                            ? (
                              <pre style={styles.pre}>{utils.toString(invocable[key])}</pre>
                            ) : (
                              utils.isValidURL(utils.toString(invocable[key])) ?
                                <a href={utils.toString(invocable[key])} target="_blank" rel="noopener noreferrer">
                                  {utils.toString(invocable[key])}
                                </a>
                              :  
                                utils.toString(invocable[key])
                            )
                          }</div>
                        )
                  }
                </div>
            ))
            }
            </div>
          ))
        }
        <div style={styles.infoContainer}>
          <div style={styles.infoParent}>
            <IoIosInformationCircleOutline size='25' color='grey' style={styles.infoItem}/>
            <span style={styles.infoItem}> To create JSON Schema checkout </span>
            <a 
              href='https://jsonschema.net/' 
              target='_blank' rel="noopener noreferrer"
              style={styles.infoItem}
            > https://jsonschema.net/ </a>
          </div>
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
    padding: 10,
    paddingTop: 15,
    overflow: 'auto',
  },
  title: {
    textAlign: 'left',
    marginLeft: 20,
    marginTop: 20,
    fontSize: 25,
    fontWeight: '300',
    marginBottom: 10,
  },  
  container: {
    display: 'flex',
    alignItems: 'center',
    margin: 3,
  },
  key: {
    textAlign: 'right',
    color: 'grey',
    width: 200,
    minWidth: 200,
    marginLeft: 30,
    marginRight: 10,
    fontWeight: '300',
  },
  value: {
    textAlign: 'left',
    fontWeight: '300',
  },
  infoContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  infoParent: {
    marginTop: 10,
    marginLeft: 5,
    marginRight: 5,
    display: 'flex',
    // justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'rgb(240, 242, 245)',
    borderRadius: 5,
  },
  infoItem: {
    marginRight: 5,
  },
  dropdown: {
    height: '100%',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
  },
  selectorParent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: 'rgb(240, 242, 245)',
    borderRadius: 4,
    width: 100,
    height: 45,
    marginTop: 7,
  },
  textArea: {
    padding: "7px",
    width: 500,
    maxHeight: 500,
    minHeight: 50,
    maxWidth: window.innerWidth - 350,
    minWidth: 500,
    resize: 'both',
    overflow: 'auto',
    borderRadius: 3,
    border: '1px solid rgb(230, 232, 235)',
    marginTop: 5,
    marginBottom: 5,
    outlineColor: "#85b7d9"
  },
  pre: {
    backgroundColor: 'rgb(240, 242, 245)',
    border: 0,
    margin: 0,
  },
  aceParent: {
    width: 500,
    maxHeight: 500,
    minHeight: 50,
    maxWidth: window.innerWidth - 350,
    minWidth: 500,
    resize: 'both',
    overflow: 'auto',
    borderRadius: 3,
    border: '1px solid rgb(230, 232, 235)',
    marginTop: 5,
    marginBottom: 5,
    outlineColor: "#85b7d9"
  },
  ace: {
    width: '100%',
    height: '100%',
  },
  sectionName: {
    textAlign: "center",
    marginLeft: "50px",
    marginTop: "25px",
    marginBottom: "25px",
    fontSize: "17px",
    background: "#0000000d",
    padding: "3px",
    width: "130px",
    borderRadius: "5px"
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

export default connect(mapStateToProps, mapDispatchToProps)(InvocableView)
