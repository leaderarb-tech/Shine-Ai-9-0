export interface ShineAnalysis {
  passed: boolean;
  rejectionReason?: string;
  technicalSteps?: string[];
  marketPerception?: {
    level: string;
    price: string;
    impression: string;
  };
  matchDNA?: string[];
  blindSpots?: string;
  positioning?: {
    bio: string;
    experience: string;
  };
  filters?: {
    specialization: string;
    contentFormat: string[];
    sphere: string[];
    platform: string[];
    clientType: string;
    experience: string;
    style: string;
  };
}

export async function analyzeProfile(
  userData: {
    about: string;
    experience: string;
    sphere: string;
    format: string;
    specialization: string;
  },
  mediaFiles: Array<{ base64: string; type: string }> = []
): Promise<ShineAnalysis> {
  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userData, mediaFiles }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Ошибка сервера");
  }

  return response.json();
}
