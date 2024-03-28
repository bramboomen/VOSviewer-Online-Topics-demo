import React, { useEffect, useState } from "react";
import { VOSviewerOnline } from "vosviewer-online";
import landscape_data from "./data/openalex_2023nov.json";

// OpenAlexApi generic query using cursor pagination
const OpenAlexApi = async (entities="works", query="") => {
    var cursor = "*";
    var result = [];
    while (cursor) {
        const url = `https://api.openalex.org/${entities}?cursor=${cursor}&${query}`;
        console.log(cursor, result.length);
        const response = await fetch(url);
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
const getTopics = async () => {
    var topic_counts = await OpenAlexApi("works", "group_by=primary_topic.id");
    return topic_counts.reduce((topics, topic) => {
        topics[topic.key] = topic;
        return topics;
    }, {});
};

// Enrich the data with the topics from the OpenAlex API
const addTopics = (data, topics={}) => {
    if (Object.keys(topics).length === 0) return data;
    data.network?.items?.forEach((item) => {
        item.weights["OpenAlex Topic Count"] = topics[topicOAid(item.id)]?.count || 0;
    });
    // create a new object, otherwise react will not register the state-change
    return JSON.parse(JSON.stringify(data))
};

const App = () => {
    const [topics, setTopics] = useState({});
    const [data, setData] = useState(landscape_data);
    const [key, setKey] = useState(0);
    const [loading, setLoading] = useState(false);

    // Collect the topics from the OpenaAlex API
    // Needs to be in a useEffect block because `fetch` is async
    useEffect(() => {
        const getTopicsAsync = async () => {
            setLoading(true)
            setTopics(await getTopics());
            setLoading(false)
        };
        getTopicsAsync();
    }, []);

    // When the topics are updated, add the topics to the data
    useEffect(() => {
        setData(addTopics(landscape_data, topics));
    }, [topics]);

    // Make sure the VOSviewerOnline component is re-created when the data is updated
    useEffect(() => {
        setKey((key) => key + 1);
    }, [data]);

    return (
        <>
            <div style={{width: "1100px", height: "700px", border: "lightpink solid 5px"}}>
                <VOSviewerOnline key={`vos${key}`} data={data} parameters={{ scale: 1.0 }} />
            </div>
            <pre style={{ margin: 10 }}>{loading ? "Loading topics..." : `${Object.keys(topics).length} Topics loaded`}</pre>
            <table style={{ margin: 10 }}>
                <thead>
                    <tr>
                        <td>
                            <b>ID</b>
                        </td>
                        <td>
                            <b>Label</b>
                        </td>
                        <td>
                            <b>Count</b>
                        </td>
                    </tr>
                </thead>
                <tbody>
                    {data.network.items
                        .sort((item1, item2) => item1.weights["OpenAlex Topic Count"] < item2.weights["OpenAlex Topic Count"])
                        .map((item) => {
                            return (
                                <tr>
                                    <td>{item.id}</td>
                                    <td>{item.label}</td>
                                    <td>{item.weights["OpenAlex Topic Count"]}</td>
                                </tr>
                            );
                        })}
                </tbody>
            </table>
        </>
    );
};

export default App;
