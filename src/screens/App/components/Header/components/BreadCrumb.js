/** @jsx jsx */
import { 
  Component 
} from 'react'
import { jsx } from '@emotion/core'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { MdKeyboardArrowRight } from "react-icons/md"
import { ActionCreators } from '../../../../../actions'

class SimpleBreadCrumbs extends Component {

  render() {
    let domainsInfo = this.props.domainsInfo
    let productsInfo = this.props.productsInfo
    let invocablesInfo = this.props.invocablesInfo
    let flowsInfo = this.props.flowsInfo
  
    let crumbs = this.props.crumbs

    const getOnSelectHandler = index => {
      return evt => {
        evt.preventDefault();
        if (this.props.onSelect && index < crumbs.length - 1) {
          if (index === 1) {
            index = 2
          }
          this.props.onSelect(index)
        }
      }
    }
  
    const getCrumbText = (crumb, index) => {
      if (index === 1) {
        if (crumbs[0] === 'domains') {
          return domainsInfo.domains[crumb] ? domainsInfo.domains[crumb].name : crumb
        } else if (crumbs[0] === 'products') {
          return productsInfo.products[crumb] ? productsInfo.products[crumb].name : crumb
        }
      }
      if (index === 3) {
        if (crumbs[0] === 'domains') {
          return invocablesInfo.invocablesById[crumb] && invocablesInfo.invocablesById[crumb].invocable
                  && invocablesInfo.invocablesById[crumb].invocable.name 
                  ? invocablesInfo.invocablesById[crumb].invocable.name : crumb
        } else if (crumbs[0] === 'products') {
          return flowsInfo.flowsById[crumb] && flowsInfo.flowsById[crumb].flow && 
                  flowsInfo.flowsById[crumb].flow.name 
                  ? flowsInfo.flowsById[crumb].flow.name : crumb
        }
      }
      return crumb
    }
  
    return (
      <div style={styles.breadCrumbParent}>
        {
          crumbs.map((crumb, index) => (
            <div style={styles.crumbItemParent} key={`${crumb}-${index}`}>
              <span color="inherit" onClick={getOnSelectHandler(index)} 
                key={`${crumb}-${index}`} style={styles.breadCrumb}>
                {getCrumbText(crumb, index)}
              </span>
  
              {
                index < crumbs.length - 1
                ? (
                  <MdKeyboardArrowRight color="rgb(80, 80, 80)" size={20}/>
                ) : null
              }
            </div>
          ))
        }
      </div>
    );
  }

}


const styles = {
  breadCrumbParent: {
    marginLeft: 5,
    display: 'flex',
    alignItems: 'center',
  },
  crumbItemParent: {
    display: 'flex',
    alignItems: 'center',
  },
  breadCrumb: {
    cursor: 'pointer',
    fontSize: 20,
    fontWeight: '300',
    color: 'black',
    marginLeft: 5,
    marginRight: 5,
  },
}

function mapDispatchToProps(dispatch) {
  return { ...bindActionCreators(ActionCreators, dispatch), dispatch }
}

function mapStateToProps(state) {
  return {
    flowsInfo: state.flowsInfo,
    domainsInfo: state.domainsInfo,
    invocablesInfo: state.invocablesInfo,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SimpleBreadCrumbs)
