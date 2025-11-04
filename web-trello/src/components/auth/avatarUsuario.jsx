import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../modules/auth/AuthContext.jsx";

export default function UserAvatar({ size = 36, className = "" }) {
  const { user } = useAuth();

  const initial = useMemo(
    () => (user?.email || "U").charAt(0).toUpperCase(),
    [user],
  );

  const storageKey = user ? `profilePhoto:${user.id}` : null;
  const [profilePhoto, setProfilePhoto] = useState(null);

  useEffect(() => {
    if (!storageKey) {
      setProfilePhoto(null);
      return;
    }
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setProfilePhoto(saved);
      else setProfilePhoto(null);
    } catch {
      setProfilePhoto(null);
    }
  }, [storageKey]);

  const sizeStyle = { width: size, height: size };

  return (
    <div
      className={
        "rounded-full overflow-hidden flex items-center justify-center bg-white/25 border border-white/40 " +
        className
      }
      style={sizeStyle}
    >
      {profilePhoto ? (
        <img
          src={profilePhoto}
          alt={user?.email || "Foto de perfil"}
          className="h-full w-full object-cover rounded-full"
        />
      ) : (
        <span className="text-sm font-semibold text-white">{initial}</span>
      )}
    </div>
  );
}
