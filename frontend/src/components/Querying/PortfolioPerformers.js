import React from "react";
import PerformerTable from "./PerformerTable";
import { getPortfolioPerformers } from "./utils";
import { StyledEngineProvider } from "@mui/material/styles";

export class PortfolioPerformersComponent extends React.Component {
  componentDidMount() {
    getPortfolioPerformers(this.props.portfolio_id).then((data) => {
      this.setState({ data });
    });
  }
  render() {
    if (this.state == null) {
      return <div> Loading... </div>;
    }
    return (
      <StyledEngineProvider>
        <PerformerTable data={this.state.data} />
      </StyledEngineProvider>
    );
  }
}
