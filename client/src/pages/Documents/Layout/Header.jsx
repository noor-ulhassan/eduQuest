import { FileText, User } from 'lucide-react';
import { useSelector } from 'react-redux';

function Header({ documentName }) {
  const user = useSelector((state) => state.auth.user);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-gray-900">RAG Reading Companion</h1>
          {documentName && (
            <>
              <span className="text-gray-300">|</span>
              <div className="flex items-center gap-2 text-gray-600">
                <FileText size={16} />
                <span className="text-sm">{documentName}</span>
              </div>
            </>
          )}
        </div>
        {user && (
          <div className="flex items-center gap-2 text-gray-600">
            <User size={16} />
            <span className="text-sm">{user.name || user.username || user.email}</span>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
