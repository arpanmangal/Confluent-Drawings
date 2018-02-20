function routingToConfGraph (graph) {

    // Push the nodes
    routingNodes = graph.nodes;

    // mark each node as not routingNode
    // routingNodes.forEach(function (elem) {
    //     elem.isRouting = false;
    // });

    // // Add the 'modules' nodes
    // graph.PGmodules.forEach(function (elem) {
    //     routingNodes.push({
    //         "id": elem.id,
    //         "isRouting": true
    //     }); // Each module is a routing node
    // });

    // Push the edges
    routingEdges = graph.links;

    // graph.PGmodules.forEach(function (elem) {
    //     var elemNodes = elem.elements.nodes;
    //     var elemModules = elem.elements.modules;

    //     // Edges from current module to child nodes
    //     elemNodes.forEach(function (e) {
    //         routingEdges.push({
    //             "source": elem.id,
    //             "target": e
    //         });
    //     });

    //     // Edges from current module to child modules
    //     elemModules.forEach(function (e) {
    //         routingEdges.push({
    //             "source": elem.id,
    //             "target": e
    //         });
    //     });

    // });

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
    // cb(confluentGraph);
}