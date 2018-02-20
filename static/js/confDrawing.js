// JS file containing code for generating confluent drawings without removing the crossing links

var svgConf = d3.select("#ConfDrawing"),
    widthConf = +svgConf.attr("width"),
    heightConf = +svgConf.attr("height");

var simulationConf = d3.forceSimulation()
    .force("link", d3.forceLink().id(function (d) {return d.id; }))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(widthConf / 2, heightConf / 2));

function genConfluentDrawing(pathToJsonFile) {
    d3.json(pathToJsonFile, function (error, graph) {
        if (error) throw error;

        // Get the routing graph from the module data
        var routingGraphSplit = graphToRoutingGraphSplit (graph);

        var confGraph = routingToConfGraph (routingGraphSplit);
        drawConfluentDrawing (confGraph);
    });
}


function graphToRoutingGraphCD(graph) {

    // Push the nodes
    routingNodes = graph.nodes;

    // // mark each node as not routingNode
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
    console.log(graph);


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
    drawConfluentDrawing(confluentGraph);
}

function drawConfluentDrawing(graph) {
    // draw the routing graph

    // creating the mapping between index and id in graph.nodes
    var mapping = {};
    graph.nodes.forEach (function (node, i) {
        mapping[node.id] = i;
    });

    var link = svgConf.append("g")
        .attr("class", "invisible")
        .selectAll("line")
        .data(graph.links)
        .enter().append("line");


    var node = svgConf.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(graph.nodes)
        .enter().append("circle")
        .attr("fill", function (d) { return d.isRouting ? "#7EC0EE" : "#333333" })
        .attr("r", function (d) {return d.isRouting ? 0.5 : 4.5})
        .call(d3.drag()
            .on("start", dragstartedConf)
            .on("drag", draggedConf)
            .on("end", dragendedConf));

    var curvedLine = d3.line()
        .curve(d3.curveBasis);
        // .x(function (d) { return d.x })
        // .y(function (d) { return d.y });

    var curvedLink = svgConf.append("g")
        .attr("class", "confs")
        .selectAll("path")
        .data(graph.confLinks)
        .enter().append("path")

    node.append("title")
        .text(function (d) { return d.id; });

    simulationConf
        .nodes(graph.nodes)
        .on("tick", ticked);

    simulationConf.force("link")
        .links(graph.links);

    function ticked() {
        curvedLink
            .attr("d", function (d) {
                var points = [];
                d.forEach(function (node) {
                    points.push([graph.nodes[mapping[node]].x, [graph.nodes[mapping[node]].y]]);
                });
                return curvedLine(points);
            })

        link
            .attr("x1", function (d) { return d.source.x; })
            .attr("y1", function (d) { return d.source.y; })
            .attr("x2", function (d) { return d.target.x; })
            .attr("y2", function (d) { return d.target.y; });

        node
            .attr("cx", function (d) { return d.x; })
            .attr("cy", function (d) { return d.y; });
    }
}

function dragstartedConf(d) {
    if (!d3.event.active) simulationConf.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function draggedConf(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function dragendedConf(d) {
    if (!d3.event.active) simulationConf.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}