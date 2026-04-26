import Header from './Header';
import Navigation from './Navigation';

function Layout({ children, activeTab, onTabChange, documentName }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header documentName={documentName} />
      <Navigation activeTab={activeTab} onTabChange={onTabChange} />
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}

export default Layout;
