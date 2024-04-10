import { Stack, TextField, Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import { parseUrl, validateQueryparams, constructUrl } from "../lib/OpenAlex";

const ApiQueryInput = ({queryparams, setQueryparams, controller, setController}) => {
    const thiscontroller = "apiinput"
    const [input, setInput] = useState("")
    const [params, setParams] = useState({valid: false})

    useEffect(() => {
        setParams(parseUrl(input))
    }, [input])

    useEffect(() => {
        if (controller !== thiscontroller && validateQueryparams(queryparams)) {
            setInput(constructUrl({...queryparams, mailto: null}))
        }
    }, [queryparams, controller])

    const handleSubmit = () => {
        if (validateQueryparams(params)) {
            setController(thiscontroller)
            setQueryparams(params)
        }
    }
    return (
        <Stack spacing={2}>
            <TextField fullWidth
                error={input ? !validateQueryparams(params) : false}
                label="Paste an OpenAlex API query to retrieve a list of topics"
                value={input}
                onChange={(e) => setInput(e.target.value)}
            />
            <Button variant="contained" onClick={handleSubmit}>Submit API Query</Button>
        </Stack>
    )
}

export default ApiQueryInput
