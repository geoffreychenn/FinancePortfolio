import React from "react";
import EventsTable from "./EventsTable";
import { getCompanyEvents } from "./utils";
import { StyledEngineProvider } from "@mui/material/styles";

export class CompanyEventsComponent extends React.Component {
  componentDidMount() {
    getCompanyEvents(this.props.symbol, this.props.region).then((data) => {
      this.setState({ data });
    });
  }
  render() {
    if (this.state == null) {
      return <div> Loading... </div>;
    }
    return (
      <StyledEngineProvider>
        <EventsTable data={this.state.data} />
      </StyledEngineProvider>
    );
  }
}
