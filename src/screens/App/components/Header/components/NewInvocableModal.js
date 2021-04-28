/** @jsx jsx */

import { Component, createRef } from "react";

import { jsx } from "@emotion/core";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { ToastsStore } from "react-toasts";

import StepZilla from "react-stepzilla";

import StepOne from "./StepOne.js";
import StepTwo from "./StepTwo.js";
import StepThree from "./StepThree.js";
import StepFour from "./StepFour.js";
import StepFive from "./StepFive.js";

import * as utils from "../../../../../lib/utils";
import "./stepzilla.css";
import { Modal, Button } from "semantic-ui-react";

import { ActionCreators } from "../../../../../actions";
import constants from "../../../../../constants";

import "ace-builds/webpack-resolver";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-textmate";

const INITIAL_STATE = {
  name: "",
  framework: "",
  path: "",
  repoName: "",
  invocationSchema: "{}",
  inputSchema: "{}",
  outputSchema: "{}",
  http_method: "POST",
  description: "",
  input_params: "",
  input_constraints: "",
  sample_input: "",
  output_params: "",
  sample_output: "",
  list_secret: "",
  get_secret: "",
  features: "",
  working: "",
  additional_comments: "",
  loading: false,
};

class NewInvocableModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ...utils.copyDict(INITIAL_STATE),
      fetchingStatus: false,
      repoExists: null,
      step: null,
    };
    this.hideElement = createRef();
    this.checkRepoStatus = this.checkRepoStatus.bind(this);
    this.setStep = this.setStep.bind(this);
    this.handleChangeRepoStatus = this.handleChangeRepoStatus.bind(this);
  }

  onClickCreate(domainId) {
    if (!this.state.loading && this.state.step === 5) {
      this.setState({ loading: true });

      if (!utils.isInputValidated(this.state)){
        this.setState({ loading: false });
        return;
      }

      if (!utils.isOutputValidated(this.state)){
        this.setState({ loading: false });
        return;
      }

      if (!utils.isJson(this.state.invocationSchema)) {
        this.setState({ loading: false });
        ToastsStore.error(`Invocation Config is not a valid json`);
        return;
      }
      
      this.props.createInvocable(
        domainId,
        {
          name: this.state.name,
          framework: this.state.framework,
          repo_name: this.state.repoName,
          path: this.state.path,
          http_method: this.state.http_method,
          invocable_definition_json: JSON.parse(this.state.invocationSchema),
          input_schema: JSON.parse(this.state.inputSchema),
          output_schema: JSON.parse(this.state.outputSchema),
          sample_input: this.state.sample_input === "" ? {} : JSON.parse(this.state.sample_input),
          sample_output: this.state.sample_output === "" ? {} : JSON.parse(this.state.sample_output),
          description: this.state.description,
          input_params: this.state.input_params,
          input_constraints: this.state.input_constraints,
          output_params: this.state.output_params,
          list_secret: this.state.list_secret,
          get_secret: this.state.get_secret,
          features: this.state.features,
          working: this.state.working,
          additional_comments: this.state.additional_comments,
        },
        (newInvocable) => {
          this.props.onClose && this.props.onClose();
          this.props.history.push(
            `/domains/${domainId}/invocables/${newInvocable.id}`
          );
          this.setState({
            ...utils.copyDict(INITIAL_STATE),
          });
        },
        () => {
          this.setState({ loading: false });
        }
      );
    }
  }

  checkRepoStatus() {
    this.setState({
      fetchingStatus: true,
    });

    this.props.doesRepoExists(
      this.state.repoName,
      this.state.framework,
      this.props.domainId,
      (repoExists) => {
        this.setState({
          fetchingStatus: false,
          repoExists,
        });
      },
      () => {
        this.setState({
          fetchingStatus: false,
          repoExists: "repo_doesnot_exit",
        });
      }
    );

  }

  httpOptions = constants.HTTP_METHOD_OPTIONS.map((http_method) => ({
    key: http_method,
    text: http_method,
    value: http_method,
  }));

  handleChange = (input) => (e) => {
    this.setState({ [input]: e.target.value });
  };

  handleChangeDropdown = (input) => (e, data) => {
    this.setState({ [input]: data.value });
  };

  handleChangeRepoStatus = () => (evt) => {
    this.setState({ repoExists: null, repoName: evt.target.value });
  };

  handleChangeAce = (input) => (e) => {
    this.setState({ [input]: e });
  };

  componentDidUpdate() {
    if (this.state.step === 5) {
      document
        .getElementById("next-button")
        .setAttribute("style", "display: block");
      document
        .getElementById("next-button")
        .setAttribute("loading", this.state.loading);
      document.getElementById("next-button").onclick = (e) => {
        this.onClickCreate(this.props.domainId);
      };
    }
  }

  setStep(step) {
    this.setState({ step: step });
  }

  render() {
    let props = this.props;
    const steps = [
      {
        name: "Basic Details",
        component: (
          <StepOne
            state={this.state}
            props={this.props}
            handleChange={this.handleChange}
            handleChangeDropdown={this.handleChangeDropdown}
            checkRepoStatus={this.checkRepoStatus}
            handleChangeRepoStatus={this.handleChangeRepoStatus}
            setStep={this.setStep}
            styles={styles}
          />
        ),
      },
      {
        name: "Input Schema",
        component: (
          <StepTwo
            state={this.state}
            handleChange={this.handleChange}
            handleChangeAce={this.handleChangeAce}
            setStep={this.setStep}
            styles={styles}
          />
        ),
      },
      {
        name: "Output Schema",
        component: (
          <StepThree
            state={this.state}
            handleChange={this.handleChange}
            handleChangeAce={this.handleChangeAce}
            setStep={this.setStep}
            styles={styles}
          />
        ),
      },
      {
        name: "Configuration",
        component: (
          <StepFour
            state={this.state}
            handleChange={this.handleChange}
            handleChangeAce={this.handleChangeAce}
            setStep={this.setStep}
            styles={styles}
          />
        ),
      },
      {
        name: "Additional Details",
        component: (
          <StepFive
            state={this.state}
            handleChange={this.handleChange}
            setStep={this.setStep}
            styles={styles}
          />
        ),
      },
    ];

    return (
      <Modal
        open={props.open}
        onClose={() => {
          this.props.onClose && this.props.onClose();
        }}
      >
        <Modal.Header>
          New Invocable
          <Button
            aria-label="Close"
            className=" pr-2"
            style={{
              background: "none",
              position: "absolute",
              top: 4,
              right: 5,
              fontWeight: 800,
              fontSize: 20,
              color: "#E72800",
            }}
            data-dismiss="modal"
            type="button"
            onClick={() => this.props.onClose && this.props.onClose()}
          >
            ✕
          </Button>
        </Modal.Header>
        <Modal.Content>
          <div
            style={{
              ...styles.content,
              ...{
                maxHeight: window.innerHeight - 150,
              },
            }}
          >
            <div className="step-progress">
              <StepZilla
                steps={steps}
                preventEnterSubmission={true}
                nextButtonText={
                  this.state.step === 5
                    ? this.state.loading === true
                      ? "Loading... "
                      : "Create"
                    : "Next"
                }
                stepsNavigation={false}
              />
            </div>
          </div>
        </Modal.Content>
      </Modal>
    );
  }
}

