import React, { useState } from "react";
import { Button, Card, Alert } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { DayChartComponent } from "../Querying/DayChart";
import "@inovua/reactdatagrid-community/index.css";
import { TableCell, TableRow, Drawer } from "@mui/material";
import { CompanyNewsComponent } from "../Querying/CompanyNews";
import { CompanyHoldersComponent } from "../Querying/CompanyHolders";
import { CompanyInfoComponent } from "../Querying/CompanyInfo";
import { CompanyEventsComponent } from "../Querying/CompanyEvents";
import { usePriceFetchRegion } from "../../hooks/usePriceFetchRegion";
import { useCompanyNameFetchRegion } from "../../hooks/useCompanyNameFetchRegion";

export default function Profile() {
  const { company } = useParams();
  const { region } = useParams();
  const { price, priceLoading, priceError } = usePriceFetchRegion(
    company,
    region
  );
  const { companyName, companyNameLoading, companyNameError } =
    useCompanyNameFetchRegion(company, region);
  const [showNews, setShowNews] = useState(false);
  const [showHolders, setShowHolders] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showEvents, setShowEvents] = useState(false);
  const [showChart, setShowChart] = useState(false);

  function onlyNews() {
    setShowHolders(false);
    setShowInfo(false);
    setShowEvents(false);
    setShowChart(false);
  }
  function onlyHolders() {
    setShowNews(false);
    setShowInfo(false);
    setShowEvents(false);
    setShowChart(false);
  }
  function onlyEvents() {
    setShowHolders(false);
    setShowInfo(false);
    setShowNews(false);
    setShowChart(false);
  }
  function onlyInfo() {
    setShowHolders(false);
    setShowNews(false);
    setShowEvents(false);
    setShowChart(false);
  }
  function onlyChart() {
    setShowHolders(false);
    setShowNews(false);
    setShowEvents(false);
    setShowInfo(false);
  }

  return (
    <div className="canvas">
      <Card>
        <Card.Body>
          Company Ticker: {company} <br/>
          Company Name: {companyNameLoading ? "Loading" : companyName} <br/>
          Region: {region} <br/>
          Current Price:{" "}
          {priceLoading
            ? "Loading"
            : parseFloat(price).toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })}{" "}
          <br/>
          {priceError && <Alert variant="danger">{priceError}</Alert>}
          {companyNameError && (
            <Alert variant="danger">{companyNameError}</Alert>
          )}
          <TableRow>
            <TableCell>
              <Button
                onClick={() => {
                  setShowChart(!showChart);
                  onlyChart();
                }}
              >
                Chart
              </Button>
              {
                <Drawer open={showChart} variant="persistent" anchor="bottom">
                  <div className="bottom-drawer">
                    <DayChartComponent symbol={company} region={region} />
                    <Button
                      onClick={() => {
                        setShowChart(!showChart);
                      }}
                    >
                      Close
                    </Button>
                  </div>
                </Drawer>
              }
            </TableCell>
            <TableCell>
              <Button
                onClick={() => {
                  setShowNews(!showNews);
                  onlyNews();
                }}
              >
                News
              </Button>
              {
                <Drawer open={showNews} variant="persistent" anchor="bottom">
                  <div className="bottom-drawer">
                    <CompanyNewsComponent symbol={company} region={region} />
                    <Button
                      onClick={() => {
                        setShowNews(!showNews);
                      }}
                    >
                      Close
                    </Button>
                  </div>
                </Drawer>
              }
            </TableCell>

            <TableCell>
              <Button
                onClick={() => {
                  setShowHolders(!showHolders);
                  onlyHolders();
                }}
              >
                Holders
              </Button>
              {
                <Drawer open={showHolders} variant="persistent" anchor="bottom">
                  <div className="bottom-drawer">
                    <CompanyHoldersComponent symbol={company} region={region} />
                    <Button
                      onClick={() => {
                        setShowHolders(!showHolders);
                      }}
                    >
                      Close
                    </Button>
                  </div>
                </Drawer>
              }
            </TableCell>

            <TableCell>
              <Button
                onClick={() => {
                  setShowInfo(!showInfo);
                  onlyInfo();
                }}
              >
                Info
              </Button>
              {
                <Drawer open={showInfo} variant="persistent" anchor="bottom">
                  <div className="bottom-drawer">
                    <CompanyInfoComponent symbol={company} region={region} />
                    <Button
                      onClick={() => {
                        setShowInfo(!showInfo);
                      }}
                    >
                      Close
                    </Button>
                  </div>
                </Drawer>
              }
            </TableCell>

            <TableCell>
              <Button
                onClick={() => {
                  setShowEvents(!showEvents);
                  onlyEvents();
                }}
              >
                Events
              </Button>
              {
                <Drawer open={showEvents} variant="persistent" anchor="bottom">
                  <div className="bottom-drawer">
                    <CompanyEventsComponent symbol={company} region={region} />
                    <Button
                      onClick={() => {
                        setShowEvents(!showEvents);
                      }}
                    >
                      Close
                    </Button>
                  </div>
                </Drawer>
              }
            </TableCell>
          </TableRow>
        </Card.Body>
      </Card>
    </div>
  );
}
