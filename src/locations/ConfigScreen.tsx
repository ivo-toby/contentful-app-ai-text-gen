import React, { useCallback, useState, useEffect } from "react";
import { AppExtensionSDK, ContentType } from "@contentful/app-sdk";
import {
  Heading,
  Flex,
  Checkbox,
  FormControl,
} from "@contentful/f36-components";
import { useCMA, useSDK } from "@contentful/react-apps-toolkit";
import { TextInput } from "@contentful/f36-forms";

export interface AppInstallationParameters {
  apiKey?: string;
}

const ConfigScreen = () => {
  const [parameters, setParameters] = useState<AppInstallationParameters>({
    apiKey: "",
  });
  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);
  const [selectedContentTypes, setSelectedContentTypes] = useState<
    ContentType[]
  >([]);
  const sdk = useSDK<AppExtensionSDK>();
  const cma = useCMA();

  // Set all content types and selected content types
  useEffect(() => {
    (async () => {
      try {
        const contentTypes = await cma.contentType.getMany({
          spaceId: sdk.ids.space,
          environmentId: sdk.ids.environment,
        });

        const currentState = await sdk.app.getCurrentState();
        if (currentState) {
          const selectedTypes = Object.keys(currentState?.EditorInterface).map(
            (id) => {
              const fullType = contentTypes.items.find(
                (ctType) => ctType.sys.id === id
              );
              return fullType as ContentType;
            }
          );
          setSelectedContentTypes(selectedTypes);
        }

        setContentTypes(contentTypes.items);
      } catch (error) {
        console.log(error);
        throw error;
      }
    })();
  }, [cma.contentType, sdk.app, sdk.ids.environment, sdk.ids.space]);

  const onConfigure = useCallback(async () => {
    let EditorInterface = {};

    selectedContentTypes.forEach((contentType) => {
      Object.assign(EditorInterface, {
        [contentType.sys.id]: {
          sidebar: { position: 0, settings: {} },
        },
      });
    });

    const targetState = { EditorInterface };
    console.log(targetState, parameters);

    return {
      parameters,
      targetState,
    };
  }, [parameters, selectedContentTypes]);

  useEffect(() => {
    sdk.app.onConfigure(() => onConfigure());
  }, [sdk, onConfigure]);

  useEffect(() => {
    (async () => {
      const currentParameters: AppInstallationParameters | null =
        await sdk.app.getParameters();

      if (currentParameters) {
        setParameters(currentParameters);
      }

      sdk.app.setReady();
    })();
  }, [sdk]);

  const handleCheckboxSelection = (contentType: ContentType) => {
    const contentTypeIndex = selectedContentTypes.findIndex((selectedCT) => {
      return selectedCT.sys.id === contentType.sys.id;
    });

    if (contentTypeIndex > 0) {
      const updatedState = selectedContentTypes.splice(contentTypeIndex, 1);
      setSelectedContentTypes(updatedState);
    } else {
      setSelectedContentTypes([...selectedContentTypes, contentType]);
    }
  };

  return (
    <Flex flexDirection="column" padding="spacingXl">
      <FormControl isRequired isInvalid={!parameters.apiKey}>
        <FormControl.Label>API Key</FormControl.Label>
        <TextInput
          value={parameters.apiKey}
          name="apikey"
          placeholder="Your Dall-e API Key"
          onChange={(e) => setParameters({ apiKey: e.target.value })}
        />
        <FormControl.HelpText>Provide your Dall-e API Key</FormControl.HelpText>
        {!parameters.apiKey && (
          <FormControl.ValidationMessage>
            Please, provide your API Key
          </FormControl.ValidationMessage>
        )}
      </FormControl>
      <Flex flexDirection="column">
        <Heading>Where do you want to enable your app</Heading>
        <Flex flexDirection="column">
          {contentTypes.map((contentType) => {
            const index = selectedContentTypes.findIndex((selectedCT) => {
              return selectedCT.sys.id === contentType.sys.id;
            });
            const isSelected = index > -1;

            return (
              <Checkbox
                key={contentType.sys.id}
                onChange={() => handleCheckboxSelection(contentType)}
                isChecked={isSelected}
              >
                {contentType.name}
              </Checkbox>
            );
          })}
        </Flex>
      </Flex>
    </Flex>
  );
};

export default ConfigScreen;
