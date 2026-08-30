import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
};

// No remark/rehype plugins — theory content uses plain MDX + JSX components
// (e.g. <ComplexityTable />) instead of markdown table syntax, so there's no
// external plugin dependency that can go missing/mismatched on a fresh install.
const withMDX = createMDX({
  extension: /\.mdx?$/,
});

export default withMDX(nextConfig);
