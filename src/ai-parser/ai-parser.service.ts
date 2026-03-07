import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import OpenAI from "openai";

interface ParsedItem {
  name: string;
  qty: number;
}

interface MatchedItem {
  productId: string;
  qty: number;
  price: number;
}

interface AiParseResponse {
  items: ParsedItem[];
}

@Injectable()
export class AiParserService implements OnModuleInit {
  private openai: OpenAI;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  onModuleInit() {
    const apiKey = this.configService.get("openai.apiKey");
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not defined in environment variables");
    }
    this.openai = new OpenAI({
      apiKey,
    });
  }

  async parseMessage(
    messageId: string,
    tenantId: string,
    message: string,
    sender: string,
  ) {
    // Get tenant's active products
    const products = await this.prisma.product.findMany({
      where: { tenantId, isActive: true },
      select: { id: true, name: true, price: true },
    });

    if (products.length === 0) {
      throw new Error("No active products found for this tenant");
    }

    // Build product list for the prompt
    const productList = products
      .map((p) => `${p.name} - Rp ${p.price}`)
      .join("\n");

    // Build prompt
    const systemPrompt = `You are an order parser for Indonesian food ordering.
Convert customer WhatsApp messages into JSON order items.
Only return JSON.
The customer may use informal Indonesian or shorthand.
Match items to the provided menu items as closely as possible.`;

    const userPrompt = `MENU:
${productList}

MESSAGE:
${message}`;

    // Call OpenAI API
    const completion = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.1,
      response_format: { type: "json_object" },
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      throw new Error("No response from AI");
    }

    // Parse AI response
    let parsedResponse: AiParseResponse;
    try {
      parsedResponse = JSON.parse(response);
    } catch (parseError) {
      console.error("Failed to parse AI response:", response);
      throw new Error("Invalid JSON response from AI");
    }

    // Fuzzy match items with products
    const orderItems = this.matchItemsWithProducts(
      parsedResponse.items,
      products,
    );

    // Validate that at least one item was matched
    if (orderItems.length === 0) {
      // Log the failed parsing attempt
      await this.prisma.aiLog.create({
        data: {
          messageId,
          prompt: userPrompt,
          response,
          confidence: 0,
        },
      });
      throw new Error(
        "No items could be matched to products. Please check the product catalog.",
      );
    }

    // Create order
    const order = await this.prisma.order.create({
      data: {
        tenantId,
        customerPhone: sender, // Sender's phone number
        status: "PENDING",
      },
    });

    // Create order items
    for (const item of orderItems) {
      await this.prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: item.productId,
          qty: item.qty,
          price: item.price,
        },
      });
    }

    // Log AI interaction
    await this.prisma.aiLog.create({
      data: {
        messageId,
        prompt: userPrompt,
        response,
        confidence: completion.choices[0]?.finish_reason === "stop" ? 1.0 : 0.5,
      },
    });

    return {
      order,
      parsedItems: parsedResponse.items,
    };
  }

  private matchItemsWithProducts(
    items: ParsedItem[],
    products: { id: string; name: string; price: any }[],
  ) {
    const result: MatchedItem[] = [];

    for (const item of items) {
      // Simple fuzzy matching - find product with similar name
      const matchedProduct = products.find((p) =>
        this.fuzzyMatch(item.name.toLowerCase(), p.name.toLowerCase()),
      );

      if (matchedProduct) {
        result.push({
          productId: matchedProduct.id,
          qty: item.qty,
          price: matchedProduct.price,
        });
      }
    }

    return result;
  }

  private fuzzyMatch(input: string, target: string): boolean {
    // Simple fuzzy matching - check if input is contained in target or vice versa
    return (
      target.includes(input) ||
      input.includes(target) ||
      this.levenshteinDistance(input, target) <= 2
    );
  }

  private levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1,
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }
}
