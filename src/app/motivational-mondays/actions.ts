
"use server";

import { z } from "zod";
import { classifyMotivationalContent } from "@/ai/flows/motivational-mondays-content-classification";
import { detectCopyrightAndContentIssues } from "@/ai/flows/copyright-and-content-issue-detection";
import { MotivationalContentInput, DetectCopyrightAndContentIssuesInput } from "@/lib/schemas";

const submissionSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  contentType: z.enum(["story", "image", "video"]),
  content: z.string(),
});

export async function handleSubmission(formData: FormData) {
  const rawFormData = {
    name: formData.get("name"),
    email: formData.get("email"),
    contentType: formData.get("contentType"),
    content: formData.get("content"),
  };

  const parsed = submissionSchema.safeParse(rawFormData);

  if (!parsed.success) {
    return { error: "Invalid form data.", data: null };
  }

  const { content, contentType } = parsed.data;

  try {
    const classificationInput: MotivationalContentInput = { content, contentType };
    const issueDetectionInput: DetectCopyrightAndContentIssuesInput = { submissionText: content };

    // Run AI flows in parallel
    const [classificationResult, issueDetectionResult] = await Promise.all([
        classifyMotivationalContent(classificationInput),
        detectCopyrightAndContentIssues(issueDetectionInput)
    ]);
    
    return {
      error: null,
      data: {
        classification: classificationResult.classification,
        issues: issueDetectionResult,
      },
    };
  } catch (e) {
    console.error("AI flow failed:", e);
    return { error: "Failed to process submission due to an internal error.", data: null };
  }
}
