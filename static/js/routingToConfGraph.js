function routingToConfGraph (graph) {

    // Nodes
    routingNodes = graph.nodes;

    // Edges
    routingEdges = graph.links;

    // Actual Edges (without the routing node)
    actualEdges = graph.actualLinks;

    var dijkstra_graph = make_graph(routingEdges);

    var confluentEdges = [];

    // for each actual edge find the shortest path in the routing graph and render it as a curve later
    actualEdges.forEach(function (edge) {
        confluentEdges.push(dijkstra(dijkstra_graph, edge.source, edge.target));
    });

    var confluentGraph = {
        "nodes": routingNodes,
        "links": routingEdges,
        "confLinks": confluentEdges
    };

    // everything done
    return confluentGraph;
}