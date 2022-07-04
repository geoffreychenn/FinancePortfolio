import React from "react";
import PerformerTable from "./PerformerTable";
import { getWatchlistPerformers } from "./utils";
import { StyledEngineProvider } from "@mui/material/styles";

export class WatchlistPerformersComponent extends React.Component {
  componentDidMount() {
    getWatchlistPerformers(this.props.watchlist_id).then((data) => {
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
