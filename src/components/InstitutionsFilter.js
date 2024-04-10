import { Autocomplete, TextField, } from "@mui/material";
import React, { useEffect, useState } from "react";
import { OpenAlexApi } from "../lib/OpenAlex"

const InstitutionsFilter = ({filter, setFilter}) => {
    const [input, setInput] = useState("")
    const [suggestions, setSuggestions] = useState([])
    const [institutionId, setInstitutionId] = useState()

    useEffect(() => {
        const autocomplete = async (input) => {
            setSuggestions(await OpenAlexApi({path: "/autocomplete/institutions", query: `q=${input}`}))
        }
        autocomplete(input)
    }, [input]);

    useEffect(() => {
        const getInstitutionName = async (str) => {
            if (!str) {
                setInput("")
            } else {
                const id = str.match(/(I[0-9]+)/)?.[1]
                const results = await OpenAlexApi({path: `/${id}`})
                setInput(results?.display_name || "")
            }
        }
        // TODO: only if set by another component
        getInstitutionName(filter?.['authorships.institutions.id'])
    }, [filter])

    useEffect(() => {
        setFilter(filter => ({...filter, 'authorships.institutions.id': institutionId}))
    }, [institutionId, setFilter])

    const handleSubmit = (id) => {
        setInstitutionId(id?.replace("https://openalex.org/", "") || "")
    }

    return (
        <Autocomplete
            freeSolo
            forcePopupIcon
            id="institutionselector"
            options={ suggestions }
            getOptionLabel={ suggestion => suggestion.display_name ?? suggestion }
            onChange={(_event, value) => handleSubmit(value?.id)}
            inputValue={input}
            onInputChange={(_event, value) => setInput(value)}
            renderInput={(params) => <TextField {...params} label="Institution" />}
        />
    )
}

export default InstitutionsFilter
