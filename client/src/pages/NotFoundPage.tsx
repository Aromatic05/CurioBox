import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="text-center p-10">
      <h1 className="text-5xl font-bold text-red-500">404</h1>
      <p className="text-xl mt-4">页面未找到</p>
      <Link to="/" className="mt-6 inline-block text-blue-500 hover:underline">
        返回首页
      </Link>
    </div>
  );
}
export default NotFoundPage;