import "codemirror/lib/codemirror.css";
import React, { useState } from "react";
import { useAutoResizer } from "@contentful/react-apps-toolkit";

import { FieldExtensionSDK } from "@contentful/app-sdk";
import { /* useCMA, */ useSDK } from "@contentful/react-apps-toolkit";
import { Spinner, Button } from "@contentful/f36-components";
import { autocomplete } from "../lib/openai";
import "codemirror/lib/codemirror.css";
import { RichTextEditor } from "@contentful/field-editor-rich-text";
import { documentToPlainTextString } from "@contentful/rich-text-plain-text-renderer";

const Field = () => {
  const [isLoading, setIsLoading] = useState(false);
  const sdk = useSDK<FieldExtensionSDK>();

  useAutoResizer();

  const autocompleteText = async () => {
    let text = "";
    let richText = sdk.field.getValue();
    const { type } = sdk.field;
    if (type === "RichText") {
      text = documentToPlainTextString(richText);
    } else {
      text = richText;
    }

    if (text.split(" ").length < 5) return;
    setIsLoading(true);
    const completion = await autocomplete(
      text,
      sdk.parameters.installation.apiKey
    );
    if (type === "RichText") {
      sdk.field.setValue(richText + );
    } else {
      const newText = `${text} ${completion.choices[0]?.text}`;
      sdk.field.setValue(newText);
    }
    setIsLoading(false);
  };

  return (
    <>
      <RichTextEditor sdk={sdk} isInitiallyDisabled={true} />
      <Button onClick={autocompleteText}>AI Suggest text</Button>
      {isLoading && <Spinner variant="default" />}
    </>
  );
};

export default Field;
