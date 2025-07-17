import React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

function BorderTable() {
    return (
        <TableContainer component={Paper} elevation={0.2}>
            <Table>
                <TableBody>
                    <TableRow>
                        <TableCell sx={{ whiteSpace: "nowrap", width: "1%" }}>
                            Cell 1
                        </TableCell>
                        <TableCell
                            align="center"
                            sx={{ whiteSpace: "nowrap", width: "1%" }}
                        >
                            :
                        </TableCell>
                        <TableCell>Cell 3</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell sx={{ whiteSpace: "nowrap", width: "1%" }}>
                            Cell 4
                        </TableCell>
                        <TableCell
                            sx={{ whiteSpace: "nowrap", width: "1%" }}
                            align="center"
                        >
                            :
                        </TableCell>
                        <TableCell>Cell 6</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default BorderTable;
