import React from "react";
import { render } from "react-dom";
import Chart from "./Chart";
import { getIntraData } from "./utils";

import { TypeChooser } from "react-stockcharts/lib/helper";

export class IntraChartComponent extends React.Component {
  componentDidMount() {
    getIntraData(this.props.symbol, this.props.interval).then((data) => {
      this.setState({ data });
    });
  }
  render() {
    if (this.state == null) {
      return <div>Loading...</div>;
    }
    return (
      <TypeChooser>
        {(type) => <Chart type={type} data={this.state.data} />}
      </TypeChooser>
    );
  }
}

render(<IntraChartComponent />, document.getElementById("root"));
