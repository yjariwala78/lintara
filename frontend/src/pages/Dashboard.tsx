import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { analysisService, authService } from '../services/api';
import AnalysisResult from '../components/AnalysisResult';
import { formatDate, formatDateTime } from '../utils/formatDate';

interface Analysis {
  id: number;
  title: string;
  code_content: string;
  language: string;
  status: string;
  result: string | null;
  created_at: string;
}

export default function Dashboard() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(null);
  const selectedIdRef = useRef<number | null>(null);
  const navigate = useNavigate();
  const username = localStorage.getItem('username');


  useEffect(() => {
    selectedIdRef.current = selectedAnalysis?.id || null;
  }, [selectedAnalysis]);

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const fetchAnalyses = async () => {
    try {
      const data = await analysisService.getAll();
      setAnalyses(data);
      

      if (selectedIdRef.current) {
        const updated = data.find((a: Analysis) => a.id === selectedIdRef.current);
        if (updated) {
          setSelectedAnalysis(updated);
        }
      }
    } catch (err) {
      console.error('Failed to fetch analyses');
    }
  };

  const handleSelectAnalysis = (analysis: Analysis) => {
    setSelectedAnalysis(analysis);
    selectedIdRef.current = analysis.id;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await analysisService.create(title, code, language);
      setTitle('');
      setCode('');
      fetchAnalyses();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit code');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {}
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this analysis ?')) return;
    try {
      await analysisService.delete(id);
      setSelectedAnalysis(null);
      selectedIdRef.current = null;
      fetchAnalyses();
    } catch (err) {
      console.error('Failed to delete');
    }
  };

  const handleReanalyze = async (id: number) => {
    try {
      await analysisService.reanalyze(id);
      fetchAnalyses();
    } catch (err) {
      console.error('Failed to reanalyze');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'processing': return 'bg-yellow-100 text-yellow-700';
      case 'failed': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  useEffect(() => {
    const hasProcessing = analyses.some(a => a.status === 'processing' || a.status === 'pending');
    if (hasProcessing) {
      const interval = setInterval(fetchAnalyses, 5000);
      return () => clearInterval(interval);
    }
  }, [analyses]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lintara</h1>
            <p className="text-sm text-gray-500">Code smarter, not harder</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Welcome, <span className="font-medium">{username}. Learn from every bug you encounter.</span></span>
            <button
              onClick={handleLogout}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Submit Code for Analysis and Reviewing</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-400 text-red-600 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-gray-700 mb-2 font-medium">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                  placeholder="e.g., Fix login function"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                >
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                  <option value="go">Go</option>
                  <option value="rust">Rust</option>
                  <option value="csharp">C#</option>
                  <option value="ruby">Ruby</option>
                  <option value="php">PHP</option>
                  <option value="html">HTML</option>
                  <option value="css">CSS</option>
                  <option value="swift">Swift</option>
                  <option value="kotlin">Kotlin</option>
                  <option value="other">other</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium">Code</label>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition font-mono text-sm"
                  placeholder="Paste your code here..."
                  rows={12}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Analyze Code'}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Your Analyses</h2>
              <button
                onClick={fetchAnalyses}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                ↻ Refresh
              </button>
            </div>

            {analyses.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-5xl mb-4"></div>
                <p className="text-gray-500">No analyses yet.</p>
                <p className="text-gray-400 text-sm">Submit your first code to get started!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {analyses.map((analysis) => (
                  <div
                    key={analysis.id}
                    onClick={() => handleSelectAnalysis(analysis)}
                    className={`p-4 rounded-lg border cursor-pointer transition ${
                      selectedAnalysis?.id === analysis.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{analysis.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {analysis.language} • {formatDate(analysis.created_at)}
                        </p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(analysis.status)}`}>
                        {analysis.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {selectedAnalysis && (
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{selectedAnalysis.title}</h2>
                <p className="text-gray-500 mt-1">
                  {selectedAnalysis.language} • {formatDateTime(selectedAnalysis.created_at)}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleReanalyze(selectedAnalysis.id)}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg transition text-sm font-medium"
                >
                  ↻ Re-analyze
                </button>
                <button
                  onClick={() => handleDelete(selectedAnalysis.id)}
                  className="bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 rounded-lg transition text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <span></span> Submitted Code
                </h3>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm leading-relaxed">
                  <code>{selectedAnalysis.code_content}</code>
                </pre>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <span></span> AI Analysis
                </h3>
                <div className="bg-gray-50 border border-gray-200 p-5 rounded-lg min-h-[200px] max-h-[500px] overflow-y-auto">
                  <AnalysisResult 
                    result={selectedAnalysis.result || ''} 
                    status={selectedAnalysis.status} 
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}