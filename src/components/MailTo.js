import { TextField } from "@mui/material"
import { useState, useEffect } from "react";

const MailToInput = () => {
    const [input, setInput] = useState(localStorage.getItem('mailto'))
    function validateInput(email) {
        var re = /\S+@\S+\.\S+/;
        return re.test(email);
    }
    useEffect(() => {
        if (validateInput(input)) {
            localStorage.setItem('mailto', input)
        }
    }, [input])
    return (
        <TextField fullWidth
            error={input ? !validateInput(input) : false}
            label="E-mail address"
            value={input}
            onChange={(e) => setInput(e.target.value)}
        />
    )
}

export default MailToInput
