/** @jsx jsx */
import { 
  Component 
} from 'react'
import { jsx } from '@emotion/core'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { ToastsStore } from 'react-toasts'
import { MdContentCopy } from "react-icons/md";

import {
  Modal, Button
} from 'semantic-ui-react'

import { ActionCreators } from '../../../../../actions'


class ApiKeyModal extends Component {

  constructor(props) {
    super(props)

    this.state = {
      name: '',
      repoName: '',
      loading: false,
      copySuccess: ''
    }
  }
  
  copyToClipboard = (e) => {
    this.textArea.select();
    document.execCommand('copy');
    // This is just personal preference.
    // I prefer to not show the the whole text area selected.
    e.target.focus();
    this.setState({ copySuccess: 'Copied!' });
    ToastsStore.success('Copied!')
  };
  
  render() {
    let props = this.props;
    let product = this.props.productsInfo.products[this.props.productId]

    return (
      <Modal size='small' open={props.open} onClose={() => {
        this.props.onClose && this.props.onClose()
      }}>
        <Modal.Header>API Key</Modal.Header>
        <Modal.Description style={styles.modalDescription}>
          <a href="https://swagger.io/docs/specification/authentication/api-keys/" target="_blank" rel="noopener noreferrer">
            https://swagger.io/docs/specification/authentication/api-keys/ 
          </a>
        </Modal.Description>
        <Modal.Content>
          <div style={styles.content}>
            <textarea
              style={styles.textArea}
              ref={(textarea) => this.textArea = textarea}
              value={product && product.api_key_value ? product.api_key_value : ""}
            />
            {
            /* Logical shortcut for only displaying the button if the copy command exists */
            document.queryCommandSupported('copy') &&
              <div style={styles.copyButton}>
                <Button onClick={this.copyToClipboard}>
                  <MdContentCopy style={styles.copyIcon}></MdContentCopy> Copy
                </Button>
              </div>
            }
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
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'auto',
    padding: 20,
    maxHeight: 400,
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

export default connect(mapStateToProps, mapDispatchToProps)(ApiKeyModal)
