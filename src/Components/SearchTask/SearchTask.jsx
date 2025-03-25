import { TextField, IconButton } from "@mui/material";
import { Search as SearchIcon,
    Close as CloseIcon
}from "@mui/icons-material";


export default function SearchTask({searchText, onSearchTask, onClearSearchTask }) {
   
    return(
        <TextField
        variant="standard"
        label="Search By Task Title"
        value={searchText}
        onChange={onSearchTask}
        InputProps={{
            sx:{ mb:2 , bgcolor:"white"},
            startAdornment: (
                <IconButton>
                    <SearchIcon />
                </IconButton>
            ),
            endAdornment: searchText !== "" && (
                <IconButton
                onClick={onClearSearchTask}
                sx={{ color: "red" }}
                >
                    <CloseIcon />
                </IconButton>
            )
        }}
        />
    );
}