import React, { useState } from 'react';
import { FileText, Download, Sparkles, Copy, Check, Trash } from 'lucide-react';

// Simple summarization function
function summarizeText(text: string, numSentences: number = 5): string {
  // Split text into sentences
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  
  if (sentences.length <= numSentences) {
    return text;
  }

  // Calculate word frequency
  const wordFrequency: { [key: string]: number } = {};
  sentences.forEach(sentence => {
    const words = sentence.toLowerCase().match(/\b\w+\b/g) || [];
    words.forEach(word => {
      wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    });
  });

  // Score sentences based on word frequency
  const sentenceScores = sentences.map(sentence => {
    const words = sentence.toLowerCase().match(/\b\w+\b/g) || [];
    const score = words.reduce((acc, word) => acc + (wordFrequency[word] || 0), 0);
    return { sentence, score: score / words.length };
  });

  // Sort sentences by score and get top N
  const topSentences = sentenceScores
    .sort((a, b) => b.score - a.score)
    .slice(0, numSentences)
    .sort((a, b) => sentences.indexOf(a.sentence) - sentences.indexOf(b.sentence))
    .map(item => item.sentence);

  return topSentences.join(' ');
}

function App() {
  const [inputText, setInputText] = useState('');
  const [summarizedText, setSummarizedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [numSentences, setNumSentences] = useState(5);

  const handleSummarize = async () => {
    if (!inputText.trim()) {
      console.log('No input text provided');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSummarizedText('');
    
    try {
      console.log('Generating summary...');
      const summary = summarizeText(inputText, numSentences);
      console.log('Generated summary:', summary);
      setSummarizedText(summary);
    } catch (err: any) {
      console.error('Detailed error:', err);
      setError('Failed to generate summary. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setInputText('');
    setSummarizedText('');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(summarizedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    // Create a blob with the summarized text
    const blob = new Blob([summarizedText], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const url = URL.createObjectURL(blob);
    
    // Create a link and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'summary.docx';
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-6 w-6 text-indigo-600" />
            <h1 className="text-xl font-semibold text-gray-800">TextSummarize</h1>
          </div>
          <nav>
            <ul className="flex space-x-6">
              <li><a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">Home</a></li>
              <li><a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">About</a></li>
              <li><a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">Contact</a></li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Summarize Your Text in Seconds</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Transform lengthy documents into concise summaries instantly - works completely offline!
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
              {error}
            </div>
          )}

          {/* Text Input Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-800">Input Text</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <label htmlFor="sentences" className="text-sm text-gray-600">
                    Number of sentences:
                  </label>
                  <input
                    id="sentences"
                    type="number"
                    min="1"
                    max="20"
                    value={numSentences}
                    onChange={(e) => setNumSentences(Math.max(1, Math.min(20, parseInt(e.target.value) || 5)))}
                    className="w-16 px-2 py-1 border border-gray-300 rounded-md"
                  />
                </div>
                {inputText && (
                  <button 
                    onClick={handleClear}
                    className="flex items-center text-sm text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <Trash className="h-4 w-4 mr-1" />
                    Clear
                  </button>
                )}
              </div>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste or type your text here..."
              className="w-full h-64 p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            ></textarea>
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleSummarize}
                disabled={!inputText.trim() || isLoading}
                className={`flex items-center px-4 py-2 rounded-md text-white font-medium ${
                  !inputText.trim() || isLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                } transition-colors`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Summarizing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Summarize
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Section */}
          {summarizedText && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Summary</h3>
              <div className="p-4 bg-gray-50 rounded-md border border-gray-200 mb-4">
                <p className="text-gray-700 whitespace-pre-wrap">{summarizedText}</p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCopy}
                  className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </>
                  )}
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center px-3 py-2 bg-indigo-600 rounded-md text-white hover:bg-indigo-700 transition-colors"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download as Word
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-12">Why Choose TextSummarize?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">AI-Powered</h3>
              <p className="text-gray-600">Our advanced algorithms extract the most important information from your text.</p>
            </div>
            <div className="bg-indigo-50 p-6 rounded-lg">
              <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Easy Export</h3>
              <p className="text-gray-600">Download your summaries as Word documents with a single click.</p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Download className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Time-Saving</h3>
              <p className="text-gray-600">Get concise summaries in seconds, not hours of manual work.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <FileText className="h-5 w-5 text-indigo-400" />
              <span className="text-lg font-semibold">TextSummarize</span>
            </div>
            <div className="text-gray-400 text-sm">
              © {new Date().getFullYear()} TextSummarize. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;