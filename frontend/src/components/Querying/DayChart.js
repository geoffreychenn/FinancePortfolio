import React from "react";
import Chart from "./Chart";
import { getDayData } from "./utils";

import { TypeChooser } from "react-stockcharts/lib/helper";

export class DayChartComponent extends React.Component {
  componentDidMount() {
    getDayData(this.props.symbol, this.props.region).then((data) => {
      this.setState({ data });
    });
  }
  render() {
    if (this.state == null) {
      return <div> Loading... </div>;
    }
    return (
      <TypeChooser>
        {(type) => <Chart type={type} data={this.state.data} />}
      </TypeChooser>
    );
  }
}
