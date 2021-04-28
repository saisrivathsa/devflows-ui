import React, { Component } from "react";
import AceEditor from "react-ace";
import * as utils from "../../../../../lib/utils";
import constants from "../../../../../constants";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { Popup } from "semantic-ui-react";

export default class StepThree extends Component {
  constructor(props) {
    super(props);
    this.styles = this.props.styles;
    this.isValidated = this.isValidated.bind(this);
  }

  isValidated() {
    if (!utils.isOutputValidated(this.props.state)){
      return false;
    }
    return true;
  }

  render() {
    this.handleChange = this.props.handleChange;
    this.handleChangeAce = this.props.handleChangeAce;
    if (!(this.props.state.step === 3)) this.props.setStep(3);

    return (
      <div>
        <div style={this.styles.inputParent}>
          <div style={this.styles.labelParent}>
            <span style={this.styles.label}>
              Output Json Schema<sup>*</sup>
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
              maxLines={Infinity}
              mode="javascript"
              theme="textmate"
              onChange={this.handleChangeAce("outputSchema")}
              name="UNIQUE_ID_OF_DIV3"
              value={this.props.state.outputSchema}
            />
          </div>
          <span style={this.styles.disclaimer}>
            If no output body returned, paste JSON schema of empty json
          </span>
        </div>

        <div className="row">
          <div
            className="col-md-5"
            style={this.styles.optionLineLeft}
          ></div>
          <div style={this.styles.option}>
            <center>OR</center>
          </div>
          <div
            className="col-md-5"
            style={this.styles.optionLineRight}
          ></div>
        </div>

        <div style={this.styles.inputParent}>
          <div style={this.styles.labelParent}>
            <span style={this.styles.label}>
            {constants.INVOCABLE_CONFIG['FIELDS']['output_params']['displayName']}<sup>*</sup>
            </span>
          </div>
          <textarea
            style={this.styles.textArea}
            placeholder={constants.INVOCABLE_CONFIG['FIELDS']['output_params']['placeholder']}
            value={this.props.state.output_params}
            onChange={this.handleChange("output_params")}
          />
        </div>

        <div style={this.styles.inputParent}>
          <div style={this.styles.labelParent}>
            <span style={this.styles.label}>
            {constants.INVOCABLE_CONFIG['FIELDS']['sample_output']['displayName']}<sup>*</sup>
            </span>
          </div>
          <div style={this.styles.aceParent}>
            <AceEditor
              style={this.styles.ace}
              maxLines={Infinity}
              mode="json"
              theme="textmate"
              onChange={this.handleChangeAce("sample_output")}
              name="SAMPLE_OUTPUT"
              value={this.props.state.sample_output}
            />
          </div>
        </div>
      </div>
    );
  }
}
