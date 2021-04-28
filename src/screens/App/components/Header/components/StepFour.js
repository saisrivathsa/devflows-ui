import React, { Component } from "react";
import AceEditor from "react-ace";
import * as utils from "../../../../../lib/utils";
import constants from "../../../../../constants";
import { ToastsStore } from "react-toasts";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { Popup } from "semantic-ui-react";

export default class StepFour extends Component {
  constructor(props) {
    super(props);
    this.styles = this.props.styles;
    this.isValidated = this.isValidated.bind(this);
  }

  isValidated() {
    if (!utils.isJson(this.props.state.invocationSchema)) {
      ToastsStore.error(`Invocation Config is not a valid json`);
      return false;
    }
    return true;
  }
  render() {
    this.handleChange = this.props.handleChange;
    this.handleChangeAce = this.props.handleChangeAce;

    if (!(this.props.state.step === 4)) this.props.setStep(4);
    return (
      <div>
        <div style={this.styles.inputParent}>
          <div style={this.styles.labelParent}>
            <span style={this.styles.label}>
              Invocation Config Json Schema
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
              onChange={this.handleChangeAce("invocationSchema")}
              name="UNIQUE_ID_OF_DIV1"
              value={this.props.state.invocationSchema}
            />
          </div>
        </div>

        <div style={this.styles.inputParent}>
          <div style={this.styles.labelParent}>
            <span style={this.styles.label}>{constants.INVOCABLE_CONFIG['FIELDS']['list_secret']['displayName']}</span>
          </div>
          <textarea
            style={this.styles.textArea}
            placeholder={constants.INVOCABLE_CONFIG['FIELDS']['list_secret']['placeholder']}
            value={this.props.state.list_secret}
            onChange={this.handleChange("list_secret")}
          />
        </div>

        <div style={this.styles.inputParent}>
          <div style={this.styles.labelParent}>
            <span style={this.styles.label}>{constants.INVOCABLE_CONFIG['FIELDS']['get_secret']['displayName']}</span>
          </div>
          <textarea
            style={this.styles.textArea}
            placeholder={constants.INVOCABLE_CONFIG['FIELDS']['get_secret']['placeholder']}
            value={this.props.state.get_secret}
            onChange={this.handleChange("get_secret")}
          />
        </div>
      </div>
    );
  }
}
