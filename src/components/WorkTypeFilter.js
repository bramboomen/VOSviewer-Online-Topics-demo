import { Autocomplete, TextField, } from "@mui/material";
import React, { useEffect, useState } from "react";
import { OpenAlexApi } from "../lib/OpenAlex"

const WorkTypeFilter = ({filter, setFilter}) => {
    const [input, setInput] = useState("")
    const [suggestions, setSuggestions] = useState([])
    const [typeId, setTypeId] = useState()

    useEffect(() => {
        const WorkTypesAsync = async () => {
            setSuggestions(await OpenAlexApi({path: "/types"}))
        }
        WorkTypesAsync()
    }, [])

    useEffect(() => {
        setInput(suggestions.find(suggestion => suggestion.display_name === filter?.type)?.display_name || "")
    }, [filter, suggestions])

    useEffect(() => {
        setFilter(filter => ({...filter, 'type': typeId}))
    }, [typeId, setFilter])

    const handleSubmit = (id) => {
        setTypeId(id?.replace("https://openalex.org/types/", "") || "")
    }

    return (
        <Autocomplete
            freeSolo
            forcePopupIcon
            id="worktypeselector"
            options={suggestions}
            getOptionLabel={suggestion => suggestion.display_name ?? suggestion}
            onChange={(_event, value) => handleSubmit(value?.id)}
            inputValue={input}
            onInputChange={(_event, value) => setInput(value)}
            renderInput={(params) => <TextField {...params} label="Work Type" />}
        />
    )
}

export default WorkTypeFilter
