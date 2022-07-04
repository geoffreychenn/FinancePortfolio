import React from "react";
import { Button, Table, ListGroup } from "react-bootstrap";

/*
 * This component is designed to render a single entry in the search results
 * should also route to adding stock based on the symbol
 * assumes props.region="aus" for Australian stocks
 */
const ResultCard = (props) => {
  // need to expand this into showing the whole thing

  let regionSuffix = "";
  let regionLink = "US";
  if (props.region === "aus") {
    regionSuffix = ".AU";
    regionLink = "AU";
  }
  return (
    <ListGroup.Item
      className="d-flex justify-content-between align-items-center"
      key={props.result.symbol}
    >
      <div>
        <div style={{ fontWeight: "bolder", fontSize: "18pt" }}>
          <a href={"/company/" + props.result.symbol + "/" + regionLink}>
            {props.result.symbol}
          </a>
        </div>
        <div style={{ fontWeight: "bold", fontSize: "12pt" }}>
          {props.result.name}
        </div>
        <Table bordered striped className="text-center">
          <thead>
            <tr>
              <th>Currency</th>
              <th>Market Close</th>
              <th>Market Open</th>
              <th>Region</th>
              <th>Time Zone</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{props.result.currency}</td>
              <td>{props.result.marketClose}</td>
              <td>{props.result.marketOpen}</td>
              <td>{props.result.region}</td>
              <td>{props.result.timezone}</td>
            </tr>
          </tbody>
        </Table>
      </div>
      <Button
        className="mb-2"
        href={"/add/" + props.result.symbol + regionSuffix}
      >
        Add
      </Button>
    </ListGroup.Item>
  );
};

export default ResultCard;
