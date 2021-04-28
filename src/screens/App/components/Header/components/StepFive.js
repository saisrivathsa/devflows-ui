import React, { Component } from "react";
import constants from "../../../../../constants";

export default class StepFive extends Component {
  constructor(props) {
    super(props);
    this.styles = this.props.styles;
  }
  render() {
    this.handleChange = this.props.handleChange;
    if (!(this.props.state.step === 5)) this.props.setStep(5);
    return (
      <div>
        <div style={this.styles.inputParent}>
          <div style={this.styles.labelParent}>
            <span style={this.styles.label}>{constants.INVOCABLE_CONFIG['FIELDS']['features']['displayName']}</span>
          </div>
          <textarea
            style={this.styles.textArea}
            placeholder={constants.INVOCABLE_CONFIG['FIELDS']["features"]['placeholder']}
            value={this.props.state.features}
            onChange={this.handleChange("features")}
          />
        </div>

        <div style={this.styles.inputParent}>
          <div style={this.styles.labelParent}>
            <span style={this.styles.label}>{constants.INVOCABLE_CONFIG['FIELDS']['working']['displayName']}</span>
          </div>
          <textarea
            style={this.styles.textArea}
            placeholder={constants.INVOCABLE_CONFIG['FIELDS']['working']['placeholder']}
            value={this.props.state.working}
            onChange={this.handleChange("working")}
          />
        </div>

        <div style={this.styles.inputParent}>
          <div style={this.styles.labelParent}>
            <span style={this.styles.label}>{constants.INVOCABLE_CONFIG['FIELDS']['additional_comments']['displayName']}</span>
          </div>
          <textarea
            style={this.styles.textArea}
            value={this.props.state.additional_comments}
            onChange={this.handleChange("additional_comments")}
          />
        </div>
      </div>
    );
  }
}
