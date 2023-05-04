import { useRef, useState } from "react";
import { GptData } from "../lib/GptData";
import FormComponent from "../components/Form";
// import Book from "./components/Book";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography
} from "@mui/material";
import { interpolate } from "../lib/GptQuestion";
import Book from "./Book";
import ConfigForm from "./Config";
import { bookGenerator } from "./generators";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}
// create a json schema that describes any plant with 200 attributes


export default function Project() {
  const [data, setData] = useState(null);
  const [inputData, setInputData] = useState(null);

  const [layerCosts, setLayerCosts] = useState([]);
  const [layers, setLayers] = useState([]);
  const [compiledLayers, setCompiledLayers] = useState([]);
  const guideRef = useRef(null);
  const [layer, setLayer] = useState(0);
  const [sublayer, setSublayer] = useState(0);

  function getData({
    guide,
    questionsLength,
    paragraphsLength,
    chaptersLength,
    subchaptersLength
  }) {
    const gpt = new GptData({
      config: bookGenerator,
      variables: {
        guide,
        questionsLength,
        paragraphsLength,
        chaptersLength,
        subchaptersLength
      }
    });
    setLayers(gpt.layers);
    gpt.getAllLayers();
    gpt.onFinishLayer((num) => {
      const newData = gpt.getData();
      setCompiledLayers(gpt.compiledLayers);
      console.log("Finished Layer", num, newData);
      const cost = gpt.compiledLayers[num].reduce(
        ({ cost }, layer) => {
          return { cost: cost + layer.request.usage.total_tokens };
        },
        {
          cost: 0
        }
      );
      const newLayerCosts = layerCosts;
      newLayerCosts[num] = cost;
      setLayerCosts(newLayerCosts);
      setData(newData);
    });
  }
  return (
    <>



      <div>
      <FormComponent
        onSubmit={(formData) => {
          setInputData(formData);
          getData(formData);
        }}
        properties={bookGenerator.inputSchema}
      />
      </div>
      <div>
      <h6>Costs</h6>
      <ol>
        {layerCosts.map(({ cost }, index) => {
          return <li>{(cost * 0.0002) / 1000}$</li>;
        })}
      </ol>
      Total:
      {layerCosts.reduce((total, { cost }, index) => {
        return ((total + cost) * 0.0002) / 1000;
      }, 0)}
        </div>
        <div>
        <Tabs
        value={layer}
        onChange={(e, v) => {
          setLayer(v);
        }}
        variant="scrollable"
        scrollButtons="auto"
        aria-label="scrollable auto tabs example"
      >
        {layers.map((sublayers) => {
          return <Tab label={sublayers.map(({ name }) => name).join("&")} />;
        })}
      </Tabs>
      {layers.map((_, layerIndex) => {
        if (
          !compiledLayers?.[layerIndex] ||
          !compiledLayers?.[layerIndex].length
        ) {
          return null;
        }
        return (
          <div>
            <TabPanel value={layer} index={layerIndex}>
              <Box
                sx={{
                  bgcolor: "background.paper",
                  height: 224
                }}
              >
                {compiledLayers?.[layerIndex]?.map(
                  (
                    { name, compiled, data, question, variables, prompt },
                    subindex
                  ) => {
                    return (
                      <Accordion>
                        <AccordionSummary
                          aria-controls="panel1a-content"
                          id="panel1a-header"
                        >
                          <Typography>
                            {interpolate(question, variables)}
                            {prompt}
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          
                            {Array.isArray(data)
                              ? data?.join("\n")
                              : <pre>JSON.stringify(data)</pre>}
                          
                        </AccordionDetails>
                      </Accordion>
                    );
                  }
                )}
              </Box>
            </TabPanel>
          </div>
        );
      })}
        </div>
        
        <div>
        <h1>A book about {inputData?.guide}</h1>

    
      {data && <Book data={data} />}
    
        </div>
        </>
  );
}
