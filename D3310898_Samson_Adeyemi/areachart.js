// Load data from JSON file
d3.json("ICA.json").then(function(dataset) {
    // Set the dimensions and margins of the graph
    const margin = { top: 50, right: 80, bottom: 50, left: 80 },
        fullWidth = 1400,
        fullHeight = 800,
        marginLeft = 400,
        width = fullWidth - margin.left - margin.right,
        height = fullHeight - margin.top - margin.bottom;

    // Append the svg object to the body of the page
    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", fullWidth)
        .attr("height", fullHeight)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Select the data for the year you want to display
    let selectedYear = "2014";
    let selectedData = dataset[selectedYear];

    // List of groups = header of the dataset
    let keys = Object.keys(selectedData[0]).slice(1);

    // Add select options for year
    const yearSelectContainer = svg.append("foreignObject")
        .attr("class", "dropdown-container")
        .attr("width", 200)
        .attr("height", 30)
        .attr("x", width - 200) 
        .attr("y", 0)
        .append("xhtml:div");

    yearSelectContainer.append("span")
        .text("Year")
        .style("margin-right", "5px");                 

    const yearSelect = yearSelectContainer.append('select')
        .attr("id", "year-select")
        .attr("font-size", "18px")
        .on("change", function() {
            selectedYear = this.value;
            selectedData = dataset[selectedYear];
            keys = Object.keys(selectedData[0]).slice(1); 
            updateChart();
        });

    yearSelect.selectAll("option")
        .data(Object.keys(dataset))
        .enter()
        .append("option")
        .attr("value", d => d)
        .text(d => d);

    // Add x-axis
    const x = d3.scaleBand()
        .domain(selectedData.map(d => d.Month))
        .range([60, width])
        .paddingInner(0)
        .paddingOuter(0);
    svg.append("g")
        .attr("class", "x-axis") 
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x))
        .style("font-size", "18px");

    // Add x-axis label
    svg.append("text")
        .attr("class", "axis-label")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom)
        .text("Months")
        .style("font-size", "18px");

    // Add y-axis
    const y = d3.scaleLinear()
        .domain([0, d3.max(selectedData, d => d3.max(keys.map(key => d[key])))*2.5])
        .nice()
        .range([height, 0]);
    svg.append("g")
        .attr("class", "y-axis")
        .attr("transform", "translate(60,0)") 
        .call(d3.axisLeft(y))
        .style("font-size", "18px");

    // Add y-axis label
    svg.append("text")
        .attr("class", "axis-label")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left / 1.5)
        .text("Amount in dollars")
        .style("font-size", "18px");

    // Color palette
    const customColors = ["#86A7FC","#7F9F80","#FF9843"]
    const color = d3.scaleOrdinal(customColors)

    // Stack data
    const stackedData = d3.stack()
        .keys(keys)
        (selectedData);

    // Create area function
    const area = d3.area()
        .x(d => x.bandwidth() / 2 + x(d.data.Month))
        .y0(d => y(d[0]))
        .y1(d => y(d[1]));

    // Show the areas
    svg.selectAll("mylayers")
        .data(stackedData)
        .join("path")
        .attr("class", d => "myArea " + d.key)
        .style("fill", d => color(d.key))
        .attr("d", area)

        .on("mousemove", function(event, d) {
            const position = d3.pointer(event);
            const domainValue = Math.ceil(y.invert(position[1]));
            const profitValue = Math.ceil(d3.sum(d, d => d[1] - d[0]));
            d3.select(this).attr("opacity", 0.6);
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(`<strong>${d.key}</strong><br>Annual Profit: ${profitValue}<br><strong>Profit Value</strong>${domainValue}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px")
                .style("display", "block"); // Ensure the tooltip is displayed
        })
        .on("mouseout", function() {
            d3.select(this).attr("opacity", 1);
            tooltip.transition()
                .duration(500)
                .style("opacity", 0)
                .style("display", "none"); // Hide the tooltip
        });

    // Add tooltip
    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip");

    // Add labels to the Data points
    svg.selectAll(".text")
        .data(selectedData)
        .enter()
        .append("text")
        .attr("class", "label")
        .attr("x", d => x.bandwidth() / 2 + x(d.Month))
        .attr("y", d => y(d3.sum(keys, key => d[key])))
        .text(d => d3.format(",.0f")(d3.sum(keys, key => d[key])))
        .attr("text-anchor", "middle")
        .attr("dy", "-10px")
        .style("font-size", "15px");

    function updateChart() {
        // Update x domain
        x.domain(selectedData.map(d => d.Month));
        // Update y domain
        y.domain([0, d3.max(selectedData, d => d3.max(keys.map(key => d[key])))*2.5]);
        // Update x axis
        svg.select(".x-axis")
            .transition()
            .duration(500)
            .call(d3.axisBottom(x));
        // Update y axis
        svg.select(".y-axis")
            .transition()
            .duration(500)
            .call(d3.axisLeft(y));
        // Update areas
        const stackedData = d3.stack()
            .keys(keys)
            (selectedData);
        svg.selectAll(".myArea")
            .data(stackedData)
            .transition()
            .duration(500)
            .attr("d", area);
        // Update labels
        svg.selectAll(".label")
            .data(selectedData)
            .transition()
            .duration(500)
            .attr("x", d => x.bandwidth() / 2 + x(d.Month))
            .attr("y", d => y(d3.sum(keys, key => d[key])))
            .text(d => d3.format(",.0f")(d3.sum(keys, key => d[key])));
    }
});