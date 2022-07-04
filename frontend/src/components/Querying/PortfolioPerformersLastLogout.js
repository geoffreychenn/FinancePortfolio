import React from "react";
import PerformerTable from "./PerformerTableLogout";
import { getPortfolioPerformersLastLogout } from "./utils";
import { StyledEngineProvider } from "@mui/material/styles";

export class PortfolioPerformersLastLogoutComponent extends React.Component {
  componentDidMount() {
    getPortfolioPerformersLastLogout(
      this.props.portfolio_id,
      this.props.user_id
    ).then((data) => {
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
