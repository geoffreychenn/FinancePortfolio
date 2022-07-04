import React from "react";
import InfoTable from "./InfoTable";
import { getCompanyInfo } from "./utils";
import { StyledEngineProvider } from "@mui/material/styles";

export class CompanyInfoComponent extends React.Component {
  componentDidMount() {
    getCompanyInfo(this.props.symbol, this.props.region).then((data) => {
      this.setState({ data });
    });
  }
  render() {
    if (this.state == null) {
      return <div> Loading... </div>;
    }
    return (
      <StyledEngineProvider>
        <InfoTable data={this.state.data} />
      </StyledEngineProvider>
    );
  }
}
