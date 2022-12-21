import "codemirror/lib/codemirror.css";
import React, { useState } from "react";
import { useAutoResizer } from "@contentful/react-apps-toolkit";

import { FieldExtensionSDK } from "@contentful/app-sdk";
import { /* useCMA, */ useSDK } from "@contentful/react-apps-toolkit";
import { Spinner, Button } from "@contentful/f36-components";
import { autocomplete } from "../lib/openai";
import { MarkdownEditor } from "@contentful/field-editor-markdown";

const Field = () => {
  const [isLoading, setIsLoading] = useState(false);
  const sdk = useSDK<FieldExtensionSDK>();

  useAutoResizer();

  const autocompleteText = async () => {
    const text = sdk.field.getValue();
    if (text.split(" ").length < 5) return;
    setIsLoading(true);
    const completion = await autocomplete(
      text,
      sdk.parameters.installation.apiKey
    );
    const newText = `${text} ${completion.choices[0]?.text}`;
    sdk.field.setValue(newText);
    setIsLoading(false);
  };

  return (
    <>
      <MarkdownEditor sdk={sdk} isInitiallyDisabled={!isLoading} />
      <Button onClick={autocompleteText}>AI Suggest text</Button>
      {isLoading && <Spinner variant="default" />}
    </>
  );
};

export default Field;
