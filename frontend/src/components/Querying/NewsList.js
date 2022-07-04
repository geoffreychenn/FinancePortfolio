import React from "react";
import PropTypes from "prop-types";

import Box from "@mui/material/Box";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import { FixedSizeList } from "react-window";
import LaunchIcon from "@mui/icons-material/Launch";

function renderRow({ data, index, style }) {
  const item = data.data[index];

  return (
    <ListItem style={style} key={index} component="div" disablePadding>
      <ListItemButton button component="a" href={`${item.link}`}>
        <LaunchIcon style={{ marginRight: "0.5rem" }} />

        <ListItemText primary={` ${item.title}`} />
      </ListItemButton>
    </ListItem>
  );
}

class VirtualList extends React.Component {
  render() {
    let { data } = this.props;

    return (
      <Box
        sx={{
          width: "100%",
          height: 400,
          maxWidth: 1200,
          bgcolor: "background.paper",
        }}
      >
        <FixedSizeList
          height={300}
          width={1200}
          itemSize={30}
          itemCount={data.length}
          itemData={{
            data,
          }}
          overscanCount={0}
        >
          {renderRow}
        </FixedSizeList>
      </Box>
    );
  }
}

VirtualList.propTypes = {
  data: PropTypes.array.isRequired,
};

export default VirtualList;
