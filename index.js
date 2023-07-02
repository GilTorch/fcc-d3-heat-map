const { 
    json, 
    select, 
    range,
    extent,
    scaleOrdinal,
    schemePastel1, 
    schemeCategory10, 
    scaleBand, 
    scaleLinear,
    scaleTime, 
    axisLeft, 
    axisBottom, 
    ascending,
    scaleThreshold,
} = d3;


console.log(json)
console.log(scaleThreshold)
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
                        .range([margin.top, height - margin.bottom])


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
           .attr('transform', `translate(0,${height - margin.bottom})`)
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
        
    })