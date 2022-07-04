import React from "react";
import HoldersTable from "./HoldersTable";
import { getCompanyHolders } from "./utils";
import { StyledEngineProvider } from "@mui/material/styles";

export class CompanyHoldersComponent extends React.Component {
  componentDidMount() {
    getCompanyHolders(this.props.symbol, this.props.region).then((data) => {
      this.setState({ data });
    });
  }
  render() {
    if (this.state == null) {
      return <div> Loading... </div>;
    }
    return (
      <StyledEngineProvider>
        <HoldersTable data={this.state.data} />
      </StyledEngineProvider>
    );
  }
}
