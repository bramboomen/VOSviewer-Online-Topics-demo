import { Stack, Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import InstitutionsFilter from "./InstitutionsFilter";
import ApiQueryInput from "./ApiQueryInput";
import { constructUrl, validateQueryparams } from "../lib/OpenAlex";
import WorkTypeFilter from "./WorkTypeFilter";
import WorkPeriodFilter from "./WorkPeriodFilter";
import MailToInput from "./MailTo";

const FilterParams = ({queryparams, setQueryparams, controller, setController}) => {
    const thiscontroller = "filterparams"
    const [filter, setFilter] = useState({})

    const handleSubmit = () => {
        const filterstr = Object.entries(filter)
            .filter(([k, v]) => k && v)
            .map(([k, v]) => `${k}:${v}`).join(',')
        setController(thiscontroller)
        setQueryparams({
            path: "/works",
            filter: filterstr,
            group_by: "primary_topic.id",
        })
    }

    useEffect(() => {
        if (controller !== thiscontroller) {
            const newfilter = queryparams?.filter?.split(',').reduce((collect, item) => {
                const split = item.split(':')
                collect[split[0]] = split[1]
                return collect
            }, {})
            setFilter(newfilter)
        }
    }, [queryparams, controller])

    return (
        <Stack spacing={2}>
            <InstitutionsFilter filter={filter} setFilter={setFilter} />
            <WorkTypeFilter filter={filter} setFilter={setFilter} />
            <WorkPeriodFilter filter={filter} setFilter={setFilter} />
            <Button variant="contained" onClick={handleSubmit}>Submit Filters</Button>
        </Stack>
    )
}

const Filters = ({apply}) => {
    const [controller, setController] = useState()
    const [queryparams, setQueryparams] = useState({})

    useEffect(() => {
        if (validateQueryparams(queryparams)) {
            apply(queryparams)
        }
    })

    return (
        <Stack spacing={5} sx={{ margin: 2 }} width={1000}>
            <MailToInput />
            <FilterParams queryparams={queryparams} setQueryparams={setQueryparams} controller={controller} setController={setController}/>
            <ApiQueryInput queryparams={queryparams} setQueryparams={setQueryparams} controller={controller} setController={setController}/>
            <pre>{JSON.stringify(queryparams, null, 4)}</pre>
            <pre>{constructUrl(queryparams)}</pre>
        </Stack>
    )
}

export default Filters
