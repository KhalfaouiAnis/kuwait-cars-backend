import {
  AutoProcessor,
  CLIPVisionModelWithProjection,
  PreTrainedModel,
  Processor,
  RawImage,
} from "@huggingface/transformers";

class VectorService {
  private static modelId = "Xenova/clip-vit-base-patch16";
  private static processor: Promise<Processor> | null = null;
  private static model: Promise<PreTrainedModel> | null = null;

  static async getComponents() {
    if (!this.processor || !this.model) {
      this.processor = AutoProcessor.from_pretrained(this.modelId);
      this.model = CLIPVisionModelWithProjection.from_pretrained(this.modelId, {
        dtype: "auto",
      });
    }
    return Promise.all([this.processor, this.model]);
  }

  static async generateEmbedding(input: string | Buffer): Promise<number[]> {
    const [processor, model] = await this.getComponents();
    let image: RawImage;

    try {
      if (Buffer.isBuffer(input)) {
        const blob = new Blob([input as unknown as BlobPart]);
        image = await RawImage.read(blob);
      } else {
        image = await RawImage.read(input);
      }
    } catch (e) {
      console.error("Image Read Error:", e);
      throw new Error("Failed to parse image data");
    }

    const image_inputs = await processor(image);
    const { image_embeds } = await model(image_inputs);

    return Array.from(image_embeds.data);
  }
}

export default VectorService;
