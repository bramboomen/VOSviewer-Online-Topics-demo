import { Autocomplete, TextField, } from "@mui/material";
import React, { useEffect, useState } from "react";
import { OpenAlexApi } from "../lib/OpenAlex"

const InstitutionsSelector = ({setQueryparams}) => {
    const [input, setInput] = useState("")
    const [suggestions, setSuggestions] = useState({})

    useEffect(() => {
        const autocomplete = async (input) => {
            const results = await OpenAlexApi({entities: "autocomplete/institutions", query: `q=${input}`})
            const suggestions_obj = results.reduce((results_obj, result) => {
                results_obj[result.display_name] = result;
                return results_obj;
            }, {});
            setSuggestions(suggestions_obj)
        }
        autocomplete(input)
    }, [input]);

    const handleSubmit = (value) => {
        if (value) {
            setQueryparams({
                valid: true,
                entities: "works",
                filter: `authorships.institutions.id:${value}`,
                groupby: "primary_topic.id"
            })
        }
    }

    return (
        <Autocomplete
            freeSolo
            autoHighlight
            autoSelect
            id="institutionselector"
            options={ Object.keys(suggestions) }
            onChange={(_event, value) => handleSubmit(suggestions[value]?.id)}
            inputValue={input}
            onInputChange={(_event, value) => setInput(value)}
            renderInput={(params) => <TextField {...params} label="Institution" />}
        />
    )
}

export default InstitutionsSelector
