const margin = {
    top: 80,
    right: 100,
    bottom: 40,
    left: 80 // Adjusted left margin to accommodate longer y-axis labels
};
const w = 1000 - margin.left - margin.right;
const h = 800 - margin.top - margin.bottom;
// append the svg object to the body of the page
const svg = d3.select("svg")
    .attr("width", w + margin.left + margin.right)
    .attr("height", h + margin.top + margin.bottom);
const chart = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Define yAxisGroup
const yAxisGroup = chart.append('g')
    .attr("class", "y axis")
    .attr('transform', 'translate(0,0)'); //translate(x,y)

const xAxisGroup = chart.append('g')
    .attr("class", "x axis")
    .attr("transform", `translate(0, ${h})`); // Positioned x-axis at the bottom

// Read the sales data
d3.json("global.json").then(function (data) {
    // Function to update chart based on selected region
    function updateChart(data) {
        const selectedRegion = d3.select("#RegionSelect").property("value");
        let filteredData = data;
        if (selectedRegion !== "Select All") {
            filteredData = data.filter(d => d.Region === selectedRegion);
        }


        // Aggregate data by country and calculate total quantity, total sales revenue, and total sales
        const aggregatedData = d3.rollup(filteredData,
            v => ({
                Quantity: d3.sum(v, d => d.Quantity),
                Total_Sales_Revenue: d3.sum(v, d => d.Total_Sales_Revenue),
                Sales: d3.sum(v, d => d.Sales) // Aggregate Sales attribute
            }),
            d => d.Country
        );

        // Convert aggregated data to array of objects
        const aggregatedArray = Array.from(aggregatedData, ([Country, values]) => ({
            Country,
            Quantity: values.Quantity,
            Total_Sales_Revenue: values.Total_Sales_Revenue,
            Sales: values.Sales
        }));



        // Calculate maximum values based on entire dataset
        const maxX = d3.max(aggregatedArray, d => d.Quantity);
        const maxY = d3.max(aggregatedArray, d => d.Total_Sales_Revenue);

        // Y-axis
        const yScale = d3.scaleLinear()
            .domain([0, maxY])
            .range([h, 0]); // Reversed range to properly position the y-axis
        const yAxis = d3.axisLeft(yScale).ticks(10).tickSizeOuter(0);

        // Update Y-axis
        yAxisGroup.call(yAxis);
        yAxisGroup.select("text.axis-title").remove(); // Remove existing axis title
        yAxisGroup.append("text")
            .attr("class", "axis-title")
            .text("Total Sales Revenue")
            .attr("transform", "rotate(-90)")
            .attr("x", -h / 2)
            .attr("y", -margin.left / 1.3) // Adjusted y position to align with axis
            .style("fill", "blue")
            .attr("font-size", 20)
            .attr("text-anchor", "middle");

        // X-axis
        const xScale = d3.scaleLinear()
            .domain([0, maxX])
            .range([0, w]);
        const xAxis = d3.axisBottom(xScale).ticks(10).tickSizeOuter(0);
        // Update X-axis
        xAxisGroup.call(xAxis);
        xAxisGroup.select("text.axis-title").remove(); // Remove existing axis title
        xAxisGroup.append("text")
            .attr("class", "axis-title")
            .text("Quantity")
            .attr("x", w / 2)
            .attr("y", margin.bottom / 1.3) // Adjusted y position to align with axis
            .style("fill", "blue")
            .attr("font-size", 20)
            .attr("text-anchor", "middle");


        // Get unique countries
        const uniqueCountries = [...new Set(aggregatedArray.map(d => d.Country))];

        // Scale for size of bubbles
        const z = d3.scaleSqrt()
            .domain([0, d3.max(aggregatedArray, d => d.Total_Sales_Revenue)])
            .range([1, 40]);

        // Scale for color of bubbles
        const color = d3.scaleOrdinal(d3.schemeCategory10);

        chart.selectAll(".bubble")
            .data(aggregatedArray)
            .enter().append("circle")
            .attr("class", "bubble")
            .attr("cx", d => xScale(d.Quantity))
            .attr("cy", d => yScale(d.Total_Sales_Revenue))
            .attr("r", d => z(d.Total_Sales_Revenue)) // Set bubble size based on total sales revenue
            .style("fill", d => color(d.Country)) // Use country for color
            .style("opacity", 0.7)
            .on("mouseover", function (event, d) {
                const countryData = d;
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html("<strong>" + "Country: " + countryData.Country + "</strong><br>Sales: $" + countryData.Sales.toLocaleString(2) + "<br>Quantity: " + countryData.Quantity.toLocaleString(2) + "<br>Total Sales Revenue: $" + countryData.Total_Sales_Revenue.toLocaleString(2))
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY - 28) + "px");
                d3.select(this)
                    .classed("bounce", true) // Add bounce effect
                    .transition() // Apply transition for smooth effect
                    .duration(200) // Duration of transition
                    .attr("r", d => z(d.Total_Sales_Revenue) * 1.5); // Increase radius based on sales

                // Show label with animation
                chart.selectAll(".label")
                    .data([countryData])
                    .join("text")
                    .attr("class", "label")
                    .attr("x", d => xScale(d.Quantity))
                    .attr("y", d => yScale(d.Total_Sales_Revenue) - z(d.Total_Sales_Revenue) - 5) // Position label above bubble
                    .text(d => d.Country)
                    .style("opacity", 0) // Initially hide label
                    .transition()
                    .duration(200)
                    .style("opacity", 1); // Show label with transition
            })
            .on("mouseout", function (d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
                d3.select(this)
                    .classed("bounce", false) // Remove bounce effect
                    .transition() // Apply transition for smooth effect
                    .duration(200) // Duration of transition
                    .attr("r", d => z(d.Total_Sales_Revenue)); // Reset radius to original size

                // Hide label with animation
                chart.selectAll(".label")
                    .transition()
                    .duration(200)
                    .style("opacity", 0); // Hide label with transition
            });
    }

    // Add tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Event listener for dropdown change
    d3.select("#RegionSelect").on("change", function () {
        const selectedRegion = d3.select(this).property("value");
        let filteredData = data;
        if (selectedRegion !== "Select All") {
            filteredData = data.filter(d => d.Region === selectedRegion);
        }
        chart.selectAll(".bubble").remove(); // Clear existing bubbles
        chart.selectAll(".label").remove(); // Clear existing labels
        updateChart(filteredData); // Update chart based on selected region
        
        // Feedback message
        const feedbackMessage = selectedRegion === "Select All" ? "Showing data for all regions." : "Showing data for " + selectedRegion + " region.";
        document.getElementById("feedbackMessage").innerText = feedbackMessage;
    });

    // Initialize chart with data for all countries
    updateChart(data);
}).catch(function (error) {
    console.error("Error reading JSON file:", error);
});

// Dragend function for SVG
function dragEnd(event) {
    // No action required for dragend
}

