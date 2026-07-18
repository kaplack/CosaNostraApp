import { useSelector } from 'react-redux';
import { FaUser } from 'react-icons/fa';

function Username() {
  const username = useSelector((state) => state.user.username);

  if (!username) return null;

  return (
    <div className="flex items-center gap-2 text-sm font-semibold">
      <FaUser />
      <span className="capitalize">{username}</span>
    </div>
  );
}

export default Username;
