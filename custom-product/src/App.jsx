import React, { useState, useEffect } from "react";
import {
  AppProvider,
  Page,
  Card,
  Button,
  Select,
  TextField,
  Checkbox,
  RadioButton,
  Stack,
  TextStyle,
  Banner,
  Frame,
  Toast,
} from "@shopify/polaris";

const customizationSteps = [
  {
    id: "step1",
    title: "Choose Color",
    inputs: [
      {
        type: "radio",
        label: "Color",
        name: "color",
        options: [
          { label: "Red", value: "red", price: 5 },
          { label: "Blue", value: "blue", price: 3 },
          { label: "Green", value: "green", price: 4 },
        ],
      },
    ],
  },
  {
    id: "step2",
    title: "Add Text",
    inputs: [
      {
        type: "text",
        label: "Custom Text",
        name: "customText",
        price: 2,
      },
    ],
  },
  {
    id: "step3",
    title: "Upload Image",
    inputs: [
      {
        type: "file",
        label: "Upload Image",
        name: "image",
        price: 10,
      },
    ],
  },
];

function CustomizationWizard({ onComplete }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [customizationData, setCustomizationData] = useState({});
  const [showToast, setShowToast] = useState(false);

  const currentStep = customizationSteps[currentStepIndex];

  const handleInputChange = (name, value) => {
    setCustomizationData((prev) => ({ ...prev, [name]: value }));
  };

  const calculatePrice = () => {
    let total = 0;
    customizationSteps.forEach((step) => {
      step.inputs.forEach((input) => {
        const val = customizationData[input.name];
        if (val) {
          if (input.type === "radio" && input.options) {
            const option = input.options.find((o) => o.value === val);
            if (option) total += option.price;
          } else {
            total += input.price || 0;
          }
        }
      });
    });
    return total;
  };

  const nextStep = () => {
    if (currentStepIndex < customizationSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      onComplete(customizationData);
      setShowToast(true);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  return (
    <Frame>
      <Page title="Product Customization">
        <Card sectioned>
          <h2>{currentStep.title}</h2>
          {currentStep.inputs.map((input) => {
            switch (input.type) {
              case "radio":
                return (
                  <Stack key={input.name} vertical>
                    <TextStyle variation="strong">{input.label}</TextStyle>
                    {input.options.map((option) => (
                      <RadioButton
                        key={option.value}
                        label={`${option.label} (+$${option.price})`}
                        checked={customizationData[input.name] === option.value}
                        onChange={() => handleInputChange(input.name, option.value)}
                      />
                    ))}
                  </Stack>
                );
              case "text":
                return (
                  <TextField
                    key={input.name}
                    label={`${input.label} (+$${input.price})`}
                    value={customizationData[input.name] || ""}
                    onChange={(value) => handleInputChange(input.name, value)}
                  />
                );
              case "file":
                return (
                  <input
                    key={input.name}
                    type="file"
                    onChange={(e) => handleInputChange(input.name, e.target.files[0])}
                  />
                );
              default:
                return null;
            }
          })}
          <Stack distribution="equalSpacing" style={{ marginTop: "1rem" }}>
            <Button onClick={prevStep} disabled={currentStepIndex === 0}>
              Previous
            </Button>
            <Button primary onClick={nextStep}>
              {currentStepIndex === customizationSteps.length - 1 ? "Finish" : "Next"}
            </Button>
          </Stack>
        </Card>
        <Card sectioned title="Summary">
          <p>Total Price: ${calculatePrice()}</p>
          <pre>{JSON.stringify(customizationData, null, 2)}</pre>
        </Card>
      </Page>
      {showToast && (
        <Toast content="Customization complete!" onDismiss={() => setShowToast(false)} />
      )}
    </Frame>
  );
}

export default function App() {
  const [quoteRequests, setQuoteRequests] = React.useState([]);

  const handleComplete = (data) => {
    // Here you would send the quote request to the backend
    setQuoteRequests((prev) => [...prev, data]);
  };

  return (
    <AppProvider>
      <CustomizationWizard onComplete={handleComplete} />
      <Page title="Quote Requests">
        <Card sectioned>
          <h2>Submitted Quotes</h2>
          {quoteRequests.length === 0 ? (
            <p>No quote requests submitted yet.</p>
          ) : (
            <ul>
              {quoteRequests.map((quote, index) => (
                <li key={index}>{JSON.stringify(quote)}</li>
              ))}
            </ul>
          )}
        </Card>
      </Page>
    </AppProvider>
  );
}
