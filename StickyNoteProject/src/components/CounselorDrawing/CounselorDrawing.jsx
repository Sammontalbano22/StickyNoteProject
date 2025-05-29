// Use a DiceBear avatar as the Virtual Counselor image
const COUNSELOR_AVATAR_URL = `https://api.dicebear.com/8.x/adventurer/svg?seed=coach&backgroundColor=ffd1dc,b3e5fc&radius=50`;

export default function CounselorDrawing({ size = 44 }) {
  return (
    <img
      src={COUNSELOR_AVATAR_URL}
      alt="Virtual Counselor Avatar"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: '2.5px solid #ffd54f',
        boxShadow: '0 2px 8px #f4a26188',
        background: '#fffbe8',
        objectFit: 'cover',
        display: 'block',
      }}
    />
  );
}
