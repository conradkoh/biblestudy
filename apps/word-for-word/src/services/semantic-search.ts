import { Asset } from "expo-asset";
import { InferenceSession, Tensor } from "onnxruntime-react-native";
import { PreTrainedTokenizer, BertTokenizer } from '@xenova/transformers';
import tokenizerJson from '@/assets/embedding/tokenizer.json';
import tokenizerConfig from '@/assets/embedding/tokenizer_config.json';

export class SemanticSearch {
  tokenizer?: PreTrainedTokenizer;
  session?: InferenceSession;
  modelUri?: string;

  constructor() {
    // Tokenizer will be initialized lazily to handle potential regex issues
    console.log('SemanticSearch constructor called');
  }

  private async initializeTokenizer() {
    if (this.tokenizer) return;

    try {
      this.tokenizer = new BertTokenizer(tokenizerJson, tokenizerConfig);
      console.log('Tokenizer created successfully');
    } catch (error) {
      console.error('Error creating tokenizer:', error);
    }
  }

  async init() {
    const assets = await Asset.loadAsync(require('@/assets/embedding/snowflake_model_q4.onnx'));
    const uri = assets[0]?.localUri;
    if (!uri) throw new Error("No uri found");
    console.log("Loaded model from assets", uri);
    this.modelUri = uri;
  }

  async createEmbedding(input: string) {
    // Initialize tokenizer if not already done
    if (!this.tokenizer) {
      await this.initializeTokenizer();
      if (!this.tokenizer) throw new Error("Tokenizer failed to initialize");
    }

    if (!this.session) {
      if (!this.modelUri) throw new Error("No model uri found");
      const session = await InferenceSession.create(this.modelUri);
      this.session = session;
    }

    const { input_ids, attention_mask } = this.tokenizer(input);
    const result = await this.session.run({ input_ids, attention_mask, token_type_ids: zeroTensor(input_ids.dims) });
    const last_hidden_state = result.last_hidden_state;
    if (!last_hidden_state) throw new Error('No last_hidden_state in model output');
    return globalAverage(last_hidden_state.data as Float32Array, last_hidden_state.dims);
  }
}


// Helper function to create a zero tensor with the same dimensions as input_ids
function zeroTensor(dims: readonly number[]): Tensor {
  const size = dims.reduce((acc, dim) => acc * dim, 1);
  const data = new BigInt64Array(size).fill(0n);
  return new Tensor('int64', data, dims);
}

// Helper function to compute global average pooling over the sequence dimension
function globalAverage(tensorData: Float32Array, dims: readonly number[]): Float32Array {
  if (dims.length < 3) {
    throw new Error('Expected tensor with at least 3 dimensions: [batch, sequence, hidden]');
  }

  const batchSize = dims[0]!;
  const sequenceLength = dims[1]!;
  const hiddenSize = dims[2]!;
  const result = new Float32Array(batchSize * hiddenSize);

  for (let b = 0; b < batchSize; b++) {
    for (let h = 0; h < hiddenSize; h++) {
      let sum = 0;
      for (let s = 0; s < sequenceLength; s++) {
        const index = b * sequenceLength * hiddenSize + s * hiddenSize + h;
        sum += tensorData[index] || 0;
      }
      result[b * hiddenSize + h] = sum / sequenceLength;
    }
  }

  return result;
}
