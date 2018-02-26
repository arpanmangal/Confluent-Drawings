// Uses graph.js, an implementation of dijkstra's to compute the shortest path between the two nodes

function make_graph (links) {
    
    var map = {};

    // constructing the graph
    links.forEach (function ({"source": s, "target": t}) {
        if (!map[s]) map[s] = {};
        if (!map[t]) map[t] = {};

        (map[s])[t] = 1;
        (map[t])[s] = 1;
    });

    return new Graph (map);
}

function dijkstra (graph, node1, node2) {
    return graph.findShortestPath (node1, node2);
}