export const reduce_list = (list, key) => {
    return list.reduce((collector, item) => {
        collector[item[key]] = item;
        return collector;
    }, {});
}
