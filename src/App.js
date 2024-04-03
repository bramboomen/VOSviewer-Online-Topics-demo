import { Autocomplete, Table, TableBody, TableContainer, TableHead, TableRow, TableCell, TextField, Button, LinearProgress } from "@mui/material";
import React, { useEffect, useState } from "react";
import { VOSviewerOnline } from "vosviewer-online";
import landscape_data from "./data/openalex_2023nov.json";

// OpenAlexApi generic query
const OpenAlexApi = async (entities="works", query="") => {
    const url = `https://api.openalex.org/${entities}?${query}`;
    const response = await fetch(encodeURI(url));
    const data = await response.json();
    console.log(url);
    return query.includes("group_by") ? data.group_by : data.results
}

// OpenAlexApi generic query using cursor pagination
const OpenAlexApiCursor = async (entities="works", query="") => {
    var cursor = "*";
    var result = [];
    while (cursor) {
        const url = `https://api.openalex.org/${entities}?cursor=${cursor}&${query}`;
        console.log(cursor, result.length);
        const response = await fetch(encodeURI(url));
        const data = await response.json();
        result = result.concat(query.includes("group_by") ? data.group_by : data.results)
        cursor = data.meta.next_cursor;
    }
    return result
}

// Convert from the Vosviewer topic id to the OpenAlex topic id
const topicOAid = (vos_topic_id) =>
    `https://openalex.org/T1${vos_topic_id.toString().padStart(4, "0")}`;

// Get the topics from the OpenAlex API
// Convert the resulting list to an Object with the topic id as key
const getTopics = async (filter="") => {
    const groupby = "group_by=primary_topic.id"
    var topic_counts = await OpenAlexApiCursor("works", `${filter}&${groupby}`);
    return topic_counts.reduce((topics, topic) => {
        topics[topic.key] = topic;
        return topics;
    }, {});
};

// Enrich the data with the topics from the OpenAlex API
const addTopics = (data, topics, alltopics) => {
    // create a new object, otherwise react will not register the state-change
    const combined_data = JSON.parse(JSON.stringify(data))
    combined_data.network?.items?.forEach((item) => {
        const count = topics[topicOAid(item.id)]?.count || 0
        const allcount = alltopics[topicOAid(item.id)]?.count
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

    // Collect the topics from the OpenaAlex API
    // Needs to be in a useEffect block because `fetch` is async
    useEffect(() => {
        const getTopicsAsync = async () => {
            setLoading(true)
            const results = await getTopics()
            setTopics(results);
            setInstitutionTopics(results);
            setLoading(false)
        };
        getTopicsAsync();
    }, []);

    // Collect the topics from the OpenaAlex API
    // Needs to be in a useEffect block because `fetch` is async
    useEffect(() => {
        const getTopicsAsync = async () => {
            setLoading(true)
            setInstitutionTopics(await getTopics(`filter=authorships.institutions.id:${institution}`));
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
        setKey((key) => key + 1);
    }, [data]);

    return (
        <>
            <VosViewer key={`vos${key}`} data={data}/>
            <div style={{ margin: 10 }}>
                <InstitutionsSelector institution={institution} setInstitution={setInstitution} />
            </div>
            <div style={{ margin: 10 }}>
                <pre>{`${Object.keys(topics).length} topics loaded`}</pre>
                <pre>{`${Object.keys(institutionTopics).length} institution topics loaded`}</pre>
            </div>
            { loading ? <LinearProgress /> : <LinearProgress variant="determinate" value={Object.keys(topics).length > 0 ? 100 : 0} /> }
            <TopicsTable data={data} />
        </>
    );
};

export default App;
