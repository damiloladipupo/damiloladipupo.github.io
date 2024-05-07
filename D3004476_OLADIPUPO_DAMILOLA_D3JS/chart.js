// Defining dimensions and margins
const margin = { top: 10, right: 50, bottom: 30, left: 150 };
const width = 900 - margin.left - margin.right;
const height = 430 - margin.top - margin.bottom; // Adjusted height

// Appending the SVG to the body of the html page
const svg = d3
  .select("#chart")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// Tooltip
const tooltip = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

// Loading the JSON data
d3.json("SSY.json").then((data) => {
  // Extract unique years
  const years = [...new Set(data.map((d) => d.Year))];
  // Extract unique regions
  const regions = ["All", ...new Set(data.map((d) => d.Region))];

  // Create dropdown menu for years
  d3.select("#year-select")
    .selectAll("option")
    .data(years.sort((a, b) => b - a))
    .enter()
    .append("option")
    .text((d) => d);

  // Create dropdown menu for regions
  d3.select("#region-select")
    .selectAll("option")
    .data(regions)
    .enter()
    .append("option")
    .text((d) => d);

  // Initialize chart with the first year and first region
  updateChart(years[0], "All");

  // Update chart when year is selected from dropdown
  d3.select("#year-select").on("change", function () {
    const selectedYear = this.value;
    const selectedRegion = d3.select("#region-select").property("value");
    updateChart(selectedYear, selectedRegion);
  });

  // Update chart when region is selected from dropdown
  d3.select("#region-select").on("change", function () {
    const selectedRegion = this.value;
    const selectedYear = d3.select("#year-select").property("value");
    updateChart(selectedYear, selectedRegion);
  });

  // Function to update the chart based on selected year and region
  function updateChart(selectedYear, selectedRegion) {
    let filteredData = data.filter(
      (d) => d.Year == selectedYear && d.Region == selectedRegion
    );

    if (selectedRegion === "All") {
      filteredData = data.filter((d) => d.Year == selectedYear);
    }

    // Sort the data based on sales in descending order
    filteredData.sort(
      (a, b) =>
        parseInt(b.Sales.replace(/\$/g, "").trim()) -
        parseInt(a.Sales.replace(/\$/g, "").trim())
    );

    // Select the top 15 states
    const top15Data = filteredData.slice(0, 15);

    // Create x scale
    const xScale = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(top15Data, (d) => parseInt(d.Sales.replace(/\$/g, "").trim())),
      ])
      .range([0, width]);

    // Update x-axis
    svg.selectAll(".x-axis").remove();
    svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(xScale));

    // Create color scale
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Create bars
    const bars = svg.selectAll(".bar").data(top15Data, (d) => d.State);

    bars.exit().remove();

    bars
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("y", (d, i) => i * (height / top15Data.length))
      .attr("height", height / top15Data.length - 5)
      .attr("fill", (d, i) => colorScale(i))
      .on("mouseover", function (event, d) {
        // Reduce opacity of other bars
        d3.selectAll(".bar")
          .filter((otherD) => otherD.State !== d.State)
          .transition()
          .duration(400)
          .attr("opacity", 0.5);

        // Show tooltip with region
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip
          .html(`<strong> Region: ${d.Region}</strong>`)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", function (d) {
        // Restore opacity of other bars
        d3.selectAll(".bar").transition().duration(200).attr("opacity", 1);

        // Hide tooltip
        tooltip.transition().duration(500).style("opacity", 0);
      })
      .merge(bars)
      .transition()
      .duration(1000)
      .attr("width", (d) => xScale(parseInt(d.Sales.replace(/\$/g, "").trim())))
      .attr("y", (d, i) => i * (height / top15Data.length))
      .attr("height", height / top15Data.length - 5);

    // I Added state labels within bars here
    svg.selectAll(".state-label").remove();
    svg
      .selectAll(".state-label")
      .data(top15Data)
      .enter()
      .append("text")
      .attr("class", "state-label")
      .attr("x", 5)
      .attr("y", (d, i) => (i + 0.5) * (height / top15Data.length))
      .attr("dy", "0.3em")
      .style("font-size", "10px")
      .text((d) => d.State);

    // I Added sales value labels outside bars here
    svg.selectAll(".value-label").remove();
    svg
      .selectAll(".value-label")
      .data(top15Data)
      .enter()
      .append("text")
      .attr("class", "value-label")
      .attr("x", (d) => xScale(parseInt(d.Sales.replace(/\$/g, "").trim())) + 5)
      .attr("y", (d, i) => (i + 0.5) * (height / top15Data.length))
      .attr("dy", "0.3em")
      .style("font-size", "10px")
      .text((d) => d.Sales);
  }
});
