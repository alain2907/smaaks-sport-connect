export const config = {
  regions: ["cdg1"], // Force Paris
};

export async function GET() {
  return Response.json({
    region: process.env.VERCEL_REGION || 'unknown',
    timestamp: new Date().toISOString(),
    message: 'Région de déploiement Vercel'
  });
}