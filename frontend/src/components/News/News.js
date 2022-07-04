import React from "react";
import List from "./List";
import { getNews } from "./utils";
import { StyledEngineProvider } from "@mui/material/styles";

export class NewsComponent extends React.Component {
  componentDidMount() {
    getNews().then((data) => {
      this.setState({ data });
    });
  }
  render() {
    if (this.state == null) {
      return <div> Loading... </div>;
    }
    return (
      <div className="canvas">
        <StyledEngineProvider>
          <List data={this.state.data} />
        </StyledEngineProvider>
      </div>
    );
  }
}
