export type CoverKind = 'recipe' | 'exercise' | 'watchlist' | 'custom';

export interface GenerateCoverResponse {
  imageDataUrl: string;
  caption: string;
}

export async function generateCoverImage(params: {
  title: string;
  kind: CoverKind;
  subtitle?: string;
  customPrompt?: string;
}): Promise<GenerateCoverResponse> {
  const response = await fetch('/api/gemini/cover-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await response.json();
  if (!response.ok || !data?.imageDataUrl) {
    throw new Error(data?.error || 'Failed to generate cover image.');
  }

  return data as GenerateCoverResponse;
}
