var moduleData = {
    "PGmodules": null,
    "PGlinks": null
};

function getPGlayout(pathToJsonFile, powergraphgridlayout) {
    var colans = cola;
    function powerGraph() {
        var d3cola = colans.d3adaptor();

        d3.json(pathToJsonFile, function (error, graph) {
            var powerGraph;
            d3cola.nodes(graph.nodes).links(graph.links).powerGraphGroups(function (d) {
                powerGraph = d;
            }).start(10, 10, 10);
            
            // Get PG Modules
            var modules = [];
            powerGraph.groups.forEach(function (group) {
                // group is an object

                // add the current module
                modules.push({
                    "id": "Group" + group.id,
                    "elements": {
                        "nodes": [],
                        "modules": []
                    }
                });

                // add the child nodes
                if (group.leaves) {
                    group.leaves.forEach(function (leaf) {
                        modules[modules.length - 1].elements.nodes.push("" + leaf.name);
                    });
                }

                // add the child modules
                if (group.groups) {
                    group.groups.forEach(function (childGrp) {
                        modules[modules.length - 1].elements.modules.push("Group" + childGrp.id);
                    });
                };
            });

            moduleData.PGmodules = modules;


            // Get PG Links
            var PGlinks = [];
            powerGraph.powerEdges.forEach(function (Pedge) {
                // add the power edge to PGlinks
                PGlinks.push({
                    "source": Pedge.source.name || ("Group" + Pedge.source.id),
                    "target": Pedge.target.name || ("Group" + Pedge.target.id)
                });
            });

            moduleData.PGlinks = PGlinks;
        });

        d3.json(pathToJsonFile, function (error, graph) {
            // add nodes and links
            moduleData["nodes"] = [];
            moduleData["links"] = graph.links;
            graph.nodes.forEach(function (node) {
                moduleData.nodes.push({
                    "id": node.name
                });
            });
        });
    }
    powerGraph();
};