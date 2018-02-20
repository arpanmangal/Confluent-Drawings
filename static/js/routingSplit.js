// JS file containing code for generating confluent drawings


var svgRouteSplit = d3.select("#routingGraph"),
    widthRouteSplit = +svgRouteSplit.attr("width"),
    heightRouteSplit = +svgRouteSplit.attr("height");

var simulationRouteSplit = d3.forceSimulation()
    .force("link", d3.forceLink().id(function (d) { return d.id; }))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(widthRouteSplit / 2, heightRouteSplit / 2));

function genRoutingGraphSplit(pathToJsonFile) {
    console.log("inside genRouting");
    d3.json(pathToJsonFile, function (error, graph) {
        if (error) throw error;

        graphToRoutingGraphSplit (graph, null);
        // Get the routing graph from the module data
        // graphToRoutingGraphSplit(graph, drawRoutingGraphSplit);
    });
}

function graphToRoutingGraphSplit(graph, cb) {
    var PGmodules = graph.PGmodules; // PG Modules
    var PGlinks = graph.PGlinks; // PG edges
    var graphNodes = graph.nodes; // Actual nodes

    var Nodes = {};

    // Add the routing nodes
    PGmodules.forEach(function (module) {
        var obj = {
            "isRouting": true,
            "internal": {},
            "external": {}
        }
        // console.log (obj);

        if (!Nodes[module.id]) {
            Nodes[module.id] = {
                "isRouting": true,
                "internal": {},
                "external": {}
            };
        }

        var elemNodes = module.elements.nodes;
        var elemModules = module.elements.modules;

        // Edges from current module to child nodes
        elemNodes.forEach(function (e) {
            Nodes[module.id].internal[e] = 1;
        });

        // Edges from current module to child modules
        elemModules.forEach(function (e) {
            Nodes[module.id].internal[e] = 1;
            if (!Nodes[e]) Nodes[e] = {
                "isRouting": true,
                "internal": {},
                "external": {}
            };
            Nodes[e].external[module.id] = 1;
            console.log ("adding ext edge between " + e + " and " + module.id);
        });

        // console.log (obj);

        // Nodes[module.id] = obj;
    });

    // Add the actual nodes
    graphNodes.forEach(function (node) {
        var obj = {
            "isRouting": false,
            "internal": {},
            "external": {}
        }

        Nodes[node.id] = obj;
    })

    // Computing external links
    PGlinks.forEach(function (link) {
        (Nodes[link.source].external)[link.target] = 1;
        (Nodes[link.target].external)[link.source] = 1;
    })

    // Split the routing nodes having internal >= 2 and external >= 2
    var splitedNodes = {};
    var splitedLinks = [];

    console.log (Nodes);
    for (var id in Nodes) {
        var node = Nodes[id];

        if (!node.isRouting) {
            // not a routing node
            var targets = Object.keys(node.external);
            targets.forEach(function (target) {
                splitedLinks.push({
                    "source": id,
                    "target": target
                });
            });

            splitedNodes[id] = 1;
        } else {
            // a routing node
            var internalNodes = Object.keys(node.internal);
            var externalNodes = Object.keys(node.external);

            // if both >= 2 then split the node
            if (internalNodes.length >= 2 && externalNodes.length >= 2) {
                console.log("splitting " + id);

                // split it
                var node1 = {
                    "id": id + "#1"
                };
                var node2 = {
                    "id": id + "#2"
                };

                // push the nodes
                splitedNodes[node1.id] = 1;
                splitedNodes[node2.id] = 1;

                // add the edges
                internalNodes.forEach(function (target) {
                    splitedLinks.push({
                        "source": node1.id,
                        "target": target
                    });
                });

                externalNodes.forEach(function (target) {
                    splitedLinks.push({
                        "source": node2.id,
                        "target": target
                    })
                });

                splitedLinks.push({
                    "source": node1.id,
                    "target": node2.id
                })
            } else {
                // no splitting required
                // push the nodes
                splitedNodes[id] = 1;

                // add the edges
                internalNodes.forEach(function (target) {
                    splitedLinks.push({
                        "source": id,
                        "target": target
                    });
                });

                externalNodes.forEach(function (target) {
                    splitedLinks.push({
                        "source": id,
                        "target": target
                    })
                });

            }
        }
    }

    // done analysing the nodes
    // clean edges
    var newLinks = [];
    splitedLinks.forEach (function (link) {
        if (splitedNodes[link.target]) {
            // valid link => add it to the links array
            newLinks.push(link);
        }
    });
    
    var splitedGraph = {
        "nodes": Object.keys(splitedNodes),
        "links": newLinks
    };
    console.log(splitedGraph);

}

function graphToRoutingGraphSplit2(graph, cb) {
    var routingGraph = {};

    // Push the nodes
    routingGraph.nodes = graph.nodes;
    // mark each node as not routingNode
    routingGraph.nodes.forEach(function (elem) {
        elem.isRouting = false;
    });
    // console.log(graph.modules);

    graph.PGmodules.forEach(function (elem) {
        routingGraph.nodes.push({
            "id": elem.id,
            "isRouting": true
        }); // Each module is a routing node
    });

    // Push the edges
    routingGraph.links = graph.PGlinks;
    graph.PGmodules.forEach(function (elem) {
        // console.log(elem);
        var elemNodes = elem.elements.nodes;
        var elemModules = elem.elements.modules;

        // console.log(elemNodes);
        // Edges from current module to child nodes
        elemNodes.forEach(function (e) {
            routingGraph.links.push({
                "source": elem.id,
                "target": e
            });
        });

        // Edges from current module to child modules
        elemModules.forEach(function (e) {
            routingGraph.links.push({
                "source": elem.id,
                "target": e
            });
        });

    });

    // everything done
    cb(routingGraph);
}

function genRoutingGraphSplitted(PGmodules, PGlinks) {
    var nodes = graph.nodes;
    var links = graph.links;

    // generate the total number of edges
    var edges = [];
}

function drawRoutingGraphSplit(graph) {
    // draw the routing graph
    console.log(graph);
    var line = d3.radialLine()
        .curve(d3.curveBundle.beta(0.85))
        .radius(function (d) { return d.y; })
        .angle(function (d) { return d.x });

    // var link = svgRouteSplit.append("g").selectAll(".links");
    // link = link
    //     .data(graph.links)
    //     .enter().append("path")
    //     .each(function (d) { d.source = d[0], d.target = d[d.length - 1]; })
    //     .attr("class", "links")
    //     .attr("d", line);

    var link = svgRouteSplit.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(graph.links)
        .enter().append("line");

    var node = svgRouteSplit.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(graph.nodes)
        .enter().append("circle")
        .attr("fill", function (d) { return d.isRouting ? "#7EC0EE" : "#333333" })
        .attr("r", 4.5)
        .call(d3.drag()
            .on("start", dragstartedRouteSplit)
            .on("drag", draggedRouteSplit)
            .on("end", dragendedRouteSplit));

    node.append("title")
        .text(function (d) { return d.id; });

    simulationRouteSplit
        .nodes(graph.nodes)
        .on("tick", ticked);

    simulationRouteSplit.force("link")
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

function dragstartedRouteSplit(d) {
    if (!d3.event.active) simulationRouteSplit.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function draggedRouteSplit(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function dragendedRouteSplit(d) {
    if (!d3.event.active) simulationRouteSplit.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}
