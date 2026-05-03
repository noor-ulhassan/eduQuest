import { Upload, MessageSquare, HelpCircle, BookOpen } from 'lucide-react';

const tabs = [
  { id: 'upload', label: 'Upload', icon: Upload },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'quiz', label: 'Quiz', icon: HelpCircle },
  { id: 'companion', label: 'Explain', icon: BookOpen },
];

function Navigation({ activeTab, onTabChange }) {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="flex gap-1 px-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                isActive
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default Navigation;
