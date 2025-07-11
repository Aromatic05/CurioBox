import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-gray-800">
          CurioBox
        </Link>
        <div className="space-x-4">
          <Link to="/" className="text-gray-800 hover:text-blue-500">商店</Link>
          <Link to="/showcase" className="text-gray-800 hover:text-blue-500">玩家秀</Link>
          <Link to="/login" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            登录/注册
          </Link>
        </div>
      </div>
    </nav>
  );
}
export default Navbar;