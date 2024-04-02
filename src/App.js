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
const addTopics = (data, topics={}) => {
    if (Object.keys(topics).length === 0) return data;
    // create a new object, otherwise react will not register the state-change
    const combined_data = JSON.parse(JSON.stringify(data))
    combined_data.network?.items?.forEach((item) => {
        item.weights["OpenAlex Topic Count"] = topics[topicOAid(item.id)]?.count || 0;
    });
    return combined_data
};

const VosViewer = ({data, topics}) => {
    return (
        <div style={{width: "1100px", height: "700px", border: "lightpink solid 5px"}}>
            <VOSviewerOnline data={addTopics(data, topics)} parameters={{ scale: 1.0, item_size: 2 }} />
        </div>
    )
}

const TopicsTable = ({data, topics}) => {
    const combined_data = addTopics(data, topics)
    return (
        <table style={{ margin: 10 }}>
            <thead>
                <tr>
                    <td><b>ID</b></td>
                    <td><b>Label</b></td>
                    <td><b>Count</b></td>
                </tr>
            </thead>
            <tbody>
                {combined_data.network.items
                    .sort((item1, item2) => item1.weights["OpenAlex Topic Count"] < item2.weights["OpenAlex Topic Count"])
                    .map((item) => {
                        return (
                            <tr key={item.id}>
                                <td>{item.id}</td>
                                <td>{item.label}</td>
                                <td>{item.weights["OpenAlex Topic Count"]}</td>
                            </tr>
                        );
                    })}
            </tbody>
        </table>
    )
}

const InstitutionsSelector = ({institution, setInstitution}) => {
    const [input, setInput] = useState("")
    const [suggestions, setSuggestions] = useState([])

    useEffect(() => {
        const autocomplete = async (input) => {
            const results = await OpenAlexApi("autocomplete/institutions", `q=${input}`)
            setSuggestions(results)
            setInstitution(results[0]?.id)
        }
        if (input) {
            autocomplete(input)
        } else {
            setSuggestions([])
            setInstitution("")
        }
    }, [input]);

    return (
        <>
            <input defaultValue="input" value={input} onChange={e => setInput(e.target.value)} />
            <button key="clear" onClick={() => setInput("")}>Clear</button>
            <pre>Selected: {institution}</pre>
            <ul>
                { suggestions?.map(s => <li key={s.id} style={{ cursor: "pointer" }}><pre onClick={() => setInput(s.display_name)}>{s.display_name.slice(0, 40)}</pre></li>) }
            </ul>
        </>
    )
}

const App = () => {
    const [topics, setTopics] = useState({});
    const [institution, setInstitution] = useState("")

    const [key, setKey] = useState(0);
    const [load, setLoad] = useState(false);
    const [loading, setLoading] = useState(false);

    // Collect the topics from the OpenaAlex API
    // Needs to be in a useEffect block because `fetch` is async
    useEffect(() => {
        const getTopicsAsync = async () => {
            var filter = ""
            if (institution) { filter += `authorships.institutions.id:${institution}`}
            setLoading(true)
            setTopics(await getTopics(filter ? `filter=${filter}` : ""));
            setLoading(false)
        };
        if (load) {
            getTopicsAsync();
            setLoad(false);
        }
    }, [load]);

    // Make sure the VOSviewerOnline component is re-created when the data is updated
    useEffect(() => {
        setKey((key) => key + 1);
    }, [topics]);

    return (
        <>
            <VosViewer key={`vos${key}`} data={landscape_data} topics={topics}/>
            <div style={{ margin: 10 }}>
                <InstitutionsSelector institution={institution} setInstitution={setInstitution} />
            </div>
            <div style={{ margin: 10 }}>
                <button onClick={ () => setLoad(true) }>Load topics</button>
                <pre>{loading ? "Loading topics..." : `${Object.keys(topics).length} Topics loaded`}</pre>
            </div>
            <TopicsTable data={landscape_data} topics={topics} />
        </>
    );
};

export default App;
