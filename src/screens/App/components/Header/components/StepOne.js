import React, { Component } from "react";
import constants from "../../../../../constants";
import { Input, Dropdown, Loader } from "semantic-ui-react";

import styled from "styled-components";

import { MdRefresh } from "react-icons/md";

import { ToastsStore } from "react-toasts";

export default class StepOne extends Component {
  constructor(props) {
    super(props);
    this.styles = this.props.styles;
    this.isValidated = this.isValidated.bind(this);
  }
  isValidated() {
    if (this.props.state.name === "") {
      ToastsStore.error(`Invocable Name can't be empty.`);
      return false;
    }
    if (this.props.state.description === "") {
      ToastsStore.error(`Description can't be empty.`);
      return false;
    }
    if (this.props.state.path === "") {
      ToastsStore.error(`Path can't be empty.`);
      return false;
    }
    if (this.props.state.framework === "") {
      ToastsStore.error(`Framework can't be empty.`);
      return false;
    }
    if (this.props.state.repoName === "") {
      ToastsStore.error(`Repo name can't be empty.`);
      return false;
    }
    if (RegExp(/^(?![0-9]+$)(?!.*-$)(?!-)[a-zA-Z0-9-.]{1,40}$/).test(this.props.state.repoName) === false){
      ToastsStore.error(`Repo name should not have more than 40 characters.\n It should only contain alphanumeric characters, . and -. \n It can start and end with alphanumeric characters only.`);
      return false;
    }
    return true;
  }

  render() {
    this.handleChange = this.props.handleChange;
    this.handleChangeDropdown = this.props.handleChangeDropdown;
    this.handleChangeRepoStatus = this.props.handleChangeRepoStatus;
    this.checkRepoStatus = this.props.checkRepoStatus;
    if (!(this.props.state.step === 1)) this.props.setStep(1);
    const StyledLoader = styled(Loader)`
      &&&& {
        &:after {
          border-color: #767676 #ddd #ddd;
        }
      }
    `;
    let httpOptions = constants.HTTP_METHOD_OPTIONS.map((http_method) => ({
      key: http_method,
      text: http_method,
      value: http_method,
    }));
    let domainsInfo = this.props.props.domainsInfo;
    let domainId = this.props.props.domainId;
    let domain = domainsInfo.domains[domainId];
    return (
      <div>
        <div style={this.styles.inputParent}>
          <div style={this.styles.labelParent}>
            <span style={this.styles.label}>
              {" "}
              {domain ? "Domain" : "Domain Id"}{" "}
            </span>
          </div>

          <div style={this.styles.labelParent}>
            <span style={this.styles.value}>
              {" "}
              {domain ? domain.name : domainId}{" "}
            </span>
          </div>
        </div>

        <div style={this.styles.inputParent}>
          <div style={this.styles.labelParent}>
            <span style={this.styles.label}>
              Invocable Name<sup>*</sup>
            </span>
          </div>
          <Input
            size="small"
            style={this.styles.textField}
            placeholder="Enter Invocable Name"
            value={this.props.state.name}
            onChange={this.handleChange("name")}
          />
        </div>
        <div style={this.styles.inputParent}>
          <div style={this.styles.labelParent}>
            <span style={this.styles.label}>
              {constants.INVOCABLE_CONFIG['FIELDS']["description"]["displayName"]}<sup>*</sup>
            </span>
          </div>

          <textarea
            style={this.styles.textArea}
            placeholder={
              constants.INVOCABLE_CONFIG['FIELDS']["description"]["placeholder"]
            }
            value={this.props.state.description}
            onChange={this.handleChange("description")}
          />
        </div>
        <div style={this.styles.inputParent}>
          <div style={this.styles.labelParent}>
            <span style={this.styles.label}>
              Path<sup>*</sup>
            </span>
          </div>

          <div style={this.styles.selectorParent2}>
            <Dropdown
              style={this.styles.dropdown}
              scrolling
              placeholder="Select HTTP Method"
              options={httpOptions}
              multiple={false}
              value={this.props.state.http_method || "POST"}
              onChange={this.handleChangeDropdown("http_method")}
            />
          </div>

          <Input
            size="small"
            style={this.styles.textField}
            placeholder="Invocable Path"
            value={this.props.state.path}
            onChange={this.handleChange("path")}
          />
        </div>
        <div style={this.styles.inputParent}>
          <div style={this.styles.labelParent}>
            <span style={this.styles.label}>
              Framework<sup>*</sup>
            </span>
          </div>
          <div style={this.styles.selectorParent} className="selectorParent">
            <Dropdown
              style={this.styles.dropdown}
              scrolling
              placeholder="Select Framework"
              options={[
                { key: "caption", text: "Select Framework", disabled: true },
                ...constants.FRAMEWORKS.map((framework) => ({
                  key: framework,
                  text: framework,
                  value: framework,
                })),
              ]}
              multiple={false}
              value={this.props.state.framework}
              onChange={this.handleChangeDropdown("framework")}
            />
          </div>
        </div>

        <div style={this.styles.inputParent}>
          <div style={this.styles.labelParent}>
            <span style={this.styles.label}>
              Repo Name <sup>*</sup>
            </span>
          </div>
          <div style={this.styles.horizontal}>
            <Input
              size="small"
              style={this.styles.textField}
              placeholder="Enter Invocable Git Repo"
              value={this.props.state.repoName}
              onChange={this.handleChangeRepoStatus()}
            />
            {this.props.state.fetchingStatus === true ? (
              <div style={this.styles.infoValue2}>
                {" "}
                <StyledLoader active inline size="mini" />{" "}
              </div>
            ) : this.props.state.fetchingStatus === false ? (
              this.props.state.repoExists === null ? (
                <div style={this.styles.infoValue2}>
                  <MdRefresh
                    color="rgb(80, 80, 80)"
                    size={18}
                    onClick={(event) => {
                      this.checkRepoStatus();
                    }}
                  />
                </div>
              ) : this.props.state.repoExists === "repo_exists" ? (
                <div> Repo exists. Views will be added. </div>
              ) : (this.props.state.repoExists === "repo_doesnot_exit" ? (
                <div> Repo doesn't exist, will be created </div>
              ) : (
                <div> Repo is already created with another framework. Change the framework or choose different repo name.</div>
                )
              )
            ) : null}
          </div>
        </div>
      </div>
    );
  }
}
