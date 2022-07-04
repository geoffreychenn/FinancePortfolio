import React from "react";
import NewsList from "./NewsList";
import { getCompanyNews } from "./utils";
import { StyledEngineProvider } from "@mui/material/styles";

export class CompanyNewsComponent extends React.Component {
  componentDidMount() {
    getCompanyNews(this.props.symbol, this.props.region).then((data) => {
      this.setState({ data });
    });
  }
  render() {
    if (this.state == null) {
      return <div> Loading... </div>;
    }
    return (
      <StyledEngineProvider>
        <NewsList data={this.state.data} />
      </StyledEngineProvider>
    );
  }
}
