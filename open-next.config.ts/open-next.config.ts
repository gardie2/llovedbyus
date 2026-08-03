import { defineconfig } from "@opennextjs/cloudflare";

export default defineconfig({
  override: {
    wrapper: "cloudflare-pages",
  },
});