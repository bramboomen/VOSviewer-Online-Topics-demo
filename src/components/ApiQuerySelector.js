import { Stack, TextField, Button } from "@mui/material";
import React, { useEffect, useState } from "react";

const ApiQuerySelector = ({setQueryparams}) => {
    const [input, setInput] = useState("")
    const [params, setParams] = useState({valid: false})
    const validate = async (input) => {
        const valid_urls = ['api.openalex.org', 'https://api.openalex.org', null, undefined]
        const url = input.match(/^https:\/\/api\.openalex\.org/)?.[0]

        const valid_entities = ['works']
        const entities = input.match(/^(https:\/\/api\.openalex\.org\/)?([^/?]+)\/?(\?|$)/)?.[2]

        const filter = input.match(/filter=([^&/]+)/)?.[1]
        const groupby = input.match(/group_by=([^&/]+)/)?.[1]
        const search = input.match(/search=([^&/]+)/)?.[1]

        const valid = Boolean(valid_urls.includes(url) && valid_entities.includes(entities))
        return {valid, entities, filter, groupby, search}
    }
    useEffect(() => {
        const validateAsync = async (input) => {
            setParams(await validate(input))
        }
        validateAsync(input)
    }, [input])

    const handleSubmit = async () => {
        if (params.valid) {
            setQueryparams(params)
        }
    }
    return (
        <Stack direction="row" spacing={2} >
            <TextField fullWidth
                error={input ? !params.valid : false}
                label="OpenAlex Query"
                helperText="Paste an OpenAlex API query to retrieve a list of topics"
                value={input}
                onChange={(e) => setInput(e.target.value)}
            />
            <Button variant="contained" onClick={handleSubmit}>Submit</Button>
        </Stack>
    )
}

export default ApiQuerySelector
