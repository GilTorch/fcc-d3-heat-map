const { 
    json, 
    select, 
    scaleBand, 
    scaleLinear,
    axisLeft, 
    axisBottom, 
    scaleThreshold,
    format
} = d3;

const URL = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json" 

const colors =  [
    '#67001f',
    '#b2182b',
    '#d6604d',
    '#f4a582',
    '#fddbc7',
    '#f7f7f7',
    '#d1e5f0',
    '#92c5de',
    '#4393c3',
    '#2166ac',
    '#053061'
]


const months = [
    "January", 
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
]

json(URL)
    .then(({ baseTemperature, monthlyVariance }) => {
        select('#base-temperature')
            .text(baseTemperature)
            
    
        const data = monthlyVariance.map(({year, month, variance}) => {
           return { 
            year: year.toString(),
            temperature: +parseFloat(baseTemperature + variance).toFixed(1), 
            variance,
            month: months[month - 1]
           }
        });
    
        console.table(data)
    
        // svg 
        const margin = {
            left: 50, 
            right: 50, 
            top: 50, 
            bottom: 50
        }
    
        const width = window.innerWidth; 
        const height = window.innerHeight;
    
        const svg = d3.select("body")
                        .append('svg')
                        .attr('width', width - margin.left - margin.right)
                        .attr('height', height - margin.top - margin.bottom)
                        .attr('viewBox', [0,0,width, height])
    
        // Scales
    
        
        const xValue = d => d.year; 
        const yValue = d => d.month;
        const tValue = d => d.temperature
    
    
        const xScale = scaleBand()
                         .domain(data.map(xValue))
                         .range([margin.left, width - margin.right])
        
    
        const yScale = scaleBand()
                        .domain(data.map(yValue))
                        .range([margin.top, (height - margin.bottom)/2])


        const minTemp = Math.min(...data.map(tValue))
        const maxTemp = Math.max(...data.map(tValue))


        const legendColors = [
            '#67001f',
            '#b2182b',
            '#d6604d',
            '#f4a582',
            '#fddbc7',
            '#f7f7f7',
            '#d1e5f0',
            '#92c5de',
            '#4393c3',
            '#2166ac',
            '#053061'
        ];
        
        var tScale = d3
                        .scaleThreshold()
                        .domain(
                          (function (min, max, count) {
                            var array = [];
                            var step = (max - min) / count;
                            for (var i = 1; i < count; i++) {
                              array.push(min + i * step);
                            }
                            return array;
                          })(minTemp, maxTemp, legendColors.length)
                        )
                        .range(legendColors.reverse());
        // Axis
        const xAxis = axisBottom(xScale)
        const yAxis = axisLeft(yScale)
    
        svg.append('g')
           .attr('transform', `translate(0,${(height - margin.bottom)/2})`)
           .call(xAxis.tickValues(xScale.domain().map(year => year.endsWith('0') ? year: '')))
    
        svg.append('g')
           .attr('transform', `translate(${margin.left},0)`)
           .call(yAxis)
    
        svg
         .selectAll("rect")
         .data(data)
         .join("rect")
         .attr('class','cell')
         .attr('x', d => xScale(d.year))
         .attr('y', d => yScale(d.month))
         .attr('width',xScale.bandwidth())
         .attr('height',yScale.bandwidth())
         .attr('fill',d => tScale(d.temperature))


        // heatmap legend 
        // shows the colors in the legend 
        // shows the tresholds representing each colors

        const legendScale = scaleLinear()
                                .domain([minTemp,maxTemp])
                                .range([0, 50*legendColors.length])

        const legendAxis = axisBottom(legendScale)

        svg
         .append('g')
         .call(legendAxis.tickValues(tScale.domain()).tickFormat(format('.1f')))
         .attr('transform',`translate(${margin.left}, ${height - 300})`)
        
        
        const legendData =  tScale.range().map(function (color) {
            var d = tScale.invertExtent(color);
            console.log("Legend data", d)
            if (d[0] === null) {
              d[0] = legendScale.domain()[0];
            }
            if (d[1] === null) {
              d[1] = legendScale.domain()[1];
            }
            return d;
          })

        svg 
          .append('g')
          .selectAll('rect')
          .data(legendData)
          .join('rect')
          .attr('fill', d => tScale(d[0]))
          .attr('x',d => legendScale(d[0]))
          .attr('y', (height - 300) - 50)
          .attr('width',d => {
            return 40
          })
          .attr('height', 50)
        
    })