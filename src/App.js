import { Autocomplete, Table, TableBody, TableContainer, TableHead, TableRow, TableCell, TextField, Button, LinearProgress } from "@mui/material";
import React, { useEffect, useState } from "react";
import { VOSviewerOnline } from "vosviewer-online";
import landscape_data from "./data/openalex_2023nov.json";
import { OpenAlexApi, OpenAlexApiCursor } from "./lib/OpenAlex"
import { topicOAid, getTopics } from "./lib/OpenAlex-Topics"


// Enrich the data with the topics from the OpenAlex API
const addTopics = (data, topics, alltopics) => {
    // create a new object, otherwise react will not register the state-change
    const combined_data = JSON.parse(JSON.stringify(data))
    combined_data.network?.items?.forEach((item) => {
        const id = topicOAid(item.id)
        const count = topics[id]?.count || 0
        const allcount = alltopics[id]?.count
        item.scores["OpenAlex Topic P"] = allcount > 0 ? count / allcount : 0 || 0
        item.weights["OpenAlex Topic Count"] = count || 0
    });
    return combined_data
}

const VosViewer = ({data}) => {
    return (
        <div style={{width: "1100px", height: "700px", border: "lightpink solid 5px"}}>
            <VOSviewerOnline data={data} parameters={{ scale: 1.0, item_size: 2 }} />
        </div>
    )
}

const TopicsTable = ({data}) => {
    return (
        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell align="right">Label</TableCell>
                        <TableCell align="right">Count</TableCell>
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
                                </TableRow>
                            );
                        })}
                </TableBody>
            </Table>
        </TableContainer>
    )
}

const InstitutionsSelector = ({institution, setInstitution}) => {
    const [input, setInput] = useState("")
    const [suggestions, setSuggestions] = useState({})

    useEffect(() => {
        const autocomplete = async (input) => {
            const results = await OpenAlexApi("autocomplete/institutions", `q=${input}`)
            const suggestions_obj = results.reduce((results_obj, result) => {
                results_obj[result.display_name] = result;
                return results_obj;
            }, {});
            setSuggestions(suggestions_obj)
        }
        autocomplete(input)
    }, [input]);

    return (
        <>
            <Autocomplete
                freeSolo
                autoHighlight
                autoSelect
                id="institutionselector"
                options={ Object.keys(suggestions) }
                onChange={(_event, value) => setInstitution(suggestions[value]?.id)}
                inputValue={input}
                onInputChange={(_event, value) => setInput(value)}
                renderInput={(params) => <TextField {...params} label="Institution" />}
            />
            <pre>Selected: {institution}</pre>
        </>
    )
}

const App = () => {
    const [data, setData] = useState(landscape_data);

    const [topics, setTopics] = useState({});
    const [institution, setInstitution] = useState("")
    const [institutionTopics, setInstitutionTopics] = useState({});

    const [key, setKey] = useState(0);
    const [loading, setLoading] = useState(false);
    const [reload, setReload] = useState(false);

    // Collect the topics from the OpenaAlex API
    // Needs to be in a useEffect block because `fetch` is async
    useEffect(() => {
        const getTopicsAsync = async () => {
            setLoading(true)
            setTopics(await getTopics())
            setLoading(false)
        };
        getTopicsAsync();
    }, []);

    // Collect the topics from the OpenaAlex API
    // Needs to be in a useEffect block because `fetch` is async
    useEffect(() => {
        const getTopicsAsync = async () => {
            setLoading(true)
            setInstitutionTopics(await getTopics(`filter=authorships.institutions.id:${institution}`))
            setLoading(false)
        };
        if (institution) {
            getTopicsAsync()
        }
    }, [institution]);

    useEffect(() => {
        setData(data => addTopics(data, institutionTopics, topics))
    }, [institutionTopics, topics])

    // Make sure the VOSviewerOnline component is re-created when the data is updated
    useEffect(() => {
        if (reload) {
            setKey((key) => key + 1);
        }
        setReload(false)
    }, [reload]);

    return (
        <>
            <VosViewer key={`vos${key}`} data={data}/>
            <Button onClick={() => setReload(true)}>Reload</Button>
            <div style={{ margin: 10 }}>
                <InstitutionsSelector institution={institution} setInstitution={setInstitution} />
            </div>
            <div style={{ margin: 10 }}>
                <pre>{`${Object.keys(topics).length} topics loaded`}</pre>
                <pre>{`${Object.keys(institutionTopics).length} institution topics loaded`}</pre>
            </div>
            {loading ? <LinearProgress /> : null }
            <TopicsTable data={data} />
        </>
    );
};

export default App;
