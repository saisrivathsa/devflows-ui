import { Component } from "react";
import React from "react"
import {
  ErrorBoundary,
  Facet,
  SearchProvider,
  WithSearch,
  SearchBox,
  Result,
  PagingInfo,
  ResultsPerPage,
  Paging,
  Sorting
} from "@elastic/react-search-ui";
import { Layout } from "@elastic/react-search-ui-views";
import "@elastic/react-search-ui-views/lib/styles/styles.css";

import buildRequest from "./buildRequest";
import runRequest from "./runRequest";
import applyDisjunctiveFaceting from "./applyDisjunctiveFaceting.js";
import buildState from "./buildState";

import './exploreView.css'

export default class ExploreView extends Component {
  constructor(props) {
    super(props)
    
    this.config = {
      debug: true,
      hasA11yNotifications: true,
      trackUrlState: false,
      onResultClick: () => {
        /* Not implemented */
      },
      onAutocompleteResultClick: () => {
        /* Not implemented */
      },
      onAutocomplete: async ({ searchTerm }) => {
        const requestBody = buildRequest({ searchTerm });
        const json = await runRequest(requestBody);
        const state = buildState(json);
        return {
          autocompletedResults: state.results
        };
      },
      onSearch: async state => {
        const { resultsPerPage } = state;
        const requestBody = buildRequest(state);
        // Note that this could be optimized by running all of these requests
        // at the same time. Kept simple here for clarity.
        const responseJson = await runRequest(requestBody);
        const responseJsonWithDisjunctiveFacetCounts = await applyDisjunctiveFaceting(
          responseJson,
          state,
          ["domain_name"]
        );
        return buildState(responseJsonWithDisjunctiveFacetCounts, resultsPerPage);
      },
      alwaysSearchOnInitialLoad: true,
      searchQuery:{
        disjunctiveFacets: ["domain_name"],
        facets: {
          domain_name: { type: "value" }
        }
      }
    };

    if(this.props.selectInvocable){
      this.config.onCardClick = this.props.onCardClick;
      this.config.selectInvocable = true;
    }
      
  }

  render(){
    return (
      <SearchProvider config={this.config}>
        <WithSearch mapContextToProps={({ wasSearched, results }) => ({ wasSearched, results })}>
          {({ wasSearched, results }) => (
            <div className="explore-app">
              <ErrorBoundary>
                <Layout
                  header={
                    <SearchBox
                      searchAsYouType={true}
                      autocompleteMinimumCharacters={1}
                      autocompleteSuggestions={false}
                      inputProps={{ placeholder: "Search Invocables" }}
                    />
                  }
                  sideContent={
                    <div>
                      {wasSearched && (
                        <Sorting
                          label={"Sort by"}
                          sortOptions={[
                            {
                              name: "Relevance",
                              value: "",
                              direction: ""
                            },
                            {
                              name: "Name",
                              value: "name",
                              direction: "asc"
                            }
                          ]}
                        />
                      )}
                      
                      <Facet
                        field="domain_name"
                        label="domains"
                        filterType="any"
                        isFilterable={true}
                      />
                      
                    </div>
                  }
                 
                  bodyContent={
                    <div>
                      {results.map(result => (
                        <div key={result.id.raw} style={styles.resultContainer}>
                          <Result 
                            key={result.id.raw}
                            result={result}
                            titleField="name"
                            urlField="url"
                            style={styles.result}
                          />
                          {this.config.selectInvocable ?
                            <div onClick={() => this.config.onCardClick(result.id.raw)} style={styles.selectInvocable}>Select</div> 
                          : 
                            <div></div>
                          }
                        </div>
                      ))}
                    </div>
                  }
                  
                  bodyHeader={
                    <React.Fragment>
                      {wasSearched && <PagingInfo />}
                      {wasSearched && <ResultsPerPage />}
                    </React.Fragment>
                  }
                  bodyFooter={<Paging />}
                />
              </ErrorBoundary>
            </div>
          )}
        </WithSearch>
      </SearchProvider>
    );
  }
}

const styles = {
  resultContainer: {
    display: "flex",
    alignItems: "stretch"
  },
  selectInvocable:{
    cursor: "pointer",
    backgroundColor: "#0000000a",
    margin: "12px 0px",
    padding: "0px 15px",
    display: "flex",
    alignItems: "center",
    border: "1px solid #f0f0f0",
    borderRadius: "4px",
    boxShadow: "0px 0px 1px 0px rgba(0, 0, 0, 0.1)",
    borderLeft: "0"
  },
  result:{
    width: "100%",
    margin: "12px 0px"
  }
}
