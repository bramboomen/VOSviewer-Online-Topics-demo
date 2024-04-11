import { Stack, Button, CircularProgress, Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import { VOSviewerOnline } from "vosviewer-online";
import landscape_data from "./data/openalex_2023nov.json";
import { OpenAlexApiCursor } from "./lib/OpenAlex"
import { reduce_list, tryJSONParse } from "./lib/utils";
import TopicsTable from "./components/TopicsTable";
import { Replay } from "@mui/icons-material";
import Filters from "./components/Filters";


// Enrich the data with the topics from the OpenAlex API
export const topicOAid = (vos_topic_id) =>
    `https://openalex.org/T1${vos_topic_id.toString().padStart(4, "0")}`;

const addTopics = (data, topics, alltopics) => {
    // create a new object, otherwise react will not register the state-change
    const combined_data = tryJSONParse(JSON.stringify(data))
    combined_data.network?.items?.forEach((item) => {
        const id = topicOAid(item.id)
        const count = topics[id]?.count || 0
        const total_count = alltopics[id]?.count || 0
        item.scores["OpenAlex Topic Score"] = total_count > 0 ? count / total_count : 0
        item.weights["OpenAlex Topic Count"] = count
        item.weights["OpenAlex Topic Total Count"] = total_count
    });
    return combined_data
}

const VosViewer = ({data, loading}) => {
    return (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            bgcolor="lightpink"
            width={1100}
            height={700}
            border="lightpink solid 5px"
        >
            { loading ? <CircularProgress /> : <VOSviewerOnline data={data} parameters={{ scale: 1.0, item_size: 2 }} /> }
        </Box>
    )
}

const App = () => {
    const [data, setData] = useState(landscape_data);

    const [allTopics, setAllTopics] = useState({});
    const [topics, setTopics] = useState({});

    const [key, setKey] = useState(0);
    const [loading, setLoading] = useState(false);

    const [queryparams, setQueryparams] = useState({})

    useEffect(() => {
        const getTopicsAsync = async () => {
            setLoading(true)
            const localAllTopics = tryJSONParse(localStorage.getItem('allTopics'))
            if (Object.keys(localAllTopics).length > 0) {
                setAllTopics(localAllTopics)
            } else {
                const remoteAllTopics = reduce_list(await OpenAlexApiCursor({path: "/works", group_by: "primary_topic.id"}), "key")
                setAllTopics(remoteAllTopics)
                localStorage.setItem('allTopics', JSON.stringify(remoteAllTopics))
            }
            setTimeout(() => setLoading(false), 500)
        }
        if (Object.keys(allTopics).length === 0) {
            getTopicsAsync()
        }
    }, [allTopics])

    useEffect(() => {
        const getTopicsAsync = async (queryparams) => {
            setLoading(true)
            setTopics(reduce_list(await OpenAlexApiCursor({...queryparams, group_by: "primary_topic.id"}), "key"))
            setTimeout(() => setLoading(false), 500)
        };
        getTopicsAsync(queryparams)
    }, [queryparams])

    useEffect(() => {
        setData(data => addTopics(data, topics, allTopics))
    }, [topics, allTopics])

    // Make sure the VOSviewerOnline component is re-created when the data is updated
    const VosViewerReRender = () => {
        setKey((key) => key + 1);
    }

    return (
        <>
            <VosViewer key={`vos${key}`} data={data} loading={loading}/>
            <Button color="error" onClick={VosViewerReRender} startIcon={<Replay />}>Reload</Button>
            <Filters apply={setQueryparams} />
            <Stack spacing={2} sx={{ margin: 2 }} width={1000}>
                <pre>{`${Object.keys(topics).length}/${Object.keys(allTopics).length} topics loaded`}</pre>
                <TopicsTable data={data} />
            </Stack>
        </>
    );
};

export default App;
