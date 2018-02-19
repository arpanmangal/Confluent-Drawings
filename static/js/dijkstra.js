// Uses graph.js, an implementation of dijkstra's to compute the shortest path between the two nodes

function dijkstra (links, node1, node2) {
    
    var map = {};

    // constructing the graph
    links.forEach (function ({"source": s, "target": t}) {
        if (!map[s]) map[s] = {};
        if (!map[t]) map[t] = {};

        (map[s])[t] = 1;
        (map[t])[s] = 1;
    });

    var graph = new Graph (map);

    console.log(graph);
    console.log(graph.findShortestPath(node1, node2));
}