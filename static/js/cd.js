// JS file containing code for generating confluent drawings


var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function (d) { return d.id; }))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2));

function genConfluentDrawing (pathToJsonFile) {
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

    var dijkstra_graph = make_graph (routingEdges);

    var confluentEdges = [];

    // for each actual edge find the shortest path in the routing graph and render it as a curve later
    actualEdges.forEach (function (edge) {
        confluentEdges.push (dijkstra (dijkstra_graph, edge.source, edge.target));
    });

    var confluentGraph = {
        "nodes": routingNodes,
        "links": confluentEdges
    };

    // everything done
    console.log(confluentGraph);
    // cb(confluentGraph);
}

function drawConfluentDrawing (graph) {
    // draw the routing graph
    console.log(graph);
    var line = d3.line();
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

    var link = svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(graph.links)
        .enter().append("line");

    var node = svg.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(graph.nodes)
        .enter().append("circle")
        .attr("fill", function (d) { return d.isRouting ? "#7EC0EE" : "#333333" })
        .attr("r", 4.5)
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    node.append("title")
        .text(function (d) { return d.id; });

    simulation
        .nodes(graph.nodes)
        .on("tick", ticked);

    simulation.force("link")
        .links(graph.links);

    function ticked() {
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

// Return the links in the form of the shortest path from one actual node to another
function packageImports(nodes) {
    var map = {},
        imports = [];

    // Compute a map from name to node.
    nodes.forEach(function (d) {
        map[d.data.name] = d;
    });

    // For each import, construct a link from the source to target node.
    nodes.forEach(function (d) {
        if (d.data.imports) d.data.imports.forEach(function (i) {
            imports.push(map[d.data.name].path(map[i]));
        });
    });

    return imports;
}

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