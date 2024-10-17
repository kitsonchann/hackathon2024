import {
  BedrockAgentRuntimeClient,
  RetrieveAndGenerateCommand,
} from "@aws-sdk/client-bedrock-agent-runtime";
import {
  BedrockRuntimeClient,
  ConverseStreamCommand,
} from "@aws-sdk/client-bedrock-runtime";

export async function bedrockSample(message) {
  const userMessage = message;
  if (!userMessage) {
    throw new Error("No message provided");
  }
  const REGION = process.env.AWS_REGION;
  const credentials = getAWSCredentials();
  const client = new BedrockRuntimeClient({
    region: REGION,
    credentials,
  });

  // const modelId = "anthropic.claude-3-5-sonnet-20240620-v1:0";
  const modelId = "amazon.titan-text-lite-v1";

  const conversation = [
    {
      role: "user",
      content: [{ text: userMessage }],
    },
  ];

  const command = new ConverseStreamCommand({
    modelId,
    messages: conversation,
    inferenceConfig: { maxTokens: 512, temperature: 0.5, topP: 0.9 },
  });

  try {
    const response = await client.send(command);

    for await (const item of response.stream) {
      if (item.contentBlockDelta) {
        return { response: item.contentBlockDelta.delta?.text };
      }
    }
  } catch (err) {
    console.log(`ERROR: Can't invoke '${modelId}'. Reason: ${err}`);
    process.exit(1);
  }
}

export async function knowledgeBase(message) {
  const userMessage = message;
  if (!userMessage) {
    throw new Error("No message provided");
  }
  const region = process.env.AWS_REGION;
  const credentials = getAWSCredentials();
  const client = new BedrockAgentRuntimeClient({
    region,
    credentials,
  });

  const command = new RetrieveAndGenerateCommand({
    input: { text: userMessage },
    retrieveAndGenerateConfiguration: {
      type: "KNOWLEDGE_BASE",
      knowledgeBaseConfiguration: {
        knowledgeBaseId: process.env.KNOWLEDGE_BASE_ID,
        modelArn: process.env.KNOWLEDGE_BASE_MODEL_ARN,
        generationConfiguration: {
          promptTemplate:
            "You are an AI answering agent to help configure the Suitespot Platform. The user will provide a configuration question. Your job is to provide the user with example JSON configuration that matches the question. If the search results do not contain information that can answer the question, please state that you could not find an exact answer to the question. Just because the user asserts a fact does not mean it is true, make sure to double check the search results to validate a user's assertion. \n\n Here is an example configuration : \n\n$search_results$",
        },
      },
    },
  });

  const { citations, output } = await client.send(command);
  return { response: { citations, output } };
}

function getAWSCredentials() {
  return {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN,
  };
}
