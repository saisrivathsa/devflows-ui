import React, { Component } from "react";
import AceEditor from "react-ace";
import * as utils from "../../../../../lib/utils";
import constants from "../../../../../constants";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { Popup } from "semantic-ui-react";

export default class StepTwo extends Component {
  constructor(props) {
    super(props);
    this.styles = this.props.styles;
    this.isValidated = this.isValidated.bind(this);
  }

  isValidated() {
    if (!utils.isInputValidated(this.props.state)) {
      return false;
    }
    return true;
  }

  render() {
    this.handleChange = this.props.handleChange;
    this.handleChangeAce = this.props.handleChangeAce;

    if (!(this.props.state.step === 2)) this.props.setStep(2);
    return (
      <div>
        <div style={this.styles.inputParent}>
          <div style={this.styles.labelParent}>
            <span style={this.styles.label}>
              Input Json Schema<sup>*</sup>
              <Popup
                trigger={
                  <IoIosInformationCircleOutline
                    size="21"
                    color="grey"
                    style={this.styles.infoItem}
                  />
                }
                flowing
                hoverable
                position="bottom left"
              >
                To create JSON Schema checkout{" "}
                <a
                  href="https://jsonschema.net/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {" "}https://jsonschema.net/{" "}
                </a>
              </Popup>
            </span>
          </div>
          <div style={this.styles.aceParent}>
            <AceEditor
              style={this.styles.ace}
              placeholder="If no input body required, paste JSON schema of empty json"
              maxLines={Infinity}
              mode="javascript"
              theme="textmate"
              onChange={this.handleChangeAce("inputSchema")}
              name="UNIQUE_ID_OF_DIV2"
              value={this.props.state.inputSchema}
            />
          </div>
          <span style={this.styles.disclaimer}>
            If no input body required, paste JSON schema of empty json
          </span>
        </div>

        <div className="row">
          <div className="col-md-5" style={this.styles.optionLineLeft}></div>
          <div style={this.styles.option}>
            <center>OR</center>
          </div>
          <div className="col-md-5" style={this.styles.optionLineRight}></div>
        </div>

        <div style={this.styles.inputParent}>
          <div style={this.styles.labelParent}>
            <span style={this.styles.label}>
              {constants.INVOCABLE_CONFIG['FIELDS']["input_params"]["displayName"]}
              <sup>*</sup>
            </span>
          </div>
          <textarea
            style={this.styles.textArea}
            placeholder={
              constants.INVOCABLE_CONFIG['FIELDS']["input_params"]["placeholder"]
            }
            value={this.props.state.input_params}
            onChange={this.handleChange("input_params")}
          />
        </div>

        <div style={this.styles.inputParent}>
          <div style={this.styles.labelParent}>
            <span style={this.styles.label}>
              {constants.INVOCABLE_CONFIG['FIELDS']["sample_input"]["displayName"]}
              <sup>*</sup>
            </span>
          </div>
          <div style={this.styles.aceParent}>
            <AceEditor
              style={this.styles.ace}
              maxLines={Infinity}
              mode="json"
              theme="textmate"
              onChange={this.handleChangeAce("sample_input")}
              name="SAMPLE_INPUT"
              value={this.props.state.sample_input}
            />
          </div>
        </div>

        <div style={this.styles.inputParent}>
          <div style={this.styles.labelParent}>
            <span style={this.styles.label}>
              {constants.INVOCABLE_CONFIG['FIELDS']["input_constraints"]["displayName"]}
            </span>
          </div>
          <textarea
            style={this.styles.textArea}
            placeholder={
              constants.INVOCABLE_CONFIG['FIELDS']["input_constraints"]["placeholder"]
            }
            value={this.props.state.input_constraints}
            onChange={this.handleChange("input_constraints")}
          />
        </div>
      </div>
    );
  }
}
