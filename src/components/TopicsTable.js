import { Table, TableBody, TableContainer, TableHead, TableRow, TableCell } from "@mui/material";

const TopicsTable = ({data}) => {
    return (
        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell align="right">Label</TableCell>
                        <TableCell align="right">Count</TableCell>
                        <TableCell align="right">Total Count</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.network.items
                        .sort((item1, item2) => item1.weights["OpenAlex Topic Count"] < item2.weights["OpenAlex Topic Count"])
                        .map((item) => {
                            return (
                                <TableRow key={item.id}>
                                    <TableCell>{item.id}</TableCell>
                                    <TableCell align="right">{item.label}</TableCell>
                                    <TableCell align="right">{item.weights["OpenAlex Topic Count"]}</TableCell>
                                    <TableCell align="right">{item.weights["OpenAlex Topic Total Count"]}</TableCell>
                                </TableRow>
                            );
                        })}
                </TableBody>
            </Table>
        </TableContainer>
    )
}

export default TopicsTable