const styles = {
  content: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "auto",
    padding: 15,
    paddingBottom: 5,
    maxHeight: 600,
  },
  inputParent: {
    display: "flex",
    marginBottom: 10,
  },
  labelParent: {
    display: "flex",
    alignItems: "center",
  },
  label: {
    flex: 1,
    marginRight: 10,
    width: 150,
    textAlign: "right",
  },
  disclaimer: {
    flex: 1,
    marginRight: 10,
    textAlign: "left",
    fontSize: "10px",
    padding: "10px",
  },
  value: {
    flex: 1,
    textAlign: "left",
  },
  textField: {
    width: 200,
    height: 45,
    fontFamily: "inherit",
    fontSize: 14,
    marginRight: 10,
  },
  textArea: {
    padding: 7,
    width: 500,
    maxHeight: 200,
    minHeight: 50,
    minWidth: 500,
    resize: "both",
    overflow: "auto",
    borderRadius: 3,
    border: "0.1px solid rgb(230, 232, 235)",
    marginTop: 5,
    marginBottom: 5,
    outlineColor: "#85b7d9",
  },
  selectorParent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: 5,
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: "rgb(230, 232, 236)",
    borderRadius: 4,
    width: 200,
    height: 45,
  },
  selectorParent2: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: 5,
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: "rgb(230, 232, 236)",
    borderRadius: 4,
    width: 100,
    marginRight: 10,
    height: 45,
  },
  dropdown: {
    height: "100%",
    width: "100%",
    display: "flex",
    alignItems: "center",
  },
  grow: {
    width: "100%",
    flex: 1,
  },
  buttonParent: {
    padding: 10,
    width: "100%",
    display: "flex",
    justifyContent: "flex-end",
  },
  horizontal: {
    display: "flex",
    alignItems: "center",
  },
  infoValue2: {
    display: "flex",
    alignItems: "center",
    height: 21,
  },
  infoContainer: {
    display: "flex",
    justifyContent: "flex-end",
    paddingBottom: "5px",
  },
  infoParent: {
    marginTop: 10,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    backgroundColor: "rgb(240, 242, 245)",
    borderRadius: 5,
  },
  infoItem: {
    marginRight: 5,
  },
  aceParent: {
    width: 500,
    maxHeight: 200,
    minHeight: 50,
    minWidth: 500,
    resize: "both",
    overflow: "auto",
    borderRadius: 3,
    border: "0.1px solid rgb(230, 232, 235)",
    marginTop: 5,
    marginBottom: 5,
    outlineColor: "#85b7d9",
  },
  ace: {
    width: "100%"
  },
  option: {
    fontSize: 20,
    color: "#2185D0",
    marginBottom: "8px",
  },
  optionLineRight: {
    borderTop: "1px solid #a9a9a9",
    marginTop: 14,
    marginRight: "5%",
    marginLeft: "1%",
    width: "40%",
  },
  optionLineLeft: {
    borderTop: "1px solid #a9a9a9",
    marginTop: 14,
    marginLeft: "5%",
    marginRight: "1%",
    width: "40%",
  }
};

function mapDispatchToProps(dispatch) {
  return { ...bindActionCreators(ActionCreators, dispatch), dispatch };
}

function mapStateToProps(state) {
  return {
    loginInfo: state.loginInfo,
    domainsInfo: state.domainsInfo,
    invocablesInfo: state.invocablesInfo,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(NewInvocableModal);
