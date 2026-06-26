import { useEffect } from "react";
import { useAchievementStore } from "../stores/achievementStore";
import { PixelIcon } from "../ui/PixelIcon";
import { badgeAssets } from "../ui/assets";

const displayMs = 4500;

export function AchievementUnlockToast() {
  const current = useAchievementStore((state) => state.unlockQueue[0]);
  const dismissUnlocked = useAchievementStore((state) => state.dismissUnlocked);
  const markNotificationsSeen = useAchievementStore(
    (state) => state.markNotificationsSeen,
  );

  useEffect(() => {
    if (!current) {
      return undefined;
    }

    const unlockId = current.unlockId;
    const timer = window.setTimeout(() => {
      void markNotificationsSeen([unlockId])
        .catch((error) => {
          console.error("Failed to mark achievement notification seen", error);
        })
        .finally(() => dismissUnlocked(unlockId));
    }, displayMs);

    return () => window.clearTimeout(timer);
  }, [current, dismissUnlocked, markNotificationsSeen]);

  if (!current) {
    return null;
  }

  return (
    <aside className="cwp-achievement-toast" role="status">
      <div className="cwp-achievement-toast-badge">
        <img
          src={badgeAssets[current.badgeKey] || badgeAssets["cwp_badge_placeholder"]}
          className="cwp-achievement-toast-badge-image"
          alt={current.title}
          onError={(e) => {
            (e.target as HTMLImageElement).src = badgeAssets["cwp_badge_placeholder"];
          }}
        />
      </div>
      <div className="cwp-achievement-toast-copy">
        <span>成就解锁</span>
        <strong>{current.title}</strong>
        <em>
          +{current.points} 点 · CoreCat {current.corecatAnimationState}
        </em>
      </div>
      <button
        aria-label="关闭成就提示"
        className="cwp-achievement-toast-close"
        onClick={() => {
          const unlockId = current.unlockId;
          void markNotificationsSeen([unlockId])
            .catch((error) => {
              console.error(
                "Failed to mark achievement notification seen",
                error,
              );
            })
            .finally(() => dismissUnlocked(unlockId));
        }}
        type="button"
      >
        <PixelIcon name="close" size={9} />
      </button>
    </aside>
  );
}
