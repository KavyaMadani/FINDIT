import { ItemType } from "@/lib/store";
import ItemForm from "@/components/ItemForm";

interface PostPageProps {
  params: Promise<{ type: string }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const { type } = await params;
  const itemType = type as ItemType;
  const isLost = itemType === "lost";

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Header */}
      <div style={{ marginBottom: 40, textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: 12 }}>
          {isLost ? "😢" : "📦"}
        </div>
        <h1
          className={`font-pixel ${isLost ? "glow-pink" : "glow-cyan"}`}
          style={{
            fontSize: "clamp(0.6rem, 2vw, 0.8rem)",
            color: isLost ? "#ff007f" : "#00f5ff",
            letterSpacing: "3px",
            marginBottom: 8,
          }}
        >
          POST {itemType.toUpperCase()} ITEM
        </h1>
        <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
          {isLost
            ? "Describe the item you lost so others can help you find it."
            : "Describe the item you found so the owner can reclaim it."}
        </p>
      </div>

      {/* Form card */}
      <div
        className={isLost ? "card-neon-pink" : "card-neon"}
        style={{ padding: "32px" }}
      >
        <ItemForm type={itemType} />
      </div>
    </div>
  );
}
