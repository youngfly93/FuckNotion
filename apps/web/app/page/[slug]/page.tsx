import DynamicPageClient from "./page-client";

// Required for static export with dynamic routes
export async function generateStaticParams() {
  // Return empty array - dynamic pages will be handled at runtime
  return [];
}

// Force static generation for desktop builds
export const dynamic = 'force-static';
export const dynamicParams = true;

export default function DynamicPage() {
  return <DynamicPageClient />;
}
