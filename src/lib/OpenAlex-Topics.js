import { OpenAlexApiCursor } from "./OpenAlex"
import { reduce_list } from "./utils";

// Convert from the Vosviewer topic id to the OpenAlex topic id
export const topicOAid = (vos_topic_id) =>
    `https://openalex.org/T1${vos_topic_id.toString().padStart(4, "0")}`;

// Get the topics from the OpenAlex API
// Convert the resulting list to an Object with the topic id as key
export const getTopics = async (filter="") => {
    const groupby = "group_by=primary_topic.id"
    var topic_counts = await OpenAlexApiCursor("works", `${filter}&${groupby}`);
    return reduce_list(topic_counts, "key")
};
