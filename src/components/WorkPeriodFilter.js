import { DateRange } from "@mui/icons-material";
import { Autocomplete, Stack, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";

const WorkPeriodFilter = ({filter, setFilter}) => {
    const allYears = Array.from(Array(100), (_x, i) => i + 1950).filter(n => n >= 1980 && n <= 2024)
    const [startYears, setStartYears] = useState(allYears)
    const [endYears, setEndYears] = useState(allYears)
    const [startYear, setStartYear] = useState()
    const [endYear, setEndYear] = useState()

    useEffect(() => {
        setStartYears(endYear ? allYears.filter(n => n < endYear) : allYears)
    }, [endYear, allYears])

    useEffect(() => {
        setEndYears(startYear ? allYears.filter(n => n > startYear) : allYears)
    }, [startYear, allYears])

    useEffect(() => {
        setStartYear(filter?.from_publication_date?.slice(0, 4))
        setEndYear(filter?.to_publication_date?.slice(0, 4))
    }, [filter])

    useEffect(() => {
        setFilter(filter => ({
            ...filter,
            'from_publication_date': startYear ? `${startYear}-01-01` : null,
            'to_publication_date': endYear ? `${endYear}-12-31` : null
        }))
    }, [startYear, endYear, setFilter])

    return (
        <Stack direction="row" spacing={2} alignItems="center">
            <Autocomplete
                fullWidth
                freeSolo
                forcePopupIcon
                id="startyearselector"
                options={startYears}
                getOptionLabel={suggestion => `${suggestion}` ?? suggestion}
                inputValue={startYear || ''}
                onInputChange={(_event, value) => setStartYear(value)}
                renderInput={(params) => <TextField {...params} label="From Publication Year" />}
            />
            <DateRange />
            <Autocomplete
                fullWidth
                freeSolo
                forcePopupIcon
                id="endyearselector"
                options={endYears}
                getOptionLabel={suggestion => `${suggestion}` ?? suggestion}
                inputValue={endYear || ''}
                onInputChange={(_event, value) => setEndYear(value)}
                renderInput={(params) => <TextField {...params} label="To Publication Year" />}
            />
        </Stack>
    )
}

export default WorkPeriodFilter
