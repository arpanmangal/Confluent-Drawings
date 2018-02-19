// JS file containing code for generating confluent drawings


var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var simulation = d3.forceSimulation()
    .force("linkAbs", d3.forceLink().id(function (d) {return d.id; }))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2));

function genConfluentDrawing(pathToJsonFile) {
    console.log("inside genConfluentDrawing");
    d3.json(pathToJsonFile, function (error, graph) {
        if (error) throw error;

        // Get the routing graph from the module data
        graphToRoutingGraphCD(graph, drawConfluentDrawing);
    });
}

function graphToRoutingGraphCD(graph, cb) {
    // var routingGraph = {};

    // Push the nodes
    routingNodes = graph.nodes;
    // routingGraph.nodes = graph.nodes;
    // mark each node as not routingNode
    routingNodes.forEach(function (elem) {
        elem.isRouting = false;
    });
    // console.log(graph.modules);

    graph.modules.forEach(function (elem) {
        routingNodes.push({
            "id": elem.id,
            "isRouting": true
        }); // Each module is a routing node
    });

    // Push the edges
    routingEdges = graph.links;
    // routingGraph.links = graph.links;

    graph.modules.forEach(function (elem) {
        // console.log(elem);
        var elemNodes = elem.elements.nodes;
        var elemModules = elem.elements.modules;

        // console.log(elemNodes);
        // Edges from current module to child nodes
        elemNodes.forEach(function (e) {
            routingEdges.push({
                "source": elem.id,
                "target": e
            });
        });

        // Edges from current module to child modules
        elemModules.forEach(function (e) {
            routingEdges.push({
                "source": elem.id,
                "target": e
            });
        });

    });

    // Actual Edges (without the routing node)
    actualEdges = graph.nodeLinks;

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
    console.log(confluentGraph);
    cb(confluentGraph);
}

function drawConfluentDrawing(graph) {
    // draw the routing graph
    console.log(graph);

    // creating the mapping between index and id in graph.nodes
    var mapping = {};
    graph.nodes.forEach (function (node, i) {
        mapping[node.id] = i;
    });
    console.log(mapping);

    // var line = d3.line();
    // .curve(d3.curveBasis)
    // .x(function (d) {console.log(d);return d.x})
    // .y(function (d) {return d.y})
    // .curve(d3.curveBundle.beta(0.85))
    // .radius(function (d) { return d.y; })
    // .angle(function (d) { return d.x });

    // var link = svg.append("g").selectAll(".links");
    // link = link
    //     .data(graph.links)
    //     .enter().append("path")
    //     .each(function (d) { d.source = d[0], d.target = d[d.length - 1]; })
    //     .attr("class", "links")
    //     .attr("d", line);

    // var link = svg.append("g")
    //     .attr("class", "links")
    //     .selectAll("line")
    //     .data(graph.links)
    //     .enter().append("path")
    //     .each (function (d) {d.source = d[0], d.taget = d[d.length - 1]})
    //     .attr("d", line);

    var linkArpan = svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(graph.links)
        .enter().append("line");


    var nodeArpan = svg.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(graph.nodes)
        .enter().append("circle")
        .attr("fill", function (d) { return d.isRouting ? "#7EC0EE" : "#333333" })
        .attr("r", function (d) {return d.isRouting ? 0.5 : 4.5})
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    var curvedLine = d3.line()
        .curve(d3.curveBasis);
        // .x(function (d) { return d.x })
        // .y(function (d) { return d.y });

    var confArpan = svg.append("g")
        .attr("class", "confs")
        .selectAll("path")
        .data(graph.confLinks)
        // .data(points)
        .enter().append("path")
        // .attr("d", pathData)
        // .attr("stroke", "green")
        // .attr("fill", "none")
        // .attr("stroke-width", "1px");
    // setTimeout(function () {
    //     console.log('hi');

    //     console.log(graph.nodes);
    //     var points = [
    //       7  { x: graph.nodes[2].x, y: graph.nodes[2].y },
    //         { x: graph.nodes[8].x, y: graph.nodes[8].y },
    //         { x: graph.nodes[9].x, y: graph.nodes[9].y },
    //         { x: graph.nodes[3].x, y: graph.nodes[3].y }
    //     ];

    //     var pathData = curvedLine(points);
    //     console.log(pathData);
    //     var test = svg.append("g")
    //         .selectAll("path")
    //         .data([1])
    //         // .data(points)
    //         .enter().append("path")
    //         .attr("d", pathData)
    //         .attr("stroke", "green")
    //         .attr("fill", "none")
    //         .attr("stroke-width", "1px");

    //     console.log(graph.nodes);
    // }, 2000);

    // var link = svg.append("g")
    //     .attr("class", "links")
    //     .selectAll("line")
    //     .data(graph.links)
    //     .enter().append("path")
    //     .each (function (d) {d.source = d[0], d.taget = d[d.length - 1]})
    //     .attr("d", line);

    nodeArpan.append("title")
        .text(function (d) { return d.id; });

    simulation
        .nodes(graph.nodes)
        .on("tick", ticked);

    simulation.force("linkAbs")
        .links(graph.links);

    function ticked() {
        confArpan
            .attr("d", function (d) {
                var points = [];
                d.forEach(function (node) {
                    points.push([graph.nodes[mapping[node]].x, [graph.nodes[mapping[node]].y]]);
                });
                return curvedLine(points);
            })

        linkArpan
            .attr("x1", function (d) { return d.source.x; })
            .attr("y1", function (d) { return d.source.y; })
            .attr("x2", function (d) { return d.target.x; })
            .attr("y2", function (d) { return d.target.y; });

        nodeArpan
            .attr("cx", function (d) { return d.x; })
            .attr("cy", function (d) { return d.y; });
    }
}

// Return the links in the form of the shortest path from one actual node to another
// function packageImports(nodes) {
//     var map = {},
//         imports = [];

//     // Compute a map from name to node.
//     nodes.forEach(function (d) {
//         map[d.data.name] = d;
//     });

//     // For each import, construct a link from the source to target node.
//     nodes.forEach(function (d) {
//         if (d.data.imports) d.data.imports.forEach(function (i) {
//             imports.push(map[d.data.name].path(map[i]));
//         });
//     });

//     return imports;
// }

function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}
