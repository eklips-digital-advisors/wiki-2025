import { useState, useEffect } from "react";

const GRAPHQL_ENDPOINT = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/graphql`
export function useFetchPageOrPost(slug: string) {
  const [id, setId] = useState(null);

  useEffect(() => {
    if (!slug) return;

    const fetchData = async () => {
      try {
        const query = `
          query {
            Posts(where: {slug: {equals: "${slug}"}}, limit: 1) {
              docs {
                id
              }
            }
            Pages(where: {slug: {equals: "${slug}"}}, limit: 1) {
              docs {
                id
              }
            }
          }
        `;

        const response = await fetch(GRAPHQL_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query }),
        });

        const result = await response.json();

        const postId = result?.data?.Posts?.docs?.[0]?.id;
        const pageId = result?.data?.Pages?.docs?.[0]?.id;

        const finalId = pageId || postId;
        if (finalId) {
          setId(finalId);
        }
      } catch (error) {
        console.error("Fetch error:", error instanceof Error ? error.message : error);
      }
    };

    fetchData();
  }, [slug]);

  return id;
}
