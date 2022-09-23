import React, { useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import axios from "axios";
import { searchRoute, searchByNumberRoute } from "../utils/APIRoutes";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import PopupState, { bindMenu } from "material-ui-popup-state";

function SearchRoomMember({ currentUser, setListMembers, byFullName, list }) {
  const [searchValue, setSearchValue] = useState("");
  const [searchData, setSearchData] = useState([]);

  const handleSearch = async (event) => {
    if (event.target.value.length !== 0) {
      event.preventDefault();
      setSearchValue(event.target.value);
      const data = await axios.get(
        `${byFullName ? searchRoute : searchByNumberRoute}/${
          event.target.value
        }/${currentUser._id}`
      );

      if (list.length !== 0) {
        const myArrayFiltered = data.data.filter(
          (elem) => !list.find(({ id }) => elem._id === id)
        );
        setSearchData(myArrayFiltered);
      } else {
        setSearchData(data.data);
      }
    } else {
      setSearchValue("");
      setSearchData([]);
    }
  };
  return (
    <div>
      <PopupState variant="popover" popupId="demo-popup-menu">
        {(popupState) => (
          <React.Fragment>
            <TextField
              fullWidth
              id="standard-basic"
              placeholder="Search"
              variant="standard"
              onChange={handleSearch}
              onFocus={popupState.open}
              value={searchValue}
            />
            <Menu
              {...bindMenu(popupState)}
              PaperProps={{
                sx: { width: "350px" },
              }}
            >
              {searchData.length !== 0 ? (
                searchData.map((data, i) => {
                  return (
                    <MenuItem key={i} onClick={popupState.close}>
                      <Button
                        onClick={() => {
                          setListMembers((prevValue) => [
                            ...prevValue,
                            { id: data._id, membername: data.fullname },
                          ]);
                          setSearchValue("");
                          setSearchData([]);
                        }}
                      >
                        {data.fullname}
                      </Button>
                    </MenuItem>
                  );
                })
              ) : (
                <MenuItem onClick={popupState.close}>
                  {byFullName ? "" : <Button>{`Add <${searchValue}>`}</Button>}
                </MenuItem>
              )}
            </Menu>
          </React.Fragment>
        )}
      </PopupState>
    </div>
  );
}

export default SearchRoomMember;
