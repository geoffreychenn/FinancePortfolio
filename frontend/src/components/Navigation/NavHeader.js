import React, { useContext } from "react";
import { Link } from "react-router-dom";
import Logout from "../Account/Logout";
import SearchPage from "../Search/SearchPage";

import { AppBar, Box, Toolbar, Typography } from "@mui/material";
import { AppContext } from "../../Context";

export default function NavHeader() {
  const { currentUser } = useContext(AppContext);
  // SearchPage being given type stock will need to change to allow for news serach
  // Search.js could be modified for this with being passed results found be searchPage
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="fixed"
        style={{
          background: "#191919",
          height: "6vh",
        }}
      >
        <Toolbar>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ display: { xs: "none", sm: "block" } }}
          >
            <Link to="/" className="logo">
              WereBadAtNames
            </Link>
          </Typography>
          <div className="header-search">
            <SearchPage searchType={"stock"} />
          </div>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: { xs: "none", md: "flex" } }}>
            <Link to="/" className="header-link">
              Dashboard
            </Link>
            <div className="header-padding" />
            <Link to="/sharpe" className="header-link">
              Sharpe Calculator
            </Link>
            <div className="header-padding" />
            <Link to="/tax/estdgains/all" className="header-link">
              Estimated Gains
            </Link>
            <div className="header-padding" />
            <Link to="/news" className="header-link">
              Financial News
            </Link>
            <div className="header-padding" />
            <div className="m-auto">
              Currently logged in as:
              <Link to="/user-profile" className="user-email">
                {currentUser.email}
              </Link>
            </div>

            <Logout />
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
