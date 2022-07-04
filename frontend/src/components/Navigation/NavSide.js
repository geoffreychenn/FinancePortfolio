import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import {
  TableBody,
  TableCell,
  TableRow,
  IconButton,
  Table,
  Grid,
  Drawer,
  Collapse,
  Box,
  TableContainer,
  TableHead,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { AppContext } from "../../Context";

export default function NavSide() {
  const { watchlists, portfolios } = useContext(AppContext);
  const [pfOpen, setPfOpen] = useState(false);
  const [wlOpen, setWlOpen] = useState(false);
  const [taxOpen, setTaxOpen] = useState(false);

  return (
    <Drawer
      sx={{
        width: "16vw",
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: "16vw",
          boxSizing: "border-box",
          marginTop: "6vh",
          zIndex: 2000,
        },
      }}
      variant="permanent"
      anchor="left"
    >
      <Grid
        Container
        direction="column"
        justifyContent="left"
        alignItems="center"
        justifyItems="center"
      >
        <Grid item>
          <TableContainer sx={{ maxHeight: "32vh" }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
                  <TableCell style={{ width: "16vw" }}>
                    <IconButton
                      aria-label="expand row"
                      size="small"
                      onClick={() => setPfOpen(!pfOpen)}
                    >
                      {pfOpen ? (
                        <KeyboardArrowDownIcon />
                      ) : (
                        <KeyboardArrowRightIcon />
                      )}{" "}
                      Portfolios
                    </IconButton>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }}>
                  <Collapse in={pfOpen} timeout="auto" unmountOnExit>
                    <Box sx={{ margin: 1 }}>
                      <Table size="medium" aria-label="Portfolios">
                        <TableBody>
                          {portfolios ? (
                            portfolios.map((pf, index) => (
                              <Box key={index} className="mt-1 mb-1">
                                <Link
                                  className="pf-list-text"
                                  key={index}
                                  to={"/portfolio/view/" + pf.portfolio_id}
                                >
                                  {pf.name}
                                </Link>
                              </Box>
                            ))
                          ) : (
                            <h6 className="mt-2">No portfolios to display</h6>
                          )}
                        </TableBody>
                      </Table>
                    </Box>
                  </Collapse>
                </TableCell>
              </TableRow>
            </Table>
          </TableContainer>
        </Grid>

        <Grid item>
          <TableContainer sx={{ maxHeight: "32vh" }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
                  <TableCell style={{ width: "16vw" }}>
                    <IconButton
                      aria-label="expand row"
                      size="small"
                      onClick={() => setWlOpen(!wlOpen)}
                    >
                      {wlOpen ? (
                        <KeyboardArrowDownIcon />
                      ) : (
                        <KeyboardArrowRightIcon />
                      )}{" "}
                      Watchlists
                    </IconButton>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }}>
                  <Collapse in={wlOpen} timeout="auto" unmountOnExit>
                    <Box sx={{ margin: 1 }}>
                      <Table size="medium" aria-label="Watchlists">
                        <TableBody>
                          {watchlists ? (
                            watchlists.map((wl, index) => (
                              <Box key={index} className="mt-1 mb-1">
                                <Link
                                  className="pf-list-text"
                                  key={index}
                                  to={"/watchlist/view/" + wl.watchlist_id}
                                >
                                  {wl.name}
                                </Link>
                              </Box>
                            ))
                          ) : (
                            <h6 className="mt-2">No watchlists to display</h6>
                          )}
                        </TableBody>
                      </Table>
                    </Box>
                  </Collapse>
                </TableCell>
              </TableRow>
            </Table>
          </TableContainer>
        </Grid>

        <Grid item>
          <TableContainer sx={{ maxHeight: "32vh" }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
                  <TableCell style={{ width: "16vw" }}>
                    <IconButton
                      aria-label="expand row"
                      size="small"
                      onClick={() => setTaxOpen(!taxOpen)}
                    >
                      {taxOpen ? (
                        <KeyboardArrowDownIcon />
                      ) : (
                        <KeyboardArrowRightIcon />
                      )}{" "}
                      Tax Information
                    </IconButton>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }}>
                  <Collapse in={taxOpen} timeout="auto" unmountOnExit>
                    <Box sx={{ margin: 1 }}>
                      <Table size="medium" aria-label="Tax">
                        <TableBody>
                          <Box key="0" className="mt-2">
                            <Link
                              className="side-link"
                              key="0"
                              to="/tax/estdgains/all"
                            >
                              Portfolio Estimated Gains
                            </Link>
                          </Box>
                          <Box key="1" className="mt-2">
                            <Link
                              className="side-link"
                              key="1"
                              to="/tax/dividends/all"
                            >
                              Portfolio Dividends
                            </Link>
                          </Box>
                          <Box key="2" className="mt-2">
                            <Link
                              className="side-link"
                              key="2"
                              to="/tax/dividends/calculator"
                            >
                              Dividends Calculator
                            </Link>
                          </Box>
                        </TableBody>
                      </Table>
                    </Box>
                  </Collapse>
                </TableCell>
              </TableRow>
            </Table>
          </TableContainer>
        </Grid>

        <Grid item>
          <div className="mt-2">
            <Link to="/portfoliowatchlist/add" className="side-link">
              Add Portfolio/Watchlist
            </Link>
          </div>
        </Grid>

        <Grid item>
          <div className="mt-2">
            <Link to="/portfoliowatchlist/delete" className="side-link">
              Delete Portfolio/watchlist
            </Link>
          </div>
        </Grid>
      </Grid>
    </Drawer>
  );
}
