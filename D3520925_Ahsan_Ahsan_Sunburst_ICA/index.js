// For this chart, I have taken code help from the D3.js, set it(both for my data and appearance also) and I added category filter for more interactivity
// Loading the JSON data
d3.json("heirarchy.json").then(data => {
  const categories = ["Furniture", "Office Supplies", "Technology"];
  const filterLabell = document.createElement('span')
  filterLabell.id = 'filterLabel'
  filterLabell.innerText = 'Categories:'
  const categoryFilter = document.createElement('select');
  categoryFilter.id = 'categoryFilter';
  const allOption = document.createElement('option');
  allOption.value = 'All';
  allOption.text = 'All';
  categoryFilter.appendChild(allOption);
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.text = category;
    categoryFilter.appendChild(option);
  });
  document.body.append(categoryFilter);
  document.body.append(filterLabell)
  categoryFilter.addEventListener('change', updateChart);
  createResponsiveChart(data);
}).catch(error => {
  console.error('Error loading JSON:', error);
});

function createResponsiveChart(data) {
  d3.select("svg").remove();
  const width = window.innerWidth * 0.9;
  const height = window.innerHeight * 0.7;
  const radius = Math.min(width, height) / 6;
  const customColors = ['#FFC55A', '#0A6847', '#E65c19', '#5AB2FF'];
  const color = d3.scaleOrdinal(customColors);
  const hierarchy = d3.hierarchy(data)
    .sum(d => d.quantity || 0) // Assuming your data uses 'quantity'
    .sort((a, b) => b.value - a.value);
  const root = d3.partition()
    .size([2 * Math.PI, hierarchy.height + 1])
    (hierarchy);
  root.each(d => d.current = d);

  // Create the arc generator.
  const arc = d3.arc()
    .startAngle(d => d.x0)
    .endAngle(d => d.x1)
    .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
    .padRadius(radius * 1.5)
    .innerRadius(d => d.y0 * radius)
    .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - 1))

  // Create the SVG container.
  const svg = d3.select("body").append("svg")
    .attr("viewBox", [-width / 2, -height / 2, width, height])
    .style("font", "10px sans-serif");

  // Append the arcs.
  const path = svg.append("g")
    .selectAll("path")
    .data(root.descendants().slice(1))
    .join("path")
    .attr("fill", d => { while (d.depth > 1) d = d.parent; return color(d.data.name); })
    .attr("fill-opacity", d => arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0)
    .attr("pointer-events", d => arcVisible(d.current) ? "auto" : "none")
    .attr("d", d => arc(d.current))
    .on("mouseover", function (event, d) {
      tooltip.style("opacity", 1)
        .html(`${d.ancestors().slice(1).map(d => d.data.name).reverse().join(" - ")}<br>${format(d.value)}`);
    })
    .on("mousemove", function (event) {
      tooltip.style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 30) + "px");
    })
    .on("mouseout", function () {
      tooltip.style("opacity", 0);
    });

  // Make them clickable if they have children.
  path.filter(d => d.children)
    .style("cursor", "pointer")
    .on("click", clicked);

  const format = d3.format(",d");
  path.append("title")
    .text(d => `${d.ancestors().map(d => d.data.name).reverse().join(" - ")}\n${format(d.value)}`);


  // Append the labels.
  const label = svg.append("g")
    .attr("text-anchor", "middle")
    .selectAll("text")
    .data(root.descendants().slice(1))
    .join("text")
    .attr("dy", "0.35em")
    .attr("fill-opacity", d => +labelVisible(d.current))
    .attr("transform", d => labelTransform(d.current))
    .text(d => {
      const maxLength = (arc.outerRadius()(d.current) - arc.innerRadius()(d.current)) * 0.21;
      return d.data.name.length > maxLength ? d.data.name.slice(0, maxLength - 3) + "..." : d.data.name;
    });

  const parent = svg.append("circle")
    .datum(root)
    .attr("r", radius)
    .attr("fill", "none")
    .attr("pointer-events", "all")
    .on("click", clicked);
  function clicked(event, p) {
    parent.datum(p.parent || root);

    root.each(d => d.target = {
      x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
      x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
      y0: Math.max(0, d.y0 - p.depth),
      y1: Math.max(0, d.y1 - p.depth)
    });

    const t = svg.transition().duration(750);
    path.transition(t)
      .tween("data", d => {
        const i = d3.interpolate(d.current, d.target);
        return t => d.current = i(t);
      })
      .filter(function (d) {
        return +this.getAttribute("fill-opacity") || arcVisible(d.target);
      })
      .attr("fill-opacity", d => arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0)
      .attr("pointer-events", d => arcVisible(d.target) ? "auto" : "none")
      .attrTween("d", d => () => arc(d.current));

    label.filter(function (d) {
      return +this.getAttribute("fill-opacity") || labelVisible(d.target);
    }).transition(t)
      .attr("fill-opacity", d => +labelVisible(d.target))
      .attrTween("transform", d => () => labelTransform(d.current));
  }

  function arcVisible(d) {
    return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
  }

  function labelVisible(d) {
    return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
  }

  function labelTransform(d) {
    const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
    const y = (d.y0 + d.y1) / 2 * radius;
    return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
  }
}



function updateChart() {
  const selectedCategory = document.getElementById('categoryFilter').value;
  d3.json("heirarchy.json").then(data => {
    console.log("Loaded Data:", data);
    let filteredData;
    if (selectedCategory === 'All') {
      filteredData = data;
    } else {
      filteredData = {
        name: "Products",
        children: data.children.map(year => ({
          ...year,
          children: year.children.map(quarter => ({
            ...quarter,
            children: quarter.children.map(month => ({
              name: month.name,
              children: month.children.filter(product => product.name === selectedCategory)
            })).filter(month => month.children.length > 0)
          })).filter(quarter => quarter.children.length > 0)
        })).filter(year => year.children.length > 0)
      };
    }
    console.log("Filtered Data:", filteredData);
    createResponsiveChart(filteredData);
  }).catch(error => {
    console.error('Error loading JSON:', error);
  });
}
