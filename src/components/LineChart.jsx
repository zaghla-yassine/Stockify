import { ResponsiveLine } from "@nivo/line";
import { useState, useEffect } from "react";
import { useTheme } from "@mui/material";
import { tokens } from "../theme";

const LineChart = ({ isCustomLineColors = false, isDashboard = false }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [chartData, setChartData] = useState([]);
  const [clientId, setClientId] = useState(null);
  const productId = localStorage.getItem("productId"); // Fetch productId from localStorage

  useEffect(() => {
    // Retrieve clientId from localStorage when the component mounts
    const storedClientId = localStorage.getItem("clientId");
    console.log(storedClientId);
    if (storedClientId) {
      setClientId(storedClientId); // Set clientId in state
    } else {
      console.log("No valid clientId found in localStorage");
    }
  }, []);

  useEffect(() => {
    // Fetch data from the API only when clientId and productId are available
    const fetchData = async () => {
      if (clientId && productId) {
        try {
          const response = await fetch(
            `http://51.20.144.224:3000/product/web/latestData/client/${clientId}/product/${productId}`
          );
          const data = await response.json();
          console.log(data);

          // Transform the API data into the format expected by the chart
          const transformedData = [
            {
              id: "Gas Rates",
              color: colors.primary[500],
              data: data.latestData.data.map((item) => ({
                x: item.timestamps, // using timestamps for x-axis
                y: item.gasRate.CH4, // example using CH4 gas rate for y-axis
              })),
            },
          ];

          setChartData(transformedData);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }
    };

    fetchData();
  }, [clientId, productId, colors.primary]); // Dependency array now includes clientId

  return (
    <ResponsiveLine
      data={chartData}
      theme={{
        axis: {
          domain: {
            line: {
              stroke: colors.grey[100],
            },
          },
          legend: {
            text: {
              fill: colors.grey[100],
            },
          },
          ticks: {
            line: {
              stroke: colors.grey[100],
              strokeWidth: 1,
            },
            text: {
              fill: colors.grey[100],
            },
          },
        },
        legends: {
          text: {
            fill: colors.grey[100],
          },
        },
        tooltip: {
          container: {
            color: colors.primary[500],
          },
        },
      }}
      colors={isDashboard ? { datum: "color" } : { scheme: "nivo" }}
      margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
      xScale={{ type: "point" }}
      yScale={{
        type: "linear",
        min: "auto",
        max: "auto",
        stacked: true,
        reverse: false,
      }}
      yFormat=" >-.2f"
      curve="catmullRom"
      axisTop={null}
      axisRight={null}
      axisBottom={{
        orient: "bottom",
        tickSize: 0,
        tickPadding: 5,
        tickRotation: 0,
        legend: isDashboard ? undefined : "Date",
        legendOffset: 36,
        legendPosition: "middle",
      }}
      axisLeft={{
        orient: "left",
        tickValues: 5,
        tickSize: 3,
        tickPadding: 5,
        tickRotation: 0,
        legend: isDashboard ? undefined : "CH4 Rate (PPM)",
        legendOffset: -40,
        legendPosition: "middle",
      }}
      enableGridX={false}
      enableGridY={false}
      pointSize={8}
      pointColor={{ theme: "background" }}
      pointBorderWidth={2}
      pointBorderColor={{ from: "serieColor" }}
      pointLabelYOffset={-12}
      useMesh={true}
      legends={[
        {
          anchor: "bottom-right",
          direction: "column",
          justify: false,
          translateX: 100,
          translateY: 0,
          itemsSpacing: 0,
          itemDirection: "left-to-right",
          itemWidth: 80,
          itemHeight: 20,
          itemOpacity: 0.75,
          symbolSize: 12,
          symbolShape: "circle",
          symbolBorderColor: "rgba(0, 0, 0, .5)",
          effects: [
            {
              on: "hover",
              style: {
                itemBackground: "rgba(0, 0, 0, .03)",
                itemOpacity: 1,
              },
            },
          ],
        },
      ]}
    />
  );
};

export default LineChart;
