import { AI } from "@/lib/chat/actions";
import Scout from "@/components/scout";

export default async function IndexPage() {
  return (
    <AI>
      <Scout />
    </AI>
  );
}
