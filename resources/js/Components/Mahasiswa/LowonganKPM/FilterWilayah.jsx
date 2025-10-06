import { Autocomplete, TextField, Button } from "@mui/material";

export default function FilterWilayah({
    regency,
    subDistrict,
    village,
    listOfRegencies,
    listOfSubdistricts,
    listOfVillages,
    onRegencyChange,
    onSubDistrictChange,
    onVillageChange,
    onFilterClick,
}) {
    return (
        <div className="flex flex-col gap-3">
            <p>Filter berdasarkan wilayah</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <Autocomplete
                    value={regency}
                    options={listOfRegencies}
                    getOptionLabel={(o) => o?.nama || ""}
                    onChange={(e, v) => onRegencyChange(v || "")}
                    isOptionEqualToValue={(option, value) =>
                        option.id === value?.id
                    }
                    renderInput={(params) => (
                        <TextField
                            sx={{
                                "& .MuiOutlinedInput-root.Mui-focused": {
                                    outline: "none",
                                    boxShadow: "none",
                                },
                                "& .MuiInputBase-input:focus": {
                                    outline: "none",
                                    boxShadow: "none",
                                },
                            }}
                            {...params}
                            label="Kabupaten"
                            fullWidth
                        />
                    )}
                />
                <Autocomplete
                    value={subDistrict}
                    options={listOfSubdistricts}
                    getOptionLabel={(o) => o?.nama || ""}
                    onChange={(e, v) => onSubDistrictChange(v || "")}
                    isOptionEqualToValue={(option, value) =>
                        option.id === value?.id
                    }
                    renderInput={(params) => (
                        <TextField
                            sx={{
                                "& .MuiOutlinedInput-root.Mui-focused": {
                                    outline: "none",
                                    boxShadow: "none",
                                },
                                "& .MuiInputBase-input:focus": {
                                    outline: "none",
                                    boxShadow: "none",
                                },
                            }}
                            {...params}
                            label="Kecamatan"
                            fullWidth
                        />
                    )}
                />
                <Autocomplete
                    value={village}
                    options={listOfVillages}
                    getOptionLabel={(o) => o?.nama || ""}
                    onChange={(e, v) => onVillageChange(v || "")}
                    isOptionEqualToValue={(option, value) =>
                        option.id === value?.id
                    }
                    renderInput={(params) => (
                        <TextField
                            sx={{
                                "& .MuiOutlinedInput-root.Mui-focused": {
                                    outline: "none",
                                    boxShadow: "none",
                                },
                                "& .MuiInputBase-input:focus": {
                                    outline: "none",
                                    boxShadow: "none",
                                },
                            }}
                            {...params}
                            label="Desa"
                            fullWidth
                        />
                    )}
                />
            </div>
            <div className="self-end">
                <Button
                    onClick={onFilterClick}
                    variant="contained"
                    disableElevation
                >
                    Filter
                </Button>
            </div>
        </div>
    );
}
